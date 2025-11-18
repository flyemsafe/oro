# Oro Architecture

## Overview

Oro is a full-stack personal prompt management system with Git-backed version control, built around the core principle of owning your data. The architecture follows a separation of concerns pattern with a FastAPI backend, Next.js frontend, and PostgreSQL database.

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP/WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (React 18)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ App Router | Components | TanStack Query | UI Layer│   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI Backend (Python 3.11+)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Routes | Business Logic | ORM Layer | Git Mgmt │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
         │                      │
         │                      ▼
         │         ┌──────────────────────┐
         │         │  PostgreSQL Database │
         │         │  (Prompt Data, Tags) │
         │         └──────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │  Git Repository          │
    │  (Version History)       │
    └──────────────────────────┘
```

## Tech Stack

### Backend
- **Framework**: FastAPI 0.104+ - Modern, fast Python web framework with automatic API documentation
- **ORM**: SQLAlchemy 2.0+ - SQL toolkit and object-relational mapper
- **Database**: PostgreSQL 14+ - Advanced relational database
- **Async**: asyncio with async/await support throughout
- **Validation**: Pydantic 2.0+ - Data validation using Python type hints
- **Version Control**: GitPython - Git integration for prompt versioning
- **Migration**: Alembic - Lightweight database migration tool
- **Testing**: pytest with pytest-asyncio - Comprehensive testing framework

### Frontend
- **Framework**: Next.js 14+ - React framework with App Router
- **Language**: TypeScript - Type-safe JavaScript
- **Styling**: Tailwind CSS - Utility-first CSS framework
- **Components**: shadcn/ui - Built on Radix UI and Tailwind CSS
- **Data Fetching**: TanStack Query - Server state management
- **Form Handling**: React Hook Form - Performant form validation
- **HTTP Client**: axios - Promise-based HTTP client
- **Testing**: Jest + React Testing Library - Component and unit testing

### Deployment
- **Containerization**: Podman/Docker
- **Container Init**: Systemd Quadlet
- **Process Manager**: Systemd (for production)
- **Reverse Proxy**: HAProxy or Nginx (for production)

## Database Schema

### Core Tables

#### `prompts`
Main table for storing prompt content and metadata.

```sql
prompts:
  - id (UUID, Primary Key)
  - title (String, Not Null)
  - content (Text, Not Null)
  - description (Text, Optional)
  - created_at (DateTime, Not Null)
  - updated_at (DateTime, Not Null)
  - created_by (String, Future: user reference)
  - is_template (Boolean, Default: false)
  - template_variables (JSON, Optional)
```

#### `tags`
Tags for organizing and categorizing prompts.

```sql
tags:
  - id (UUID, Primary Key)
  - name (String, Unique, Not Null)
  - description (Text, Optional)
  - created_at (DateTime, Not Null)
  - color (String, Optional) # For UI display
```

#### `prompt_tags` (Junction Table)
Many-to-many relationship between prompts and tags.

```sql
prompt_tags:
  - prompt_id (UUID, Foreign Key -> prompts.id)
  - tag_id (UUID, Foreign Key -> tags.id)
  - Primary Key (prompt_id, tag_id)
```

#### `prompt_executions`
Track execution history and effectiveness.

```sql
prompt_executions:
  - id (UUID, Primary Key)
  - prompt_id (UUID, Foreign Key -> prompts.id)
  - executed_at (DateTime, Not Null)
  - model_used (String, Optional)
  - rating (Integer, 1-5, Optional)
  - notes (Text, Optional)
  - success (Boolean, Default: true)
  - created_at (DateTime, Not Null)
```

#### `prompt_versions`
Git-backed version history.

```sql
prompt_versions:
  - id (UUID, Primary Key)
  - prompt_id (UUID, Foreign Key -> prompts.id)
  - git_commit_sha (String, Not Null, Unique)
  - version_number (Integer, Not Null)
  - content (Text, Not Null)
  - message (String, Optional) # Commit message
  - created_at (DateTime, Not Null)
```

### Entity Relationship Diagram

```
┌──────────────┐
│   prompts    │
├──────────────┤
│ id (PK)      │
│ title        │
│ content      │
│ is_template  │
└──────────────┘
      │
      │ 1:N
      │
      ▼
