"""Tests for Prompt API endpoints"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

from app.main import app
from app.database import Base
from app.core.deps import get_db
from app.models.prompt import Prompt
from app.models.tag import Tag
from app.models.execution import Execution

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    """Provide database session for tests"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def sample_tags(db):
    """Create sample tags for testing"""
    tags = [
        Tag(name="python"),
        Tag(name="api"),
        Tag(name="testing"),
    ]
    for tag in tags:
        db.add(tag)
    db.commit()
    for tag in tags:
        db.refresh(tag)
    return tags


class TestPromptCRUD:
    """Test CRUD operations for prompts"""

    def test_create_prompt_minimal(self):
        """Test creating a prompt with minimal required fields"""
        response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Test Prompt",
                "content": "This is a test prompt",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Prompt"
        assert data["content"] == "This is a test prompt"
        assert data["system_prompt"] is None
        assert data["description"] is None
        assert "id" in data
        assert "created_at" in data
        assert data["tags"] == []

    def test_create_prompt_full(self, sample_tags):
        """Test creating a prompt with all fields"""
        response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Full Test Prompt",
                "content": "This is a complete test prompt",
                "system_prompt": "You are a helpful assistant",
                "description": "A test prompt with all fields",
                "tag_ids": [sample_tags[0].id, sample_tags[1].id],
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Full Test Prompt"
        assert data["content"] == "This is a complete test prompt"
        assert data["system_prompt"] == "You are a helpful assistant"
        assert data["description"] == "A test prompt with all fields"
        assert len(data["tags"]) == 2
        tag_names = [tag["name"] for tag in data["tags"]]
        assert "python" in tag_names
        assert "api" in tag_names

    def test_create_prompt_duplicate_name(self):
        """Test creating a prompt with duplicate name fails"""
        # Create first prompt
        client.post(
            "/api/v1/prompts",
            json={
                "name": "Unique Prompt",
                "content": "First prompt",
            },
        )

        # Try to create second prompt with same name
        response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Unique Prompt",
                "content": "Second prompt",
            },
        )
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]

    def test_create_prompt_invalid_tag(self):
        """Test creating a prompt with non-existent tag fails"""
        response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Test Prompt",
                "content": "Test content",
                "tag_ids": [999],  # Non-existent tag
            },
        )
        assert response.status_code == 400

    def test_get_prompt(self):
        """Test retrieving a single prompt by ID"""
        # Create prompt
        create_response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Retrievable Prompt",
                "content": "Test content",
            },
        )
        prompt_id = create_response.json()["id"]

        # Get prompt
        response = client.get(f"/api/v1/prompts/{prompt_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == prompt_id
        assert data["name"] == "Retrievable Prompt"

    def test_get_prompt_not_found(self):
        """Test retrieving non-existent prompt returns 404"""
        fake_id = str(uuid4())
        response = client.get(f"/api/v1/prompts/{fake_id}")
        assert response.status_code == 404

    def test_update_prompt(self, sample_tags):
        """Test updating a prompt"""
        # Create prompt
        create_response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Original Name",
                "content": "Original content",
            },
        )
        prompt_id = create_response.json()["id"]

        # Update prompt
        response = client.put(
            f"/api/v1/prompts/{prompt_id}",
            json={
                "name": "Updated Name",
                "description": "Added description",
                "tag_ids": [sample_tags[0].id],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["content"] == "Original content"  # Unchanged
        assert data["description"] == "Added description"
        assert len(data["tags"]) == 1

    def test_update_prompt_not_found(self):
        """Test updating non-existent prompt returns 404"""
        fake_id = str(uuid4())
        response = client.put(
            f"/api/v1/prompts/{fake_id}",
            json={"name": "Updated Name"},
        )
        assert response.status_code == 404

    def test_delete_prompt(self):
        """Test deleting a prompt"""
        # Create prompt
        create_response = client.post(
            "/api/v1/prompts",
            json={
                "name": "To Delete",
                "content": "Will be deleted",
            },
        )
        prompt_id = create_response.json()["id"]

        # Delete prompt
        response = client.delete(f"/api/v1/prompts/{prompt_id}")
        assert response.status_code == 204

        # Verify deleted
        get_response = client.get(f"/api/v1/prompts/{prompt_id}")
        assert get_response.status_code == 404

    def test_delete_prompt_not_found(self):
        """Test deleting non-existent prompt returns 404"""
        fake_id = str(uuid4())
        response = client.delete(f"/api/v1/prompts/{fake_id}")
        assert response.status_code == 404


class TestPromptList:
    """Test prompt listing with pagination and filters"""

    def test_list_prompts_empty(self):
        """Test listing prompts when none exist"""
        response = client.get("/api/v1/prompts")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert data["skip"] == 0
        assert data["limit"] == 100
        assert data["has_more"] is False

    def test_list_prompts(self):
        """Test listing multiple prompts"""
        # Create prompts
        for i in range(5):
            client.post(
                "/api/v1/prompts",
                json={
                    "name": f"Prompt {i}",
                    "content": f"Content {i}",
                },
            )

        # List prompts
        response = client.get("/api/v1/prompts")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
        assert data["total"] == 5
        assert data["has_more"] is False

    def test_list_prompts_pagination(self):
        """Test pagination with skip and limit"""
        # Create 10 prompts
        for i in range(10):
            client.post(
                "/api/v1/prompts",
                json={
                    "name": f"Prompt {i:02d}",
                    "content": f"Content {i}",
                },
            )

        # Get first page
        response = client.get("/api/v1/prompts?skip=0&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["total"] == 10
        assert data["skip"] == 0
        assert data["limit"] == 3
        assert data["has_more"] is True

        # Get second page
        response = client.get("/api/v1/prompts?skip=3&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["skip"] == 3
        assert data["has_more"] is True

    def test_list_prompts_search(self):
        """Test searching prompts by name/content"""
        # Create prompts
        client.post(
            "/api/v1/prompts",
            json={"name": "Python Tutorial", "content": "Learn Python basics"},
        )
        client.post(
            "/api/v1/prompts",
            json={"name": "JavaScript Guide", "content": "Learn JS"},
        )
        client.post(
            "/api/v1/prompts",
            json={"name": "API Design", "content": "Python API best practices"},
        )

        # Search for "python"
        response = client.get("/api/v1/prompts?search=python")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2  # Matches name and content
        names = [p["name"] for p in data["items"]]
        assert "Python Tutorial" in names
        assert "API Design" in names

    def test_list_prompts_tag_filter(self, sample_tags):
        """Test filtering prompts by tags"""
        # Create prompts with different tags
        client.post(
            "/api/v1/prompts",
            json={
                "name": "Python Prompt",
                "content": "Python content",
                "tag_ids": [sample_tags[0].id],  # python
            },
        )
        client.post(
            "/api/v1/prompts",
            json={
                "name": "API Prompt",
                "content": "API content",
                "tag_ids": [sample_tags[1].id],  # api
            },
        )
        client.post(
            "/api/v1/prompts",
            json={
                "name": "Both Tags",
                "content": "Both content",
                "tag_ids": [sample_tags[0].id, sample_tags[1].id],
            },
        )

        # Filter by python tag
        response = client.get("/api/v1/prompts?tags=python")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        names = [p["name"] for p in data["items"]]
        assert "Python Prompt" in names
        assert "Both Tags" in names


class TestPromptStats:
    """Test prompt execution statistics"""

    def test_get_stats_no_executions(self):
        """Test getting stats for prompt with no executions"""
        # Create prompt
        create_response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Stats Test",
                "content": "Test content",
            },
        )
        prompt_id = create_response.json()["id"]

        # Get stats
        response = client.get(f"/api/v1/prompts/{prompt_id}/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_executions"] == 0
        assert data["average_rating"] is None
        assert data["success_rate"] == 0.0
        assert data["last_executed_at"] is None

    def test_get_stats_with_executions(self, db):
        """Test getting stats for prompt with executions"""
        from uuid import UUID

        # Create prompt
        create_response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Executed Prompt",
                "content": "Test content",
            },
        )
        prompt_id_str = create_response.json()["id"]
        prompt_id = UUID(prompt_id_str)

        # Add executions directly to database
        executions = [
            Execution(prompt_id=prompt_id, rating=5, success=True),
            Execution(prompt_id=prompt_id, rating=4, success=True),
            Execution(prompt_id=prompt_id, rating=3, success=False),
        ]
        for execution in executions:
            db.add(execution)
        db.commit()

        # Get stats
        response = client.get(f"/api/v1/prompts/{prompt_id_str}/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_executions"] == 3
        assert data["average_rating"] == 4.0
        assert data["success_rate"] == pytest.approx(2/3)
        assert data["last_executed_at"] is not None

    def test_get_stats_not_found(self):
        """Test getting stats for non-existent prompt"""
        fake_id = str(uuid4())
        response = client.get(f"/api/v1/prompts/{fake_id}/stats")
        assert response.status_code == 404


