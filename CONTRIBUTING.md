# Contributing to Oro

Thank you for your interest in contributing to Oro! We welcome contributions from everyone, whether you're reporting bugs, suggesting features, improving documentation, or writing code.

## Code of Conduct

Please be respectful, inclusive, and kind to all contributors and community members. We are committed to providing a welcoming environment for everyone.

## How to Contribute

### Reporting Bugs

Found a bug? Please help us fix it!

1. **Check existing issues** - Make sure the bug hasn't been reported already
2. **Open a bug report** - Use the [Bug Report](https://github.com/flyemsafe/oro/issues/new?template=bug_report.md) template
3. **Provide details**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Python/Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

Have an idea to improve Oro?

1. **Check existing issues** - Ensure the feature hasn't been suggested
2. **Open a feature request** - Use the [Feature Request](https://github.com/flyemsafe/oro/issues/new?template=feature_request.md) template
3. **Explain the feature**:
   - Clear description of what you want
   - Why you think it's useful
   - Example use cases
   - Possible implementation approach

### Improving Documentation

Documentation improvements are always welcome!

1. Found a typo or unclear explanation?
2. Have examples that could help others?
3. Want to improve installation or setup guides?

Simply:
- Fork the repository
- Make your improvements in the `docs/` directory or README
- Submit a pull request

### Writing Code

Want to contribute code? Great! Follow these steps:

#### 1. Set Up Your Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/oro.git
cd oro

# Set up backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt

# Set up frontend
cd frontend
npm install
cd ..
```

See [Development Guide](docs/DEVELOPMENT.md) for detailed setup instructions.

#### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# OR
git checkout -b fix/bug-name
```

Branch naming convention:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Tests

#### 3. Make Your Changes

- Write clean, readable code
- Follow code style guidelines (see below)
- Add tests for new functionality
- Update documentation as needed
- Commit with clear messages

```bash
git add .
git commit -m "feat: add new feature description"
git commit -m "fix: resolve issue with prompt creation"
git commit -m "docs: update API documentation"
```

#### 4. Test Your Changes

```bash
# Backend tests
pytest

# Frontend tests
npm run test

# Linting
black app && isort app
eslint frontend

# Type checking (backend)
mypy app

# Type checking (frontend)
npm run type-check
```

#### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then:
1. Go to GitHub
2. Click "New Pull Request"
3. Fill in the PR template
4. Wait for feedback
5. Address any review comments

## Development Workflow

### Before Starting Work

1. Check [Issues](https://github.com/flyemsafe/oro/issues) for work in progress
2. For larger features, open an issue first to discuss approach
3. Assign the issue to yourself

### During Development

- Commit frequently with descriptive messages
- Push regularly (gives visibility and backup)
- Keep changes focused on the issue/feature
- Update tests alongside code changes

### Before Submitting PR

1. Ensure all tests pass: `pytest` and `npm run test`
2. Run linters: `black`, `eslint`
3. Update relevant documentation
4. Verify no breaking changes

## Code Style Guidelines

### Python

We use standard Python conventions with tools to enforce consistency:

```bash
# Format with Black
black app

# Organize imports with isort
isort app

# Type checking
mypy app

# Linting
flake8 app
```

**Style rules:**
- 4 spaces for indentation (enforced by Black)
- Max line length: 88 characters (Black default)
- Type hints on function signatures
- Docstrings for public functions/classes
- PEP 8 style guidelines

**Example:**
```python
from typing import Optional
from uuid import UUID
from app.models import Prompt

async def get_prompt(prompt_id: UUID) -> Optional[Prompt]:
    """
    Retrieve a prompt by ID.

    Args:
        prompt_id: The UUID of the prompt to retrieve

    Returns:
        The Prompt if found, None otherwise

    Raises:
        ValueError: If prompt_id is invalid
    """
    try:
        prompt = await db.get(Prompt, prompt_id)
        return prompt
    except Exception as e:
        logger.error(f"Failed to retrieve prompt {prompt_id}: {e}")
        return None
```

### TypeScript/JavaScript

We use Prettier for formatting and ESLint for linting:

```bash
# Format with Prettier
npm run format

# Lint with ESLint
npm run lint -- --fix
```

**Style rules:**
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- Type annotations required
- Interfaces for object types
- Meaningful component names

**Example:**
```typescript
import { FC, useState } from 'react';
import { Prompt } from '@/types/prompt';

interface PromptFormProps {
  initialPrompt?: Prompt;
  onSubmit: (data: Prompt) => Promise<void>;
}

export const PromptForm: FC<PromptFormProps> = ({
  initialPrompt,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: Prompt) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};
```

## Commit Message Convention

We follow Conventional Commits for clear, structured commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Test additions/updates
- `chore:` - Maintenance tasks

**Scope** (optional but recommended):
- `prompts` - Prompt-related changes
- `tags` - Tag-related changes
- `api` - API changes
- `frontend` - Frontend changes
- `db` - Database changes
- `ci` - CI/CD changes

**Examples:**
```
feat(prompts): add template variable support
fix(api): handle null values in prompt content
docs: improve installation instructions
refactor(frontend): extract TagManager component
test(prompts): add tests for create_prompt endpoint
perf(api): add database indexes for tag queries
chore(deps): upgrade fastapi to 0.105.0
```

## Testing Requirements

We strive for good test coverage. When contributing:

### Backend Tests

- Write unit tests for business logic
- Write integration tests for API endpoints
- Target 80%+ coverage for critical paths
- Use pytest fixtures for test data

```python
# Example test
def test_create_prompt(client, db_session):
    """Test creating a new prompt"""
    response = client.post("/api/v1/prompts", json={
        "title": "Test Prompt",
        "content": "Test content"
    })
    assert response.status_code == 201
    assert response.json()["data"]["title"] == "Test Prompt"
```

### Frontend Tests

- Write component tests with React Testing Library
- Write integration tests for user flows
- Test error states and loading states

```typescript
// Example test
describe('PromptCard', () => {
  it('renders prompt title and content', () => {
    const prompt = { id: '1', title: 'Test', content: 'Content' };
    render(<PromptCard prompt={prompt} />);

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles delete action', async () => {
    const onDelete = jest.fn();
    render(<PromptCard prompt={mockPrompt} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalled();
  });
});
```

## Documentation

When contributing features or changes:

1. **Update relevant docs** in `docs/` directory
2. **Update README** if adding features or changing setup
3. **Update API docs** if changing endpoints
4. **Add docstrings** to functions/classes (Python)
5. **Add JSDoc comments** for exported functions (JavaScript)

Example docstring:
```python
def get_prompts(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    tag: Optional[str] = None,
) -> list[Prompt]:
    """
    Retrieve prompts with optional filtering.

    Args:
        skip: Number of prompts to skip (pagination)
        limit: Maximum number of prompts to return
        search: Search term for title/content
        tag: Filter by tag name

    Returns:
        List of Prompt objects matching criteria

    Example:
        >>> prompts = get_prompts(skip=10, limit=20, tag="coding")
        >>> len(prompts)
        20
    """
```

## Pull Request Process

### Before Creating PR

1. **Ensure tests pass**: `pytest && npm run test`
2. **Run formatters**: `black`, `prettier`
3. **Run linters**: `eslint`, `flake8`, `mypy`
4. **Update tests** for your changes
5. **Update documentation**
6. **Rebase on main** (if needed)

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### Creating PR

1. Use the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md)
2. Fill in:
   - Clear description of changes
   - Issue number (if applicable)
   - Type of change (feat, fix, docs, etc.)
   - Testing done
   - Checklist items

### PR Template Example

```markdown
## Description
Clear description of what this PR does

Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Backend tests added/updated
- [ ] Frontend tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Documentation
- [ ] Updated README
- [ ] Updated API docs
- [ ] Added/updated docstrings
- [ ] Updated architecture docs (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] No breaking changes
- [ ] Self-review completed
- [ ] Comments added for complex logic
```

### During Review

- Respond to feedback promptly
- Make requested changes
- Request re-review when done
- Don't force-push after review starts (makes reviewing harder)

### Merging

Once approved:
1. Squash and merge (keeps history clean)
2. Use conventional commit message for merge
3. Delete the branch

## Roadmap

See [README Roadmap](README.md#roadmap) for planned features and versions:

- **v0.1.0** - MVP (current)
- **v0.2.0** - Enhanced UI and templates
- **v0.3.0** - LLM-assisted enhancement
- **v0.4.0** - Multi-user support
- **v0.5.0** - Full authentication and integrations

Contributions aligned with the roadmap are especially welcome!

## Getting Help

- **GitHub Issues** - Ask questions in relevant issues
- **Discussions** - Use GitHub Discussions for general questions
- **Development Guide** - Check [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Architecture** - Check [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Recognition

We recognize and appreciate all contributors! Your name will be added to:
- CONTRIBUTORS.md file
- GitHub contributors page
- Release notes (for significant contributions)

## License

By contributing to Oro, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Oro!** Your work helps make this project better for everyone.

Questions? Open an issue or start a discussion on GitHub.

Happy coding! 🚀
