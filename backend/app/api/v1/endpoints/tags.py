"""Tag API endpoints"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.crud import tag as crud_tag
from app.crud import prompt as crud_prompt
from app.schemas.tag import (
    TagCreate,
    TagResponse,
    TagListResponse,
    TagAssignment,
)

router = APIRouter()


@router.get("", response_model=TagListResponse)
def list_tags(
    db: Session = Depends(get_db),
):
    """
    List all tags.

    Returns:
        TagListResponse with all tags sorted alphabetically
    """
    tags, total = crud_tag.get_tags(db=db)
    return TagListResponse(
        items=[TagResponse.model_validate(tag) for tag in tags],
        total=total,
    )


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new tag.

    Request body:
    - name: Unique tag name (required)

    Returns:
        Created tag
    """
    # Check if tag already exists
    existing_tag = crud_tag.get_tag_by_name(db=db, name=tag.name)
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tag with name '{tag.name}' already exists",
        )

    try:
        db_tag = crud_tag.create_tag(db=db, tag=tag)
        return TagResponse.model_validate(db_tag)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create tag: {str(e)}",
        )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a tag.

    Path parameters:
    - tag_id: ID of the tag to delete

    Note: This will also remove the tag from all prompts that use it.

    Returns:
        204 No Content on success
    """
    success = crud_tag.delete_tag(db=db, tag_id=tag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id '{tag_id}' not found",
        )


@router.post("/prompts/{prompt_id}/tags", status_code=status.HTTP_204_NO_CONTENT)
def add_tags_to_prompt(
    prompt_id: UUID,
    tag_assignment: TagAssignment,
    db: Session = Depends(get_db),
):
    """
    Add tags to a prompt.

    Path parameters:
    - prompt_id: UUID of the prompt

    Request body:
    - tag_ids: List of tag IDs to add to the prompt

    Note: Duplicate associations are ignored.

    Returns:
        204 No Content on success
    """
    # Check if prompt exists
    prompt = crud_prompt.get_prompt(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt with id '{prompt_id}' not found",
        )

    # Verify all tags exist
    for tag_id in tag_assignment.tag_ids:
        tag = crud_tag.get_tag(db=db, tag_id=tag_id)
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tag with id '{tag_id}' not found",
            )

    try:
        crud_tag.add_tags_to_prompt(
            db=db,
            prompt_id=prompt_id,
            tag_ids=tag_assignment.tag_ids,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to add tags to prompt: {str(e)}",
        )


@router.delete("/prompts/{prompt_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag_from_prompt(
    prompt_id: UUID,
    tag_id: int,
    db: Session = Depends(get_db),
):
    """
    Remove a tag from a prompt.

    Path parameters:
    - prompt_id: UUID of the prompt
    - tag_id: ID of the tag to remove

    Returns:
        204 No Content on success
    """
    success = crud_tag.remove_tag_from_prompt(
        db=db,
        prompt_id=prompt_id,
        tag_id=tag_id,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id '{tag_id}' not associated with prompt '{prompt_id}'",
        )
