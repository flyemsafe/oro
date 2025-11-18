# Oro Database Schema

This document describes the database schema, migrations, and how to work with the database.

## Schema Overview

Oro uses PostgreSQL with SQLAlchemy ORM and Alembic for migrations. The schema consists of 4 tables:

### Tables

#### `prompts`
Core table storing AI prompts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Human-readable name |
| content | TEXT | NOT NULL | Prompt text content |
| system_prompt | TEXT | NULL | Optional system instructions |
| description | TEXT | NULL | Optional description |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | NULL | Last update timestamp |

**Indexes:**
- `ix_prompts_name` (UNIQUE) - Fast lookups by name
- `ix_prompts_created_at` - Chronological queries

#### `tags`
Categorization tags for prompts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Tag name |

**Indexes:**
- `ix_tags_name` (UNIQUE) - Fast tag lookups

#### `prompt_tags`
Junction table for many-to-many prompt-tag relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| prompt_id | UUID | PRIMARY KEY, FK → prompts.id | Prompt reference |
| tag_id | INTEGER | PRIMARY KEY, FK → tags.id | Tag reference |

**Foreign Keys:**
- CASCADE DELETE on both columns

#### `executions`
Execution history tracking prompt usage and effectiveness.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| prompt_id | UUID | NOT NULL, FK → prompts.id | Prompt that was executed |
| rating | INTEGER | NULL, CHECK (1-5) | Quality rating |
| success | BOOLEAN | NOT NULL, DEFAULT true | Success indicator |
| notes | TEXT | NULL | Free-text notes |
| executed_at | TIMESTAMP | NOT NULL, DEFAULT now() | Execution timestamp |

**Indexes:**
- `ix_executions_prompt_id` - Fast prompt history queries
- `ix_executions_executed_at` - Chronological queries

**Constraints:**
- `valid_rating` - Ensures rating is between 1 and 5

## Database Setup

### Prerequisites

1. PostgreSQL 12+ running
2. Python dependencies installed:
   ```bash
   pip install -r requirements.txt
   ```

3. Environment configuration:
   ```bash
   # Copy example .env
   cp .env.example .env

   # Edit .env with your database credentials
   DATABASE_URL=postgresql://oro_user:oro_password@localhost:5432/oro_db
   ```

### Initial Setup

1. **Create PostgreSQL database:**
   ```bash
   psql -U postgres
   CREATE DATABASE oro_db;
   CREATE USER oro_user WITH PASSWORD 'oro_password';
   GRANT ALL PRIVILEGES ON DATABASE oro_db TO oro_user;
   ```

2. **Run migrations:**
   ```bash
   # Navigate to backend directory
   cd backend

   # Apply migrations to create tables
   alembic upgrade head
   ```

3. **Seed development data (optional):**
   ```bash
   python -m app.core.seed
   ```

## Working with Migrations

### Check Migration Status

```bash
# Show current migration version
alembic current

# Show migration history
alembic history --verbose
```

### Apply Migrations

```bash
# Upgrade to latest version
alembic upgrade head

# Upgrade by one version
alembic upgrade +1

# Upgrade to specific version
alembic upgrade <revision_id>
```

### Rollback Migrations

```bash
# Downgrade by one version
alembic downgrade -1

# Downgrade to specific version
alembic downgrade <revision_id>

# Downgrade to initial state (drops all tables)
alembic downgrade base
```

### Create New Migrations

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Create empty migration file
alembic revision -m "Description of changes"

# Edit migration file at: alembic/versions/<revision>_description.py
```

## Development Workflow

### 1. Make Model Changes

Edit files in `app/models/`:
- `prompt.py` - Prompt model
- `tag.py` - Tag model
- `prompt_tag.py` - PromptTag junction table
- `execution.py` - Execution model

### 2. Generate Migration

```bash
# Ensure database is at latest version
alembic upgrade head

# Generate migration from model changes
alembic revision --autogenerate -m "Add new field"

# Review generated migration in alembic/versions/
```

### 3. Test Migration

```bash
# Apply migration
alembic upgrade head

# Verify schema
psql -U oro_user -d oro_db -c "\d prompts"

# Test rollback
alembic downgrade -1

# Re-apply
alembic upgrade head
```

### 4. Commit Changes

```bash
git add app/models/ alembic/versions/
git commit -m "feat: add new database field"
```

## Seed Data

The seed script (`app/core/seed.py`) creates sample data for development:

- **5 prompts** - Various use cases (code review, debugging, etc.)
- **5 tags** - coding, documentation, debugging, architecture, testing
- **11 executions** - Varied ratings and success rates

**Usage:**
```bash
python -m app.core.seed
```

**Note:** Seed script will skip if data already exists. To re-seed:
```bash
alembic downgrade base  # Drop all tables
alembic upgrade head    # Recreate tables
python -m app.core.seed # Populate data
```

## Schema Design Decisions

### UUID for Prompts
- **Why:** Better for distributed systems, prevents ID conflicts
- **Trade-off:** Slightly larger storage than INTEGER
- **Benefit:** Future-proof for replication/sharding

### Integer for Tags and Executions
- **Why:** Small, static reference data (tags) and high-volume inserts (executions)
- **Benefit:** Better performance for joins and sorting

### Cascade Deletes
- **All foreign keys use CASCADE DELETE**
- Deleting a prompt automatically removes:
  - Associated prompt_tags entries
  - Associated execution history
- **Rationale:** Maintain referential integrity, prevent orphaned records

### Indexes
- **Name fields:** Unique indexes for fast lookups
- **Timestamps:** Non-unique indexes for chronological queries
- **Foreign keys:** Indexed for join performance

### Timestamps with Timezone
- All timestamps use `timestamp with time zone`
- Server default uses `now()` for consistency
- Updated via SQLAlchemy `onupdate=func.now()`

## Troubleshooting

### Migration Conflicts
```bash
# Check current state
alembic current

# View pending migrations
alembic history

# If migrations are out of sync, stamp the database
alembic stamp head
```

### Connection Issues
```bash
# Test database connection
psql postgresql://oro_user:oro_password@localhost:5432/oro_db

# Check if PostgreSQL is running
sudo systemctl status postgresql

# View PostgreSQL logs
sudo journalctl -u postgresql -n 50
```

### Reset Database
```bash
# Drop all tables
alembic downgrade base

# Recreate from scratch
alembic upgrade head

# Re-seed data
python -m app.core.seed
```

## Production Considerations

1. **Backups:** Implement regular PostgreSQL backups
2. **Connection Pooling:** Configured in `app/database.py` (pool_size=5, max_overflow=10)
3. **Migrations:** Always test migrations on staging before production
4. **Indexes:** Monitor query performance and add indexes as needed
5. **Archival:** Consider archiving old execution records periodically

## Files Reference

```
backend/
├── alembic/
│   ├── versions/
│   │   └── 93f21d1a4d8b_initial_schema_prompts_tags_executions.py
│   ├── env.py          # Alembic environment configuration
│   └── script.py.mako  # Migration template
├── alembic.ini         # Alembic configuration
├── app/
│   ├── core/
│   │   └── seed.py     # Development seed data
│   ├── database.py     # Database connection and session management
│   └── models/
│       ├── __init__.py
│       ├── prompt.py
│       ├── tag.py
│       ├── prompt_tag.py
│       └── execution.py
└── .env.example        # Environment template
```

## Next Steps

1. Implement FastAPI CRUD endpoints (Issue #3)
2. Add Pydantic schemas for validation
3. Write integration tests for database operations
4. Set up CI/CD for automated migration testing

---

**Version:** 0.1.0 (Initial schema)
**Last Updated:** 2025-11-17