┌──────────────────┐     ┌──────────────┐
│ prompt_versions  │     │ prompt_tags  │◄──────┐
├──────────────────┤     ├──────────────┤       │
│ id (PK)          │     │ prompt_id (FK)       │ N:M
│ prompt_id (FK)   │     │ tag_id (FK)  │       │
│ git_commit_sha   │     └──────────────┘       │
│ content          │                            │
└──────────────────┘     ┌──────────────┐       │
                         │    tags      │───────┘
      ┌──────────────────┤──────────────┤
      │ 1:N              │ id (PK)      │
      │                  │ name         │
      ▼                  └──────────────┘
┌──────────────────────┐
│ prompt_executions    │
├──────────────────────┤
│ id (PK)              │
│ prompt_id (FK)       │
│ executed_at          │
│ rating (1-5)         │
│ notes                │
└──────────────────────┘
```

## API Structure

### API Routes

All API endpoints are namespaced under `/api/v1` to allow for future versioning.

#### Prompt Routes
- `GET /api/v1/prompts` - List all prompts (with pagination, filtering, search)
- `GET /api/v1/prompts/{id}` - Get single prompt with full details
- `POST /api/v1/prompts` - Create new prompt
- `PUT /api/v1/prompts/{id}` - Update prompt
- `DELETE /api/v1/prompts/{id}` - Delete prompt (soft delete)
- `GET /api/v1/prompts/{id}/versions` - Get version history
- `GET /api/v1/prompts/{id}/versions/{version_id}` - Get specific version

#### Tag Routes
- `GET /api/v1/tags` - List all tags
- `POST /api/v1/tags` - Create new tag
- `PUT /api/v1/tags/{id}` - Update tag
- `DELETE /api/v1/tags/{id}` - Delete tag

#### Execution Routes
- `GET /api/v1/prompts/{id}/executions` - Get execution history for a prompt
- `POST /api/v1/prompts/{id}/executions` - Record prompt execution with rating
- `GET /api/v1/stats` - Get aggregate statistics (ratings distribution, usage patterns)

#### Templates Routes
- `GET /api/v1/templates` - List all template prompts
- `POST /api/v1/templates/{id}/instantiate` - Create new prompt from template

### Response Format

All API responses follow a consistent format:

```json
{
  "status": "success|error",
  "data": { /* Response data */ },
  "message": "Optional message",
  "timestamp": "2025-11-17T12:00:00Z"
}
```

Error responses:
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* Additional context */ }
  }
}
```

## Frontend Architecture

### App Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── prompts/                 # Prompt routes
│   │   ├── page.tsx            # List prompts
│   │   ├── [id]/               # Dynamic prompt page
│   │   │   ├── page.tsx
│   │   │   └── edit.tsx
│   │   └── new/                # New prompt form
│   │       └── page.tsx
│   ├── templates/              # Template routes
│   ├── search/                 # Search results
│   └── api/                    # API routes (optional)
├── components/                 # Reusable components
│   ├── ui/                    # shadcn/ui components
│   ├── prompts/               # Prompt-specific components
│   │   ├── PromptCard.tsx
│   │   ├── PromptForm.tsx
│   │   ├── PromptList.tsx
│   │   ├── VersionHistory.tsx
│   │   └── RatingWidget.tsx
│   ├── tags/                  # Tag components
│   │   ├── TagBadge.tsx
│   │   └── TagManager.tsx
│   ├── search/                # Search components
│   │   └── SearchBar.tsx
│   └── layout/                # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/                       # Utility functions
│   ├── api.ts                # API client
│   ├── hooks/                # Custom React hooks
│   │   ├── usePrompts.ts
│   │   ├── useTags.ts
│   │   └── useSearch.ts
│   └── utils.ts              # Helper functions
├── styles/                    # Global styles
│   └── globals.css
└── public/                    # Static assets
    ├── images/
    └── icons/
```

### State Management

**TanStack Query (React Query)**:
- Server state management for API data
- Automatic caching and synchronization
- Optimistic updates for prompts

**React Hook Form**:
- Form state for prompt creation/editing
- Validation with Zod or similar
- Error handling

**URL State**:
- Search queries
- Filters
- Pagination
- Selected prompt

### Component Patterns

**Page Components**:
- Server or client components based on Next.js 14 best practices
- Fetch data at page level
- Handle loading and error states

**Feature Components**:
- Modular, focused components
- Accept data via props
- Emit events via callbacks or mutations

**UI Components**:
- shadcn/ui components for consistency
- Customizable via Tailwind classes
- Accessible with ARIA attributes

## Data Flow

### Creating a Prompt

```
User Input Form
    ↓