class TestTags:
    """Test tag management endpoints"""

    def test_list_tags_empty(self):
        """Test listing tags when none exist"""
        response = client.get("/api/v1/tags")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_create_tag(self):
        """Test creating a tag"""
        response = client.post(
            "/api/v1/tags",
            json={"name": "newtag"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "newtag"
        assert "id" in data

    def test_create_tag_duplicate(self):
        """Test creating duplicate tag fails"""
        client.post("/api/v1/tags", json={"name": "duplicate"})
        response = client.post("/api/v1/tags", json={"name": "duplicate"})
        assert response.status_code == 409

    def test_delete_tag(self):
        """Test deleting a tag"""
        # Create tag
        create_response = client.post("/api/v1/tags", json={"name": "todelete"})
        tag_id = create_response.json()["id"]

        # Delete tag
        response = client.delete(f"/api/v1/tags/{tag_id}")
        assert response.status_code == 204

        # Verify deleted
        list_response = client.get("/api/v1/tags")
        tags = list_response.json()["items"]
        assert not any(tag["id"] == tag_id for tag in tags)

    def test_add_tags_to_prompt(self, sample_tags):
        """Test adding tags to a prompt"""
        # Create prompt
        create_response = client.post(
            "/api/v1/prompts",
            json={"name": "Tag Test", "content": "Test content"},
        )
        prompt_id = create_response.json()["id"]

        # Add tags
        response = client.post(
            f"/api/v1/tags/prompts/{prompt_id}/tags",
            json={"tag_ids": [sample_tags[0].id, sample_tags[1].id]},
        )
        assert response.status_code == 204

        # Verify tags added
        get_response = client.get(f"/api/v1/prompts/{prompt_id}")
        data = get_response.json()
        assert len(data["tags"]) == 2

    def test_remove_tag_from_prompt(self, sample_tags):
        """Test removing a tag from a prompt"""
        # Create prompt with tags
        create_response = client.post(
            "/api/v1/prompts",
            json={
                "name": "Tag Removal Test",
                "content": "Test content",
                "tag_ids": [sample_tags[0].id, sample_tags[1].id],
            },
        )
        prompt_id = create_response.json()["id"]

        # Remove one tag
        response = client.delete(
            f"/api/v1/tags/prompts/{prompt_id}/tags/{sample_tags[0].id}"
        )
        assert response.status_code == 204

        # Verify tag removed
        get_response = client.get(f"/api/v1/prompts/{prompt_id}")
        data = get_response.json()
        assert len(data["tags"]) == 1
        assert data["tags"][0]["id"] == sample_tags[1].id
