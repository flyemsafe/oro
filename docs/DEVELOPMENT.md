# Development Guide

## Prerequisites

Before setting up the Oro development environment, ensure you have:

- **Python** 3.11 or higher
- **Node.js** 18+ with npm
- **PostgreSQL** 14+ (or SQLite for quick local development)
- **Git** 2.25+
- **pip** and **npm** package managers
- A code editor (VS Code, PyCharm, Neovim, etc.)

### Verification

```bash
python3 --version      # Python 3.11+
node --version         # v18+
npm --version          # 8+
psql --version         # PostgreSQL 14+ (if using PostgreSQL)
git --version          # 2.25+
```

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/flyemsafe/oro.git
cd oro
```

### 2. Backend Setup (5 minutes)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-dev.txt

# Set up environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
```

Backend will be available at: **http://localhost:8000**
API documentation at: **http://localhost:8000/docs**

### 3. Frontend Setup (5 minutes)

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### 4. Verify Installation

```bash
# Test backend
curl http://localhost:8000/api/v1/health

# Test frontend (check browser)
open http://localhost:3000
```

## Detailed Setup

### Backend Setup

#### 1. Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows PowerShell
# OR
venv\Scripts\activate.bat  # Windows CMD

# Verify activation (should show (venv) in prompt)
which python  # Linux/Mac - should point to venv
where python  # Windows
```

#### 2. Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements-dev.txt

# Verify installations
python -c "import fastapi; print(f'FastAPI {fastapi.__version__}')"
python -c "import sqlalchemy; print(f'SQLAlchemy {sqlalchemy.__version__}')"
```

#### 3. Database Setup

**Using PostgreSQL (Recommended for production-like testing):**

```bash
# Create database
createdb oro_dev

# Create user (optional, for local PostgreSQL)
createuser oro_user
psql -c "ALTER USER oro_user WITH PASSWORD 'oro_password';"

# Configure .env
DATABASE_URL=postgresql://oro_user:oro_password@localhost/oro_dev

# Run migrations
alembic upgrade head

# Check migrations
alembic current
```

**Using SQLite (Quick local development):**

```bash
# Configure .env
DATABASE_URL=sqlite:///./oro_dev.db

# Run migrations
alembic upgrade head
```

#### 4. Environment Configuration

Create `.env` in project root:

```bash
# Database
DATABASE_URL=postgresql://oro_user:oro_password@localhost/oro_dev
# OR
DATABASE_URL=sqlite:///./oro_dev.db

# Server
DEBUG=true
LOG_LEVEL=debug

# JWT (for future auth)
SECRET_KEY=your-secret-key-min-32-chars-long-required-for-production

# Git
GIT_REPO_PATH=~/.oro/prompts.git

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# API
API_TITLE=Oro API
API_VERSION=v1
```

#### 5. Start Backend Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode (without reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Access at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs** (Swagger UI)
ReDoc: **http://localhost:8000/redoc**

### Frontend Setup

#### 1. Install Dependencies

```bash
cd frontend

npm install
# OR (if using yarn)
yarn install
```

#### 2. Environment Configuration

Create `frontend/.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Oro
NEXT_PUBLIC_APP_VERSION=0.1.0

# Feature Flags
NEXT_PUBLIC_ENABLE_TEMPLATES=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### 3. Start Development Server

```bash
npm run dev
# OR
yarn dev
```

Access at: **http://localhost:3000**

The dev server includes:
- Hot Module Replacement (HMR)
- Fast Refresh for React components
- Build error overlay

## Database Management

### Migrations

Oro uses Alembic for database migrations:

```bash
# Create new migration
alembic revision --autogenerate -m "description of changes"

# Example:
alembic revision --autogenerate -m "add_rating_to_executions"

# Review migration in migrations/versions/
# Edit if needed

# Apply migration
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View current database version
alembic current

# View migration history
alembic history --verbose
```

### Database Operations

```bash
# Connect to database
psql oro_dev  # PostgreSQL
sqlite3 oro_dev.db  # SQLite

# Reset database (CAUTION: Deletes all data)
# PostgreSQL:
dropdb oro_dev
createdb oro_dev
alembic upgrade head

# SQLite:
rm oro_dev.db
alembic upgrade head

# Seed sample data (if available)
python scripts/seed_db.py

