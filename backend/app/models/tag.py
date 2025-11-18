"""Tag model for organizing and categorizing prompts"""

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Tag(Base):
    """
    Tag model for categorizing and organizing prompts.

    Tags provide a flexible way to organize prompts by topic, use case,
    or any other categorization scheme. Tags can be associated with
    multiple prompts through the PromptTag junction table.

    Attributes:
        id: Auto-incrementing integer primary key
        name: Unique tag name (indexed for fast lookups)
        prompt_tags: Related prompt associations via PromptTag junction table
    """

    __tablename__ = "tags"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Auto-incrementing unique identifier"
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique tag name"
    )

    # Relationships
    prompt_tags = relationship(
        "PromptTag",
        back_populates="tag",
        cascade="all, delete-orphan",
        doc="Prompts associated with this tag"
    )

    def __repr__(self) -> str:
        """String representation for debugging"""
        return f"<Tag(id={self.id}, name='{self.name}')>"

    def __str__(self) -> str:
        """Human-readable string representation"""
        return f"#{self.name}"
