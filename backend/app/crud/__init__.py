"""CRUD Operations Package"""

from app.crud.prompt import (
    get_prompt,
    get_prompts,
    create_prompt,
    update_prompt,
    delete_prompt,
    get_prompt_stats,
)
from app.crud.tag import (
    get_tag,
    get_tags,
    create_tag,
    delete_tag,
    add_tags_to_prompt,
    remove_tag_from_prompt,
)

__all__ = [
    # Prompt CRUD
    "get_prompt",
    "get_prompts",
    "create_prompt",
    "update_prompt",
    "delete_prompt",
    "get_prompt_stats",
    # Tag CRUD
    "get_tag",
    "get_tags",
    "create_tag",
    "delete_tag",
    "add_tags_to_prompt",
    "remove_tag_from_prompt",
]