# Backup database
pg_dump oro_dev > backup.sql  # PostgreSQL
cp oro_dev.db oro_dev.db.backup  # SQLite
```

## Testing

### Backend Testing

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/unit/test_models.py

# Run tests matching pattern
pytest -k "test_create_prompt"

# Run with coverage
pytest --cov=app --cov-report=html

# Run with output
pytest -s  # Show print statements

# Run in parallel
pytest -n auto  # Requires pytest-xdist
```

### Frontend Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- prompts.test.tsx
```

### Test Structure

**Backend:**
```
tests/
├── conftest.py              # Pytest configuration
├── unit/
│   ├── test_models.py
│   ├── test_schemas.py
│   └── test_utils.py
├── integration/
│   ├── test_prompts_api.py
│   ├── test_tags_api.py
│   └── test_executions_api.py
└── fixtures/
    ├── prompts.py          # Test data fixtures
    └── database.py
```

**Frontend:**
```
frontend/__tests__/
├── unit/
│   └── components/
│       └── PromptCard.test.tsx
├── integration/
│   └── pages/
│       └── prompts.test.tsx
└── setup.ts               # Test configuration
```

## Code Style & Linting

### Python Code Style

```bash
# Format code with Black
black app

# Organize imports with isort
isort app

# Type checking with mypy
mypy app

# Lint with Flake8
flake8 app

# Run all formatters
black app && isort app && mypy app
```

### TypeScript/JavaScript Code Style

```bash
# Format with Prettier
npm run format

# Lint with ESLint
npm run lint

# Fix linting issues automatically
npm run lint -- --fix
```

### Git Hooks

Set up pre-commit hooks to enforce style:

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Install git hooks
pre-commit install

# Run hooks on all files
pre-commit run --all-files
```

**`.pre-commit-config.yaml` example:**
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.11.0
    hooks:
      - id: black

  - repo: https://github.com/PyCQA/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.0
    hooks:
      - id: mypy

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-yaml
      - id: trailing-whitespace
      - id: end-of-file-fixer
```

## Commit Conventions

Oro follows Conventional Commits format for clear commit history:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring without feature/fix
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (deps, config, etc.)

**Examples:**
```bash
git commit -m "feat(prompts): add template support"
git commit -m "fix(api): handle null values in prompt content"
git commit -m "docs: update development setup guide"
git commit -m "test(frontend): add PromptForm component tests"
git commit -m "chore(deps): upgrade fastapi to 0.105.0"
```

## Git Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/feature-name
# OR
git checkout -b fix/bug-name
```

### Making Changes

```bash
# Make changes to files
# Edit prompts, tests, docs, etc.

# Check status
git status

# Stage changes
git add .
# OR stage specific files
git add app/models.py frontend/components/PromptForm.tsx

# Commit with conventional message
git commit -m "feat(prompts): add rating system"
```

### Pushing Changes

```bash
# Push to branch
git push origin feature/feature-name

# For new branch (set upstream)
git push -u origin feature/feature-name

# Force push (use carefully, only for local branches)
git push --force-with-lease origin feature/feature-name
```

### Creating Pull Request

```bash
# Use GitHub CLI (recommended)
gh pr create --title "feat: add rating system" \
  --body "Add 1-5 star rating to track prompt effectiveness"

# Or visit GitHub and create PR manually
```

### Merging Changes

```bash
# Update main branch
git checkout main
git pull origin main

# Merge feature branch
git merge feature/feature-name

# Or squash commits (cleaner history)
git merge --squash feature/feature-name
git commit -m "feat: add rating system"

# Delete branch after merge
git branch -d feature/feature-name
git push origin --delete feature/feature-name
```

## Running the Full Stack

### Option 1: Multiple Terminals

```bash
# Terminal 1 - Backend
source venv/bin/activate
cd ~/oro
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd ~/oro/frontend
npm run dev

# Terminal 3 - Database (if using PostgreSQL GUI)
psql oro_dev
```

### Option 2: Using tmux/screen

```bash
# Create tmux session
tmux new-session -d -s oro

# Create windows
tmux new-window -t oro -n backend
tmux new-window -t oro -n frontend

# Start servers
tmux send-keys -t oro:backend "cd ~/oro && source venv/bin/activate && uvicorn app.main:app --reload" Enter
tmux send-keys -t oro:frontend "cd ~/oro/frontend && npm run dev" Enter

# Attach to session
tmux attach -t oro

# Kill session when done
tmux kill-session -t oro
```

