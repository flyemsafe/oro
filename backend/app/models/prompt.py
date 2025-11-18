"""Prompt model for storing AI prompts with version control support"""

from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Prompt(Base):
    """
    Prompt model representing a reusable AI prompt.

    A prompt is the core entity in Oro, containing the actual prompt text,
    optional system instructions, and metadata for organization and tracking.

    Attributes:
        id: Unique UUID identifier
        name: Unique human-readable name (indexed for fast lookups)
        content: The actual prompt text
        system_prompt: Optional system-level instructions for the LLM
        description: Optional description of what the prompt does
        created_at: Timestamp when prompt was created
        updated_at: Timestamp when prompt was last modified
        tags: Related tags via PromptTag junction table
        executions: Related execution history records
    """

    __tablename__ = "prompts"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Unique identifier for the prompt"
    )

    name = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique human-readable name for the prompt"
    )

    content = Column(
        Text,
        nullable=False,
        comment="The actual prompt text content"
    )

    system_prompt = Column(
        Text,
        nullable=True,
        comment="Optional system-level instructions for the LLM"
    )

    description = Column(
        Text,
        nullable=True,
        comment="Optional description of what the prompt does"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Timestamp when prompt was created"
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True,
        comment="Timestamp when prompt was last modified"
    )

    # Relationships
    tags = relationship(
        "PromptTag",
        back_populates="prompt",
        cascade="all, delete-orphan",
        doc="Tags associated with this prompt"
    )

    executions = relationship(
        "Execution",
        back_populates="prompt",
        cascade="all, delete-orphan",
        order_by="desc(Execution.executed_at)",
        doc="Execution history for this prompt"
    )

    def __repr__(self) -> str:
        """String representation for debugging"""
        return f"<Prompt(id={self.id}, name='{self.name}')>"

    def __str__(self) -> str:
        """Human-readable string representation"""
        return f"Prompt: {self.name}"
