"""Pydantic schemas for Tag API"""

from typing import List

from pydantic import BaseModel, Field, ConfigDict


class TagBase(BaseModel):
    """Base tag schema"""
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique tag name"
    )


class TagCreate(TagBase):
    """Schema for creating a new tag"""
    pass


class TagResponse(TagBase):
    """Schema for tag response"""
    id: int

    model_config = ConfigDict(from_attributes=True)


class TagListResponse(BaseModel):
    """Schema for tag list response"""
    items: List[TagResponse]
    total: int


class TagAssignment(BaseModel):
    """Schema for adding tags to a prompt"""
    tag_ids: List[int] = Field(
        ...,
        min_length=1,
        description="List of tag IDs to add to the prompt"
    )
