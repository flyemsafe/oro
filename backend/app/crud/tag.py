"""CRUD operations for Tag model"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.tag import Tag
from app.models.prompt_tag import PromptTag
from app.schemas.tag import TagCreate


def get_tag(db: Session, tag_id: int) -> Optional[Tag]:
    """
    Get a single tag by ID.

    Args:
        db: Database session
        tag_id: ID of the tag

    Returns:
        Tag object or None if not found
    """
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tag_by_name(db: Session, name: str) -> Optional[Tag]:
    """
    Get a single tag by name.

    Args:
        db: Database session
        name: Name of the tag

    Returns:
        Tag object or None if not found
    """
    return db.query(Tag).filter(Tag.name == name).first()


def get_tags(db: Session) -> tuple[List[Tag], int]:
    """
    Get all tags.

    Args:
        db: Database session

    Returns:
        Tuple of (list of tags, total count)
    """
    tags = db.query(Tag).order_by(Tag.name).all()
    return tags, len(tags)


def create_tag(db: Session, tag: TagCreate) -> Tag:
    """
    Create a new tag.

    Args:
        db: Database session
        tag: TagCreate schema with tag data

    Returns:
        Created Tag object
    """
    db_tag = Tag(name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def delete_tag(db: Session, tag_id: int) -> bool:
    """
    Delete a tag.

    Args:
        db: Database session
        tag_id: ID of the tag to delete

    Returns:
        True if deleted, False if not found
    """
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        return False

    db.delete(db_tag)
    db.commit()
    return True


def add_tags_to_prompt(db: Session, prompt_id: UUID, tag_ids: List[int]) -> List[PromptTag]:
    """
    Add tags to a prompt.

    Args:
        db: Database session
        prompt_id: UUID of the prompt
        tag_ids: List of tag IDs to add

    Returns:
        List of created PromptTag objects
    """
    prompt_tags = []
    for tag_id in tag_ids:
        # Check if association already exists
        existing = db.query(PromptTag).filter(
            PromptTag.prompt_id == prompt_id,
            PromptTag.tag_id == tag_id
        ).first()

        if not existing:
            prompt_tag = PromptTag(prompt_id=prompt_id, tag_id=tag_id)
            db.add(prompt_tag)
            prompt_tags.append(prompt_tag)

    db.commit()
    return prompt_tags


def remove_tag_from_prompt(db: Session, prompt_id: UUID, tag_id: int) -> bool:
    """
    Remove a tag from a prompt.

    Args:
        db: Database session
        prompt_id: UUID of the prompt
        tag_id: ID of the tag to remove

    Returns:
        True if removed, False if association not found
    """
    prompt_tag = db.query(PromptTag).filter(
        PromptTag.prompt_id == prompt_id,
        PromptTag.tag_id == tag_id
    ).first()

    if not prompt_tag:
        return False

    db.delete(prompt_tag)
    db.commit()
    return True
