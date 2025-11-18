"""Initial schema: prompts, tags, executions

Revision ID: 93f21d1a4d8b
Revises:
Create Date: 2025-11-17 23:50:14.376470

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '93f21d1a4d8b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Create prompts, tags, prompt_tags, and executions tables."""

    # Create prompts table
    op.create_table(
        'prompts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, comment='Unique identifier for the prompt'),
        sa.Column('name', sa.String(length=255), nullable=False, comment='Unique human-readable name for the prompt'),
        sa.Column('content', sa.Text(), nullable=False, comment='The actual prompt text content'),
        sa.Column('system_prompt', sa.Text(), nullable=True, comment='Optional system-level instructions for the LLM'),
        sa.Column('description', sa.Text(), nullable=True, comment='Optional description of what the prompt does'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False, comment='Timestamp when prompt was created'),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True, comment='Timestamp when prompt was last modified'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prompts_name'), 'prompts', ['name'], unique=True)
    op.create_index(op.f('ix_prompts_created_at'), 'prompts', ['created_at'], unique=False)

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='Auto-incrementing unique identifier'),
        sa.Column('name', sa.String(length=100), nullable=False, comment='Unique tag name'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tags_name'), 'tags', ['name'], unique=True)

    # Create prompt_tags junction table
    op.create_table(
        'prompt_tags',
        sa.Column('prompt_id', postgresql.UUID(as_uuid=True), nullable=False, comment='Foreign key to prompts table'),
        sa.Column('tag_id', sa.Integer(), nullable=False, comment='Foreign key to tags table'),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('prompt_id', 'tag_id')
    )

    # Create executions table
    op.create_table(
        'executions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='Auto-incrementing unique identifier'),
        sa.Column('prompt_id', postgresql.UUID(as_uuid=True), nullable=False, comment='Foreign key to the prompt that was executed'),
        sa.Column('rating', sa.Integer(), nullable=True, comment='Optional rating from 1-5 (higher is better)'),
        sa.Column('success', sa.Boolean(), nullable=False, server_default=sa.text('true'), comment='Boolean indicating if execution was successful'),
        sa.Column('notes', sa.Text(), nullable=True, comment='Optional free-text notes about the execution'),
        sa.Column('executed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False, comment='Timestamp when prompt was executed'),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='valid_rating'),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_executions_prompt_id'), 'executions', ['prompt_id'], unique=False)
    op.create_index(op.f('ix_executions_executed_at'), 'executions', ['executed_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema: Drop all tables."""

    # Drop tables in reverse order (respecting foreign key constraints)
    op.drop_index(op.f('ix_executions_executed_at'), table_name='executions')
    op.drop_index(op.f('ix_executions_prompt_id'), table_name='executions')
    op.drop_table('executions')

    op.drop_table('prompt_tags')

    op.drop_index(op.f('ix_tags_name'), table_name='tags')
    op.drop_table('tags')

    op.drop_index(op.f('ix_prompts_created_at'), table_name='prompts')
    op.drop_index(op.f('ix_prompts_name'), table_name='prompts')
    op.drop_table('prompts')
