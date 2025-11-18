"""Prompt API endpoints"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.crud import prompt as crud_prompt
from app.schemas.prompt import (
    PromptCreate,
    PromptUpdate,
    PromptResponse,
    PromptListResponse,
    ExecutionStats,
)
from app.schemas.tag import TagResponse

router = APIRouter()


def _build_prompt_response(prompt, db: Session) -> PromptResponse:
    """
    Build a PromptResponse from a Prompt model instance.

    Args:
        prompt: Prompt model instance
        db: Database session for fetching stats

    Returns:
        PromptResponse with all data including tags and stats
    """
    # Extract tags from the prompt_tags relationship
    tags = [TagResponse.model_validate(pt.tag) for pt in prompt.tags]

    # Get execution stats
    stats = crud_prompt.get_prompt_stats(db, prompt.id)

    return PromptResponse(
        id=prompt.id,
        name=prompt.name,
        content=prompt.content,
        system_prompt=prompt.system_prompt,
        description=prompt.description,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
        tags=tags,
        execution_stats=stats,
    )


@router.get("", response_model=PromptListResponse)
def list_prompts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    search: Optional[str] = Query(None, description="Search term for name/content/description"),
    tags: Optional[str] = Query(None, description="Comma-separated tag names to filter by"),
    db: Session = Depends(get_db),
):
    """
    List prompts with pagination and optional filters.

    Query parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum number of records to return (default: 100, max: 1000)
    - search: Search term to filter by name, content, or description
    - tags: Comma-separated tag names to filter by (e.g., "python,api")

    Returns:
        PromptListResponse with items, pagination metadata
    """
    # Parse tag filter
    tag_filter = tags.split(",") if tags else None

    # Get prompts with filters
    prompts, total = crud_prompt.get_prompts(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        tag_filter=tag_filter,
    )

    # Build response items
    items = [_build_prompt_response(prompt, db) for prompt in prompts]

    return PromptListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + len(items)) < total,
    )


@router.post("", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(
    prompt: PromptCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new prompt.

    Request body:
    - name: Unique human-readable name (required)
    - content: The actual prompt text (required)
    - system_prompt: Optional system-level instructions for the LLM
    - description: Optional description of what the prompt does
    - tag_ids: Optional list of tag IDs to associate with the prompt

    Returns:
        Created prompt with metadata
    """
    try:
        db_prompt = crud_prompt.create_prompt(db=db, prompt=prompt)
        return _build_prompt_response(db_prompt, db)
    except Exception as e:
        # Handle unique constraint violation
        if "unique constraint" in str(e).lower() or "duplicate key" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Prompt with name '{prompt.name}' already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create prompt: {str(e)}",
        )


@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt(
    prompt_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Get a single prompt by ID.

    Path parameters:
    - prompt_id: UUID of the prompt

    Returns:
        Prompt with all metadata including tags and execution stats
    """
    db_prompt = crud_prompt.get_prompt(db=db, prompt_id=prompt_id)
    if not db_prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt with id '{prompt_id}' not found",
        )
    return _build_prompt_response(db_prompt, db)


@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt(
    prompt_id: UUID,
    prompt_update: PromptUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing prompt.

    Path parameters:
    - prompt_id: UUID of the prompt to update

    Request body (all fields optional):
    - name: Updated name
    - content: Updated content
    - system_prompt: Updated system prompt
    - description: Updated description
    - tag_ids: Updated list of tag IDs (replaces existing tags)

    Returns:
        Updated prompt with metadata
    """
    try:
        db_prompt = crud_prompt.update_prompt(
            db=db, prompt_id=prompt_id, prompt_update=prompt_update
        )
        if not db_prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prompt with id '{prompt_id}' not found",
            )
        return _build_prompt_response(db_prompt, db)
    except HTTPException:
        raise
    except Exception as e:
        # Handle unique constraint violation
        if "unique constraint" in str(e).lower() or "duplicate key" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Prompt with name '{prompt_update.name}' already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update prompt: {str(e)}",
        )


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt(
    prompt_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Delete a prompt.

    Path parameters:
    - prompt_id: UUID of the prompt to delete

    Returns:
        204 No Content on success
    """
    success = crud_prompt.delete_prompt(db=db, prompt_id=prompt_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt with id '{prompt_id}' not found",
        )


@router.get("/{prompt_id}/stats", response_model=ExecutionStats)
def get_prompt_stats(
    prompt_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Get execution statistics for a prompt.

    Path parameters:
    - prompt_id: UUID of the prompt

    Returns:
        Execution statistics including:
        - total_executions: Total number of executions
        - average_rating: Average rating (1-5) or null if no ratings
        - success_rate: Success rate (0-1)
        - last_executed_at: Timestamp of last execution or null
    """
    stats = crud_prompt.get_prompt_stats(db=db, prompt_id=prompt_id)
    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt with id '{prompt_id}' not found",
        )
    return stats
