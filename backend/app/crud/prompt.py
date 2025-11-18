"""CRUD operations for Prompt model"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import Integer, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.prompt import Prompt
from app.models.prompt_tag import PromptTag
from app.models.tag import Tag
from app.models.execution import Execution
from app.schemas.prompt import PromptCreate, PromptUpdate, ExecutionStats


def get_prompt(db: Session, prompt_id: UUID) -> Optional[Prompt]:
    """
    Get a single prompt by ID.

    Args:
        db: Database session
        prompt_id: UUID of the prompt

    Returns:
        Prompt object or None if not found
    """
    return db.query(Prompt).options(
        joinedload(Prompt.tags).joinedload(PromptTag.tag)
    ).filter(Prompt.id == prompt_id).first()


def get_prompts(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tag_filter: Optional[List[str]] = None,
) -> tuple[List[Prompt], int]:
    """
    Get list of prompts with pagination and optional filters.

    Args:
        db: Database session
        skip: Number of records to skip (offset)
        limit: Maximum number of records to return
        search: Optional search term to filter by name/content
        tag_filter: Optional list of tag names to filter by

    Returns:
        Tuple of (list of prompts, total count)
    """
    query = db.query(Prompt).options(
        joinedload(Prompt.tags).joinedload(PromptTag.tag)
    )

    # Apply search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Prompt.name.ilike(search_pattern),
                Prompt.content.ilike(search_pattern),
                Prompt.description.ilike(search_pattern),
            )
        )

    # Apply tag filter
    if tag_filter:
        # Join with PromptTag and Tag to filter by tag names
        query = query.join(Prompt.tags).join(PromptTag.tag).filter(
            Tag.name.in_(tag_filter)
        ).distinct()

    # Get total count before pagination
    total = query.count()

    # Apply pagination and ordering
    prompts = query.order_by(Prompt.created_at.desc()).offset(skip).limit(limit).all()

    return prompts, total


def create_prompt(db: Session, prompt: PromptCreate) -> Prompt:
    """
    Create a new prompt.

    Args:
        db: Database session
        prompt: PromptCreate schema with prompt data

    Returns:
        Created Prompt object
    """
    # Create prompt without tags first
    db_prompt = Prompt(
        name=prompt.name,
        content=prompt.content,
        system_prompt=prompt.system_prompt,
        description=prompt.description,
    )
    db.add(db_prompt)
    db.flush()  # Flush to get the ID

    # Add tags if provided
    if prompt.tag_ids:
        for tag_id in prompt.tag_ids:
            prompt_tag = PromptTag(prompt_id=db_prompt.id, tag_id=tag_id)
            db.add(prompt_tag)

    db.commit()
    db.refresh(db_prompt)
    return db_prompt


def update_prompt(
    db: Session, prompt_id: UUID, prompt_update: PromptUpdate
) -> Optional[Prompt]:
    """
    Update an existing prompt.

    Args:
        db: Database session
        prompt_id: UUID of the prompt to update
        prompt_update: PromptUpdate schema with updated data

    Returns:
        Updated Prompt object or None if not found
    """
    db_prompt = get_prompt(db, prompt_id)
    if not db_prompt:
        return None

    # Update fields if provided
    update_data = prompt_update.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    for field, value in update_data.items():
        setattr(db_prompt, field, value)

    # Update tags if provided
    if tag_ids is not None:
        # Remove existing tags
        db.query(PromptTag).filter(PromptTag.prompt_id == prompt_id).delete()
        # Add new tags
        for tag_id in tag_ids:
            prompt_tag = PromptTag(prompt_id=prompt_id, tag_id=tag_id)
            db.add(prompt_tag)

    db.commit()
    db.refresh(db_prompt)
    return db_prompt


def delete_prompt(db: Session, prompt_id: UUID) -> bool:
    """
    Delete a prompt.

    Args:
        db: Database session
        prompt_id: UUID of the prompt to delete

    Returns:
        True if deleted, False if not found
    """
    db_prompt = get_prompt(db, prompt_id)
    if not db_prompt:
        return False

    db.delete(db_prompt)
    db.commit()
    return True


def get_prompt_stats(db: Session, prompt_id: UUID) -> Optional[ExecutionStats]:
    """
    Get execution statistics for a prompt.

    Args:
        db: Database session
        prompt_id: UUID of the prompt

    Returns:
        ExecutionStats object or None if prompt not found
    """
    # Check if prompt exists
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        return None

    # Get execution statistics
    stats = db.query(
        func.count(Execution.id).label("total"),
        func.avg(Execution.rating).label("avg_rating"),
        func.sum(func.cast(Execution.success, Integer)).label("success_count"),
        func.max(Execution.executed_at).label("last_executed"),
    ).filter(Execution.prompt_id == prompt_id).first()

    total = stats.total or 0
    avg_rating = float(stats.avg_rating) if stats.avg_rating else None
    success_count = stats.success_count or 0
    success_rate = success_count / total if total > 0 else 0.0

    return ExecutionStats(
        total_executions=total,
        average_rating=avg_rating,
        success_rate=success_rate,
        last_executed_at=stats.last_executed,
    )
