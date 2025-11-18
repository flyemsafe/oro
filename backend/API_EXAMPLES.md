# Oro Prompt Management API - Example Requests

This document demonstrates the complete CRUD API for prompts implemented in Issue #3.

## Base URL
```
http://localhost:8000/api/v1
```

## Tag Endpoints

### 1. Create a Tag
```bash
curl -X POST http://localhost:8000/api/v1/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "python"}'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "python"
}
```

### 2. List All Tags
```bash
curl http://localhost:8000/api/v1/tags
```

**Response (200 OK):**
```json
{
  "items": [
    {"id": 1, "name": "api"},
    {"id": 2, "name": "python"},
    {"id": 3, "name": "testing"}
  ],
  "total": 3
}
```

### 3. Delete a Tag
```bash
curl -X DELETE http://localhost:8000/api/v1/tags/1
```

**Response:** `204 No Content`

## Prompt Endpoints

### 1. Create a Prompt (Minimal)
```bash
curl -X POST http://localhost:8000/api/v1/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Code Review",
    "content": "Review this code for bugs and improvements: {code}"
  }'
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Code Review",
  "content": "Review this code for bugs and improvements: {code}",
  "system_prompt": null,
  "description": null,
  "created_at": "2025-11-18T12:00:00Z",
  "updated_at": null,
  "tags": [],
  "execution_stats": {
    "total_executions": 0,
    "average_rating": null,
    "success_rate": 0.0,
    "last_executed_at": null
  }
}
```

### 2. Create a Prompt (Full)
```bash
curl -X POST http://localhost:8000/api/v1/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Docstring Generator",
    "content": "Generate comprehensive docstrings for this Python function: {code}",
    "system_prompt": "You are an expert Python developer focused on documentation best practices.",
    "description": "Generates Google-style docstrings for Python functions",
    "tag_ids": [1, 2]
  }'
```

**Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Python Docstring Generator",
  "content": "Generate comprehensive docstrings for this Python function: {code}",
  "system_prompt": "You are an expert Python developer focused on documentation best practices.",
  "description": "Generates Google-style docstrings for Python functions",
  "created_at": "2025-11-18T12:01:00Z",
  "updated_at": null,
  "tags": [
    {"id": 1, "name": "python"},
    {"id": 2, "name": "api"}
  ],
  "execution_stats": {
    "total_executions": 0,
    "average_rating": null,
    "success_rate": 0.0,
    "last_executed_at": null
  }
}
```

### 3. List Prompts (with Pagination)
```bash
curl "http://localhost:8000/api/v1/prompts?skip=0&limit=10"
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Python Docstring Generator",
      "content": "Generate comprehensive docstrings...",
      "tags": [{"id": 1, "name": "python"}],
      "execution_stats": {...}
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 10,
  "has_more": false
}
```

### 4. Search Prompts
```bash
curl "http://localhost:8000/api/v1/prompts?search=python"
```

**Response:** Returns prompts where name, content, or description contains "python"

### 5. Filter Prompts by Tags
```bash
curl "http://localhost:8000/api/v1/prompts?tags=python,api"
```

**Response:** Returns prompts that have either "python" or "api" tag

### 6. Get Single Prompt
```bash
curl http://localhost:8000/api/v1/prompts/660e8400-e29b-41d4-a716-446655440001
```

**Response (200 OK):** Full prompt details with tags and execution stats

### 7. Update a Prompt
```bash
curl -X PUT http://localhost:8000/api/v1/prompts/660e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "tag_ids": [1, 2, 3]
  }'
```

**Response (200 OK):** Updated prompt with new description and tags

### 8. Delete a Prompt
```bash
curl -X DELETE http://localhost:8000/api/v1/prompts/660e8400-e29b-41d4-a716-446655440001
```

**Response:** `204 No Content`

### 9. Get Prompt Execution Statistics
```bash
curl http://localhost:8000/api/v1/prompts/660e8400-e29b-41d4-a716-446655440001/stats
```

**Response (200 OK):**
```json
{
  "total_executions": 15,
  "average_rating": 4.2,
  "success_rate": 0.93,
  "last_executed_at": "2025-11-18T11:45:00Z"
}
```

## Tag Management for Prompts

### 10. Add Tags to a Prompt
```bash
curl -X POST http://localhost:8000/api/v1/tags/prompts/660e8400-e29b-41d4-a716-446655440001/tags \
  -H "Content-Type: application/json" \
  -d '{"tag_ids": [1, 2]}'
```

**Response:** `204 No Content`

### 11. Remove Tag from a Prompt
```bash
curl -X DELETE http://localhost:8000/api/v1/tags/prompts/660e8400-e29b-41d4-a716-446655440001/tags/1
```

**Response:** `204 No Content`

## Error Responses

### 404 Not Found
```json
{
  "detail": "Prompt with id '660e8400-e29b-41d4-a716-446655440999' not found"
}
```

### 409 Conflict (Duplicate Name)
```json
{
  "detail": "Prompt with name 'Code Review' already exists"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "name"],
      "msg": "String should have at least 1 character"
    }
  ]
}
```

## OpenAPI Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI Schema: http://localhost:8000/openapi.json