React Hook Form (Validation)
    ↓
TanStack Query Mutation
    ↓
POST /api/v1/prompts
    ↓
FastAPI Handler
    ↓
SQLAlchemy ORM (Insert into prompts table)
    ↓
Git Integration (Commit to repository)
    ↓
Database Transaction Commit
    ↓
Response to Frontend
    ↓
TanStack Query Cache Update
    ↓
UI Update
```

### Retrieving Prompts

```
User Navigates to Prompts Page
    ↓
TanStack Query (useQuery)
    ↓
Check Cache (if fresh, use cached data)
    ↓
If stale or missing: GET /api/v1/prompts
    ↓
FastAPI Handler
    ↓
SQLAlchemy Query (with filters, pagination)
    ↓
Database Retrieval
    ↓
Serialize to JSON
    ↓
TanStack Query Cache Update
    ↓
React Re-render
    ↓
Display List
```

### Version Control Flow

```
Prompt Updated
    ↓
Check for Git Repository
    ↓
Stage Changes
    ↓
Create Commit (GitPython)
    ↓
Store Commit SHA in prompt_versions table
    ↓
Update prompt.updated_at
    ↓
Version History Available in UI
```

## Git Integration

### Repository Structure

Each Oro instance maintains a Git repository for version control:

```
~/.oro/prompts.git/
├── .git/
├── README.md
├── prompts/
│   ├── code/
│   │   ├── debugging.md
│   │   ├── refactoring.md
│   │   └── architecture.md
│   ├── analysis/
│   │   └── data-analysis.md
│   └── creative/
│       └── storytelling.md
└── metadata.json
```

### Commit Strategy

- **Automatic commits**: Each prompt creation/update triggers a commit
- **Meaningful messages**: Commit messages include prompt title and operation
- **Branching**: Main branch stores all prompts; future versions may support feature branches
- **Ancestry**: Full Git history available for audit and recovery

## Security Considerations

### Current (v0.1.0)
- No authentication (single-user, local development)
- File-based permissions on Git repository
- SQLite or local PostgreSQL without network exposure

### Future (v0.4.0+)
- User authentication and authorization
- Role-based access control
- Prompt ownership and sharing permissions
- API token authentication
- HTTPS enforced
- Rate limiting
- Input sanitization and validation

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns (title, tags, created_at)
- Pagination for prompt lists
- Lazy loading of related data

### Frontend Optimization
- Code splitting via Next.js dynamic imports
- Image optimization with Next.js Image component
- Caching strategy with TanStack Query
- Debounced search queries

### Caching Strategy
- Browser cache for static assets
- TanStack Query for API response caching
- Database query result caching (future)

## Deployment Architecture

### Development
- Local PostgreSQL instance
- FastAPI dev server with hot reload
- Next.js dev server with hot module replacement

### Production
- Containerized FastAPI (Podman)
- Containerized PostgreSQL (Podman)
- Containerized Next.js (Podman)
- Systemd Quadlet for orchestration
- HAProxy for reverse proxy and TLS termination

### Storage
- Application code: Container image
- Database data: Named volume
- Git repository: Bind mount or volume
- Configuration: Environment variables or mounted secrets

## Testing Architecture

### Backend Testing
```
tests/
├── unit/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── integration/
│   ├── test_prompts_api.py
│   ├── test_tags_api.py
│   └── test_executions_api.py
└── conftest.py
```

### Frontend Testing
```
__tests__/
├── unit/
│   └── components/
├── integration/
│   └── pages/
└── e2e/
    └── flows/
```

Test Coverage Targets:
- Backend: 80%+ coverage for critical paths
- Frontend: 70%+ coverage for components

## Future Evolution (v2.0+)

### Planned Enhancements
- WebSocket support for real-time collaboration
- Multi-user with sharing and permissions
- Advanced search with ElasticSearch (optional)
- Prompt analytics and insights
- Integration with LLM providers
- CLI tool for managing prompts
- Browser extension for quick capture
- Mobile app (React Native)
- GraphQL API alternative

---

**See also**: [Development Guide](DEVELOPMENT.md) | [API Reference](API.md) | [README](../README.md)
