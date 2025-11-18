"""Pydantic schemas for Prompt API"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class TagBase(BaseModel):
    """Base schema for Tag (used in nested responses)"""
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ExecutionStats(BaseModel):
    """Execution statistics for a prompt"""
    total_executions: int = Field(description="Total number of executions")
    average_rating: Optional[float] = Field(None, description="Average rating (1-5)")
    success_rate: float = Field(description="Success rate (0-1)")
    last_executed_at: Optional[datetime] = Field(None, description="Last execution timestamp")


class PromptBase(BaseModel):
    """Base prompt schema with common fields"""
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Unique human-readable name for the prompt"
    )
    content: str = Field(
        ...,
        min_length=1,
        description="The actual prompt text content"
    )
    system_prompt: Optional[str] = Field(
        None,
        description="Optional system-level instructions for the LLM"
    )
    description: Optional[str] = Field(
        None,
        description="Optional description of what the prompt does"
    )


class PromptCreate(PromptBase):
    """Schema for creating a new prompt"""
    tag_ids: Optional[List[int]] = Field(
        default_factory=list,
        description="Optional list of tag IDs to associate with the prompt"
    )


class PromptUpdate(BaseModel):
    """Schema for updating an existing prompt (all fields optional)"""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Updated name"
    )
    content: Optional[str] = Field(
        None,
        min_length=1,
        description="Updated content"
    )
    system_prompt: Optional[str] = Field(
        None,
        description="Updated system prompt"
    )
    description: Optional[str] = Field(
        None,
        description="Updated description"
    )
    tag_ids: Optional[List[int]] = Field(
        None,
        description="Updated list of tag IDs (replaces existing tags)"
    )


class PromptResponse(PromptBase):
    """Schema for prompt response with metadata"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    tags: List[TagBase] = Field(default_factory=list)
    execution_stats: Optional[ExecutionStats] = None

    model_config = ConfigDict(from_attributes=True)


class PromptListResponse(BaseModel):
    """Schema for paginated prompt list"""
    items: List[PromptResponse]
    total: int
    skip: int
    limit: int
    has_more: bool
