# Oro Backend

FastAPI backend for the Oro personal prompt management tool.

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL with SQLAlchemy 2.0+ ORM
- **Database Driver**: psycopg 3.2+ (modern PostgreSQL adapter)
- **Migrations**: Alembic
- **Configuration**: Pydantic Settings with environment variables
- **Testing**: pytest with async support
- **Python**: 3.11+

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 13+ (for production)
- pip and virtualenv

## Setup

### 1. Create Python Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGINS`: Allowed frontend origins (comma-separated)
- `SECRET_KEY`: Generate with `openssl rand -hex 32`

### 4. Set Up Database

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE oro_db;
CREATE USER oro_user WITH PASSWORD 'oro_password';
GRANT ALL PRIVILEGES ON DATABASE oro_db TO oro_user;
```

### 5. Run Database Migrations

```bash
# Create initial migration (when models are ready)
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

## Running the Server

### Development Mode

```bash
# Activate virtual environment
source venv/bin/activate

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the built-in runner:

```bash
python -m app.main
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs (Swagger UI): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc
- Health check: http://localhost:8000/health

### Production Mode

```bash
# Run with multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Running Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_main.py

# Run with verbose output
pytest -v
```

## Development

### Code Formatting

```bash
# Format code with black
black app/ tests/

# Lint with flake8
flake8 app/ tests/

# Type checking with mypy
mypy app/
```

### Database Migrations

```bash
# Create a new migration after model changes
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# View current revision
alembic current
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Pydantic settings
│   ├── database.py          # Database connection and session
│   ├── models/              # SQLAlchemy models
│   │   └── __init__.py
│   ├── schemas/             # Pydantic schemas for validation
│   │   └── __init__.py
│   ├── api/                 # API routes
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── routes.py
│   └── core/                # Core utilities
│       ├── __init__.py
│       └── deps.py          # Dependencies (DB session, etc.)
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                   # Test files
│   ├── __init__.py
│   └── test_main.py
├── requirements.txt         # Python dependencies
├── alembic.ini             # Alembic configuration
├── .env.example            # Example environment variables
└── README.md               # This file
```

## API Endpoints

### Health & Status

- `GET /health` - Health check endpoint
- `GET /api/v1/ping` - API ping endpoint
- `GET /api/v1/db-check` - Database connection check

### Documentation

- `GET /docs` - Swagger UI interactive documentation
- `GET /redoc` - ReDoc alternative documentation
- `GET /openapi.json` - OpenAPI schema

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://oro_user:oro_password@localhost:5432/oro_db` |
| `DEBUG` | Enable debug mode | `True` |
| `ENVIRONMENT` | Environment name | `development` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000,http://localhost:3001` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `SECRET_KEY` | Secret key for security | `changeme-in-production` |

## Troubleshooting

### Database Connection Issues

If you get connection errors:

1. Verify PostgreSQL is running: `pg_isready`
2. Check database exists: `psql -l`
3. Verify credentials in `.env` match database user
4. Ensure `DATABASE_URL` uses correct format: `postgresql://user:pass@host:port/dbname`

### Import Errors

If you get module import errors:

1. Ensure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Verify Python version: `python --version` (should be 3.11+)

### Migration Issues

If migrations fail:

1. Check database connection: `alembic current`
2. Verify models are imported in `app/models/__init__.py`
3. Check Alembic configuration in `alembic.ini` and `alembic/env.py`

## Next Steps

1. Define database models in `app/models/`
2. Create Pydantic schemas in `app/schemas/`
3. Implement API endpoints in `app/api/v1/`
4. Write tests in `tests/`
5. Create initial database migration
6. Deploy to production

## License

[License information here]
