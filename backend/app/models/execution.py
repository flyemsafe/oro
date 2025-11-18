"""Execution model for tracking prompt usage and effectiveness"""

from sqlalchemy import Column, Integer, Boolean, Text, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Execution(Base):
    """
    Execution model for tracking prompt usage history and effectiveness.

    An execution represents a single use of a prompt, with optional
    rating and notes to track effectiveness over time. This data helps
    identify which prompts work well and which need improvement.

    Attributes:
        id: Auto-incrementing integer primary key
        prompt_id: Foreign key to the prompt that was executed
        rating: Optional rating from 1-5 (higher is better)
        success: Boolean indicating if execution was successful
        notes: Optional free-text notes about the execution
        executed_at: Timestamp when prompt was executed
        prompt: Related Prompt object
    """

    __tablename__ = "executions"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Auto-incrementing unique identifier"
    )

    prompt_id = Column(
        UUID(as_uuid=True),
        ForeignKey("prompts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key to the prompt that was executed"
    )

    rating = Column(
        Integer,
        nullable=True,
        comment="Optional rating from 1-5 (higher is better)"
    )

    success = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Boolean indicating if execution was successful"
    )

    notes = Column(
        Text,
        nullable=True,
        comment="Optional free-text notes about the execution"
    )

    executed_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Timestamp when prompt was executed"
    )

    # Relationships
    prompt = relationship(
        "Prompt",
        back_populates="executions",
        doc="Prompt that was executed"
    )

    # Table-level constraints
    __table_args__ = (
        CheckConstraint(
            'rating >= 1 AND rating <= 5',
            name='valid_rating'
        ),
    )

    def __repr__(self) -> str:
        """String representation for debugging"""
        return (
            f"<Execution(id={self.id}, prompt_id={self.prompt_id}, "
            f"rating={self.rating}, success={self.success})>"
        )

    def __str__(self) -> str:
        """Human-readable string representation"""
        rating_str = f"Rating: {self.rating}/5" if self.rating else "Unrated"
        status = "Success" if self.success else "Failed"
        return f"Execution {self.id}: {status}, {rating_str}"
