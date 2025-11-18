"""
Seed data for development database.

This script populates the database with sample prompts, tags, and executions
for testing and development purposes.

Usage:
    python -m app.core.seed
"""

import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import Prompt, Tag, PromptTag, Execution


def create_sample_tags(db: Session) -> dict[str, Tag]:
    """Create sample tags for organizing prompts."""
    tags_data = [
        "coding",
        "documentation",
        "debugging",
        "architecture",
        "testing",
    ]

    tags = {}
    for tag_name in tags_data:
        tag = Tag(name=tag_name)
        db.add(tag)
        tags[tag_name] = tag

    db.commit()
    print(f"Created {len(tags)} tags")
    return tags


def create_sample_prompts(db: Session, tags: dict[str, Tag]) -> list[Prompt]:
    """Create sample prompts with various configurations."""
    prompts_data = [
        {
            "name": "code-review",
            "content": "Review this code and provide constructive feedback:\n\n{code}",
            "system_prompt": "You are an expert code reviewer focused on best practices, security, and performance.",
            "description": "General purpose code review prompt for any programming language",
            "tags": ["coding", "debugging"],
        },
        {
            "name": "explain-concept",
            "content": "Explain {concept} in simple terms with examples",
            "system_prompt": "You are a patient teacher who explains complex concepts clearly.",
            "description": "Educational prompt for explaining technical concepts",
            "tags": ["documentation"],
        },
        {
            "name": "debug-error",
            "content": "Help me debug this error:\n\nError: {error}\n\nContext: {context}",
            "system_prompt": "You are a debugging expert who provides step-by-step troubleshooting guidance.",
            "description": "Debugging assistant for error messages and stack traces",
            "tags": ["debugging", "coding"],
        },
        {
            "name": "design-pattern",
            "content": "Suggest appropriate design patterns for: {problem}",
            "system_prompt": "You are a software architect with deep knowledge of design patterns.",
            "description": "Architectural guidance for design pattern selection",
            "tags": ["architecture", "coding"],
        },
        {
            "name": "write-tests",
            "content": "Write comprehensive unit tests for this function:\n\n{function}",
            "system_prompt": "You are a testing specialist who writes thorough, maintainable tests.",
            "description": "Generate unit tests for functions and methods",
            "tags": ["testing", "coding"],
        },
    ]

    prompts = []
    for prompt_data in prompts_data:
        tag_names = prompt_data.pop("tags", [])

        prompt = Prompt(**prompt_data)
        db.add(prompt)
        db.flush()  # Get the prompt ID

        # Associate tags with prompt
        for tag_name in tag_names:
            if tag_name in tags:
                prompt_tag = PromptTag(prompt_id=prompt.id, tag_id=tags[tag_name].id)
                db.add(prompt_tag)

        prompts.append(prompt)

    db.commit()
    print(f"Created {len(prompts)} prompts")
    return prompts


def create_sample_executions(db: Session, prompts: list[Prompt]) -> None:
    """Create sample execution records for prompts."""
    # Create varied execution history
    executions_data = [
        # Code review prompt - multiple uses with varying ratings
        {"prompt": prompts[0], "rating": 5, "success": True, "notes": "Excellent feedback on security issues"},
        {"prompt": prompts[0], "rating": 4, "success": True, "notes": "Good suggestions, missed one edge case"},
        {"prompt": prompts[0], "rating": 5, "success": True, "notes": "Perfect review with actionable items"},

        # Explain concept - good results
        {"prompt": prompts[1], "rating": 5, "success": True, "notes": "Very clear explanation with examples"},
        {"prompt": prompts[1], "rating": 4, "success": True, "notes": "Good but could use more examples"},

        # Debug error - mixed results
        {"prompt": prompts[2], "rating": 3, "success": True, "notes": "Identified issue but solution was complex"},
        {"prompt": prompts[2], "rating": 5, "success": True, "notes": "Quick fix, exactly what I needed"},
        {"prompt": prompts[2], "rating": 2, "success": False, "notes": "Suggested fix didn't work"},

        # Design pattern - excellent
        {"prompt": prompts[3], "rating": 5, "success": True, "notes": "Perfect pattern suggestion"},

        # Write tests - varying quality
        {"prompt": prompts[4], "rating": 4, "success": True, "notes": "Good tests but missing edge cases"},
        {"prompt": prompts[4], "rating": 5, "success": True, "notes": "Comprehensive test coverage"},
    ]

    # Create executions with staggered timestamps
    base_time = datetime.now() - timedelta(days=30)
    for i, exec_data in enumerate(executions_data):
        execution = Execution(
            **exec_data,
            executed_at=base_time + timedelta(days=i * 2, hours=i)
        )
        db.add(execution)

    db.commit()
    print(f"Created {len(executions_data)} executions")


def seed_database():
    """Main function to seed the database with sample data."""
    print("Starting database seeding...")

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Create database session
    db = SessionLocal()

    try:
        # Check if data already exists
        existing_tags = db.query(Tag).count()
        if existing_tags > 0:
            print(f"Database already contains {existing_tags} tags. Skipping seed.")
            print("To re-seed, drop all tables first with: alembic downgrade base")
            return

        # Create seed data
        tags = create_sample_tags(db)
        prompts = create_sample_prompts(db, tags)
        create_sample_executions(db, prompts)

        print("\nDatabase seeding completed successfully!")
        print(f"\nSummary:")
        print(f"  - {len(tags)} tags created")
        print(f"  - {len(prompts)} prompts created")
        print(f"  - Execution history added")
        print(f"\nYou can now start the API server and explore the data.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
