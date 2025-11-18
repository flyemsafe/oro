# API Reference

Oro provides a RESTful API for managing prompts, tags, and tracking execution history. All endpoints are documented below with examples.

## Base Information

- **Base URL**: `http://localhost:8000/api/v1`
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)
- **API Version**: v1
- **Content Type**: `application/json`

## Authentication

Currently, Oro v0.1.0 does not require authentication. Full authentication will be added in v0.4.0.

For v0.1.0:
- No API keys or tokens required
- All endpoints are publicly accessible
- Designed for single-user, local deployment

**Future (v0.4.0+)**:
```bash
# Bearer token authentication
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  http://localhost:8000/api/v1/prompts
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "status": "success",
  "data": {
    /* Response data */
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Prompt with id abc123 not found",
    "details": {
      "resource": "prompts",
      "id": "abc123"
    }
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

## Prompts Endpoints

### List All Prompts

```http
GET /prompts
```

Retrieve all prompts with optional filtering and pagination.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `skip` | integer | No | 0 | Number of prompts to skip |
| `limit` | integer | No | 10 | Maximum prompts to return (max 100) |
| `search` | string | No | - | Search in title and content |
| `tag` | string | No | - | Filter by tag name |
| `is_template` | boolean | No | - | Filter templates only |
| `sort_by` | string | No | created_at | Sort field (title, created_at, updated_at) |
| `order` | string | No | desc | Sort order (asc, desc) |

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/prompts?skip=0&limit=10&sort_by=created_at&order=desc"
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "prompts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Code Review Checklist",
        "description": "Comprehensive checklist for reviewing pull requests",
        "content": "When reviewing code, ensure:\n1. Tests are included\n2. Documentation updated\n...",
        "is_template": false,
        "tags": ["coding", "review"],
        "created_at": "2025-11-17T12:00:00Z",
        "updated_at": "2025-11-17T12:00:00Z",
        "rating": 4.5
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "title": "Data Analysis Prompt",
        "description": null,
        "content": "Analyze the following dataset...",
        "is_template": true,
        "tags": ["analysis", "data"],
        "created_at": "2025-11-17T11:00:00Z",
        "updated_at": "2025-11-17T11:00:00Z",
        "rating": null
      }
    ],
    "total": 42,
    "skip": 0,
    "limit": 10
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Get Single Prompt

```http
GET /prompts/{id}
```

Retrieve a specific prompt with full details including versions and execution history.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | Prompt ID |

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000"
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Code Review Checklist",
    "description": "Comprehensive checklist for reviewing pull requests",
    "content": "When reviewing code, ensure:\n1. Tests are included\n2. Documentation updated\n...",
    "is_template": false,
    "template_variables": null,
    "tags": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "coding",
        "color": "#3b82f6"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "name": "review",
        "color": "#10b981"
      }
    ],
    "created_at": "2025-11-17T12:00:00Z",
    "updated_at": "2025-11-17T12:00:00Z",
    "version_count": 3,
    "execution_count": 12,
    "average_rating": 4.5
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

**Error Response (404 Not Found):**

```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Prompt not found",
    "details": {
      "id": "550e8400-e29b-41d4-a716-446655440000"
    }
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Create Prompt

```http
POST /prompts
```

Create a new prompt.

**Request Body:**

```json
{
  "title": "Code Review Checklist",
  "content": "When reviewing code, ensure:\n1. Tests are included\n2. Documentation updated\n...",
  "description": "Comprehensive checklist for reviewing pull requests",
  "tags": ["coding", "review"],
  "is_template": false,
  "template_variables": null
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Prompt title (1-255 chars) |
| `content` | string | Yes | Prompt content (1-100000 chars) |
| `description` | string | No | Optional description |
| `tags` | array[string] | No | List of tag names |
| `is_template` | boolean | No | Whether prompt is a template |
| `template_variables` | object | No | Template variable definitions |

**Example Request:**

```bash
curl -X POST "http://localhost:8000/api/v1/prompts" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Code Review Checklist",
    "content": "When reviewing code, ensure:\n1. Tests are included\n2. Documentation updated",
    "description": "Comprehensive checklist",
    "tags": ["coding", "review"],
    "is_template": false
  }'
