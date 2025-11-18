"""API v1 Package"""

from fastapi import APIRouter
from app.api.v1 import routes
from app.api.v1.endpoints import prompts, tags

# Create API v1 router
api_router = APIRouter()

# Include route modules
api_router.include_router(routes.router, tags=["general"])
api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])

__all__ = ["api_router"]
