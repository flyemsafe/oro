"""API v1 Routes"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db

router = APIRouter()


@router.get("/ping")
def ping():
    """
    Simple ping endpoint to verify API is responsive.

    Returns:
        dict: Pong response with status
    """
    return {"status": "ok", "message": "pong"}


@router.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    """
    Check database connection.

    Args:
        db: Database session dependency

    Returns:
        dict: Database connection status
    """
    try:
        # Execute a simple query to verify connection
        db.execute("SELECT 1")
        return {
            "status": "ok",
            "message": "Database connection successful",
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}",
        }