```

**Example Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Code Review Checklist",
    "content": "When reviewing code, ensure:\n1. Tests are included\n2. Documentation updated",
    "description": "Comprehensive checklist",
    "tags": ["coding", "review"],
    "is_template": false,
    "created_at": "2025-11-17T12:00:00Z",
    "updated_at": "2025-11-17T12:00:00Z"
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

**Error Response (422 Unprocessable Entity):**

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "title",
          "message": "Title is required and must be 1-255 characters"
        },
        {
          "field": "content",
          "message": "Content is required"
        }
      ]
    }
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Update Prompt

```http
PUT /prompts/{id}
```

Update an existing prompt.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | Prompt ID |

**Request Body:**

Same as Create Prompt, but all fields are optional.

```json
{
  "title": "Updated Code Review Checklist",
  "content": "Updated content...",
  "description": "Updated description"
}
```

**Example Request:**

```bash
curl -X PUT "http://localhost:8000/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Code Review Checklist",
    "tags": ["coding", "review", "quality"]
  }'
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Code Review Checklist",
    "content": "When reviewing code, ensure:\n1. Tests are included\n2. Documentation updated",
    "tags": ["coding", "review", "quality"],
    "updated_at": "2025-11-17T13:00:00Z",
    "version_count": 2
  },
  "timestamp": "2025-11-17T13:00:00Z"
}
```

### Delete Prompt

```http
DELETE /prompts/{id}
```

Delete a prompt (soft delete - marks as deleted but retains version history).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | Prompt ID |

**Example Request:**

```bash
curl -X DELETE "http://localhost:8000/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000"
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "message": "Prompt deleted successfully",
    "id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

## Tags Endpoints

### List All Tags

```http
GET /tags
```

Retrieve all tags used in the system.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `skip` | integer | No | 0 | Number of tags to skip |
| `limit` | integer | No | 100 | Maximum tags to return |
| `search` | string | No | - | Search tag names |

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/tags"
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "tags": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "coding",
        "description": "Code-related prompts",
        "color": "#3b82f6",
        "prompt_count": 15
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "name": "analysis",
        "description": "Data analysis prompts",
        "color": "#10b981",
        "prompt_count": 8
      }
    ],
    "total": 12
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Create Tag

```http
POST /tags
```

Create a new tag.

**Request Body:**

```json
{
  "name": "security",
  "description": "Security-related prompts",
  "color": "#ef4444"
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tag name (unique, 1-50 chars) |
| `description` | string | No | Optional tag description |
| `color` | string | No | Hex color code (e.g., #3b82f6) |

**Example Request:**

```bash
curl -X POST "http://localhost:8000/api/v1/tags" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "security",
    "description": "Security-related prompts",
    "color": "#ef4444"
  }'
```

**Example Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "name": "security",
    "description": "Security-related prompts",
    "color": "#ef4444",
    "created_at": "2025-11-17T12:00:00Z"
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Update Tag

```http
PUT /tags/{id}
```

Update a tag.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | Tag ID |

**Example Request:**

```bash
curl -X PUT "http://localhost:8000/api/v1/tags/770e8400-e29b-41d4-a716-446655440002" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "#1e40af"
  }'
```

### Delete Tag

```http
DELETE /tags/{id}
```

Delete a tag (removes associations but doesn't delete prompts).

**Example Request:**

```bash
curl -X DELETE "http://localhost:8000/api/v1/tags/770e8400-e29b-41d4-a716-446655440002"
```

## Executions Endpoints

### Get Execution History

```http
GET /prompts/{id}/executions
```

Retrieve execution history for a prompt with ratings and feedback.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | Prompt ID |

**Query Parameters:**

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `skip` | integer | No | 0 |
| `limit` | integer | No | 20 |

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000/executions"
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "prompt_id": "550e8400-e29b-41d4-a716-446655440000",
    "executions": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440005",
        "prompt_id": "550e8400-e29b-41d4-a716-446655440000",
        "executed_at": "2025-11-17T10:30:00Z",
        "model_used": "gpt-4",
        "rating": 5,
        "notes": "Perfect response, very helpful",
        "success": true
      },
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440006",
        "prompt_id": "550e8400-e29b-41d4-a716-446655440000",
        "executed_at": "2025-11-17T09:15:00Z",
        "model_used": "gpt-3.5-turbo",
        "rating": 3,
        "notes": "Good but needed refinement",
        "success": true
      }
    ],
    "total": 12,
    "average_rating": 4.2
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Record Execution

```http
POST /prompts/{id}/executions
```

Record a prompt execution with rating and feedback.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | Prompt ID |

**Request Body:**

```json
{
  "model_used": "gpt-4",
  "rating": 5,
  "notes": "Excellent response, very helpful",
  "success": true
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model_used` | string | No | Model/API used (gpt-4, gpt-3.5-turbo, claude, etc.) |
| `rating` | integer | No | Rating 1-5 stars |
| `notes` | string | No | Feedback notes |
| `success` | boolean | No | Whether execution succeeded |

**Example Request:**

```bash
curl -X POST "http://localhost:8000/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000/executions" \
  -H "Content-Type: application/json" \
  -d '{
    "model_used": "gpt-4",
    "rating": 5,
    "notes": "Excellent response",
    "success": true
  }'
