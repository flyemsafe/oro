"""Junction table for many-to-many relationship between Prompts and Tags"""

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class PromptTag(Base):
    """
    Junction table connecting Prompts and Tags.

    This table implements a many-to-many relationship between prompts
    and tags, allowing a prompt to have multiple tags and a tag to be
    associated with multiple prompts.

    Attributes:
        prompt_id: Foreign key to prompts table (UUID)
        tag_id: Foreign key to tags table (Integer)
        prompt: Related Prompt object
        tag: Related Tag object
    """

    __tablename__ = "prompt_tags"

    prompt_id = Column(
        UUID(as_uuid=True),
        ForeignKey("prompts.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Foreign key to prompts table"
    )

    tag_id = Column(
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Foreign key to tags table"
    )

    # Relationships
    prompt = relationship(
        "Prompt",
        back_populates="tags",
        doc="Prompt associated with this tag"
    )

    tag = relationship(
        "Tag",
        back_populates="prompt_tags",
        doc="Tag associated with this prompt"
    )

    def __repr__(self) -> str:
        """String representation for debugging"""
        return f"<PromptTag(prompt_id={self.prompt_id}, tag_id={self.tag_id})>"

    def __str__(self) -> str:
        """Human-readable string representation"""
        return f"PromptTag: {self.prompt_id} <-> {self.tag_id}"