### Option 3: Docker Compose (Future)

```bash
docker-compose up --build
```

Will be available in v0.2.0 with containerized setup.

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find process using port
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
uvicorn app.main:app --reload --port 8001
```

**Database connection error:**
```bash
# Check PostgreSQL is running
psql -l  # List databases

# Start PostgreSQL service
brew services start postgresql  # Mac
sudo systemctl start postgresql  # Linux
```

**Module not found errors:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements-dev.txt

# Check Python path
python -c "import sys; print(sys.path)"
```

**Alembic migration failures:**
```bash
# Check current state
alembic current

# Mark migration as complete (if schema updated manually)
alembic stamp head

# Downgrade and retry
alembic downgrade -1
alembic upgrade head
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -i :3000  # Mac/Linux

# Or use different port
npm run dev -- -p 3001
```

**Dependencies conflict:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
npm install
```

**Build errors:**
```bash
# Clean Next.js cache
rm -rf .next

# Rebuild
npm run build

# Check for TypeScript errors
npm run type-check
```

### Common Solutions

```bash
# Update all dependencies
pip list --outdated
npm outdated

# Reinstall from scratch
# Backend:
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt

# Frontend:
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

## Development Best Practices

### Backend

1. **Type Hints**: Always use type hints for function arguments and returns
   ```python
   async def get_prompt(prompt_id: UUID) -> Prompt:
       ...
   ```

2. **Error Handling**: Use appropriate HTTP status codes and error messages
   ```python
   from fastapi import HTTPException, status

   if not prompt:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Prompt not found"
       )
   ```

3. **Async/Await**: Use async operations for I/O
   ```python
   async def fetch_data():
       async with httpx.AsyncClient() as client:
           response = await client.get(url)
           return response.json()
   ```

4. **Testing**: Write tests alongside features
   ```python
   def test_create_prompt():
       response = client.post("/api/v1/prompts", json={...})
       assert response.status_code == 201
   ```

### Frontend

1. **Component Organization**: Keep components focused and reusable
2. **Type Safety**: Use TypeScript, avoid `any` types
3. **Performance**: Use React.memo for expensive components
4. **Accessibility**: Include ARIA attributes and semantic HTML
   ```tsx
   <button aria-label="Delete prompt" onClick={onDelete}>
     <TrashIcon />
   </button>
   ```

5. **Error Boundaries**: Wrap feature areas with error boundaries
   ```tsx
   <ErrorBoundary fallback={<ErrorMessage />}>
     <PromptList />
   </ErrorBoundary>
   ```

## Performance Profiling

### Backend

```bash
# Profile with cProfile
python -m cProfile -s cumtime -m uvicorn app.main:app

# Memory profiling
pip install memory-profiler
python -m memory_profiler app.py
```

### Frontend

```bash
# Check bundle size
npm run build
npm install -g next-bundle-analyzer
ANALYZE=true npm run build

# React DevTools
# Install React DevTools browser extension
# Profile components in DevTools
```

## Useful Commands Reference

```bash
# Backend
python3 -m venv venv          # Create venv
source venv/bin/activate      # Activate venv
pip install -r requirements-dev.txt  # Install deps
uvicorn app.main:app --reload # Run server
pytest                         # Run tests
pytest --cov=app              # With coverage
black app && isort app        # Format code
mypy app                       # Type check
alembic upgrade head          # Run migrations

# Frontend
npm install                    # Install deps
npm run dev                    # Dev server
npm run build                  # Production build
npm run test                   # Run tests
npm run lint                   # Lint code
npm run format                 # Format code

# Git
git checkout -b feature/name   # Create branch
git add .                      # Stage changes
git commit -m "feat: description"  # Commit
git push origin feature/name   # Push
gh pr create                   # Create PR
```

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design details
- Check [API.md](API.md) for endpoint documentation
- Review [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
- Check out [GitHub Issues](https://github.com/flyemsafe/oro/issues) for tasks

---

**Need help?** Check the troubleshooting section above or open an issue.

**Have improvements?** We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md)