```

**Example Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "prompt_id": "550e8400-e29b-41d4-a716-446655440000",
    "executed_at": "2025-11-17T12:00:00Z",
    "model_used": "gpt-4",
    "rating": 5,
    "notes": "Excellent response",
    "success": true
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

## Versions Endpoints

### Get Version History

```http
GET /prompts/{id}/versions
```

Retrieve full version history for a prompt (Git-backed).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID string | Prompt ID |

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000/versions"
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "prompt_id": "550e8400-e29b-41d4-a716-446655440000",
    "versions": [
      {
        "id": "dd0e8400-e29b-41d4-a716-446655440008",
        "version_number": 3,
        "git_commit_sha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
        "message": "Refined code review criteria",
        "created_at": "2025-11-17T12:00:00Z"
      },
      {
        "id": "ee0e8400-e29b-41d4-a716-446655440009",
        "version_number": 2,
        "git_commit_sha": "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
        "message": "Initial version",
        "created_at": "2025-11-17T11:00:00Z"
      }
    ],
    "total_versions": 2
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Get Specific Version

```http
GET /prompts/{id}/versions/{version_id}
```

Retrieve a specific version of a prompt.

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000/versions/dd0e8400-e29b-41d4-a716-446655440008"
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440008",
    "prompt_id": "550e8400-e29b-41d4-a716-446655440000",
    "version_number": 3,
    "git_commit_sha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "content": "When reviewing code, ensure:\n1. Tests are included\n2. Documentation updated\n3. Code follows style guide\n4. Performance is acceptable",
    "message": "Refined code review criteria",
    "created_at": "2025-11-17T12:00:00Z"
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

## Statistics Endpoints

### Get Statistics

```http
GET /stats
```

Retrieve aggregate statistics about prompts and usage.

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/stats"
```

**Example Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "total_prompts": 42,
    "total_templates": 8,
    "total_tags": 12,
    "total_executions": 234,
    "average_rating": 4.1,
    "rating_distribution": {
      "1": 5,
      "2": 8,
      "3": 22,
      "4": 85,
      "5": 114
    },
    "most_used_tags": [
      {"name": "coding", "count": 15},
      {"name": "analysis", "count": 12},
      {"name": "creative", "count": 8}
    ],
    "most_executed_prompts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Code Review Checklist",
        "executions": 25
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "title": "Data Analysis Prompt",
        "executions": 18
      }
    ]
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

## Error Handling

The API returns consistent error responses with detailed information:

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Resource doesn't exist |
| `DUPLICATE_RESOURCE` | 400 | Resource already exists |
| `OPERATION_FAILED` | 500 | Internal server error |
| `PERMISSION_DENIED` | 403 | Not authorized (v0.4.0+) |

### Example Error Response

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "title",
          "message": "Title must be between 1 and 255 characters"
        }
      ]
    }
  },
  "timestamp": "2025-11-17T12:00:00Z"
}
```

## Rate Limiting

Currently no rate limiting. Will be implemented in v0.4.0+ with API tokens.

## CORS

Configured to allow requests from frontend domain. See `.env` configuration:

```
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

## API Client Libraries

Ready-to-use client implementations coming in future versions.

### JavaScript/TypeScript

```typescript
import { OroClient } from '@oro/sdk';

const client = new OroClient('http://localhost:8000/api/v1');

// List prompts
const prompts = await client.prompts.list();

// Get single prompt
const prompt = await client.prompts.get('550e8400-e29b-41d4-a716-446655440000');

// Create prompt
const newPrompt = await client.prompts.create({
  title: 'My Prompt',
  content: 'Prompt content'
});
```

### Python

```python
from oro_sdk import OroClient

client = OroClient('http://localhost:8000/api/v1')

# List prompts
prompts = client.prompts.list()

# Get single prompt
prompt = client.prompts.get('550e8400-e29b-41d4-a716-446655440000')

# Create prompt
new_prompt = client.prompts.create(
    title='My Prompt',
    content='Prompt content'
)
```

## Changelog

### v1.0 (Current)
- Initial API design
- Prompt CRUD operations
- Tag management
- Execution tracking
- Version history

### v1.1 (Planned)
- Pagination improvements
- Advanced filtering
- Bulk operations

### v1.2 (Planned - v0.4.0)
- Authentication endpoints
- User management
- Permission scopes

---

**See also**: [Architecture](ARCHITECTURE.md) | [Development Guide](DEVELOPMENT.md) | [README](../README.md)

**Interactive API Testing**: Visit `http://localhost:8000/docs` for live Swagger UI documentation.
