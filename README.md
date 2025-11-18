# Oro - Words with Power

> In Yoruba tradition, **ọrọ** carries **àṣẹ** - the sacred force that makes things happen.
> Words spoken with intentionality, clarity, and power.

**Oro** is a personal prompt management tool that combines version control, templates, and LLM-assisted optimization to help you craft, organize, and refine prompts that drive AI conversations forward.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots-coming-soon)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

## Features

- **📝 Version Control** - Git-backed prompt history with full revision tracking
- **🎨 Templates** - Create reusable prompt templates with variables and dynamic content
- **⭐ Rating System** - Track prompt effectiveness and find what works best for your use cases
- **🤖 LLM-Assisted Enhancement** - Use AI to analyze, optimize, and improve your prompts
- **🔍 Search & Tags** - Powerful search and tagging system to organize and discover prompts
- **📊 Execution Tracking** - Monitor prompt executions and outcomes
- **🏠 Self-Hosted** - Own your data completely - no cloud dependencies
- **🔐 Privacy-First** - All prompts stored locally with no telemetry

## Screenshots (Coming Soon)

Screenshots and UI demonstrations will be added in v0.2.0 as the interface stabilizes.

## Technology Stack

**Oro** is built as a Next.js 14 full-stack application:

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **UI**: React 18 + Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **API**: Next.js API Routes (REST)

### Architecture

```
Oro (Next.js Full-Stack)
├── Frontend (React Components)
├── Backend (API Routes)
└── Database (SQLite + Prisma)
```

**Benefits of this architecture:**
- ✅ Single application (no separate frontend/backend)
- ✅ One command to run (`npm run dev`)
- ✅ No CORS issues
- ✅ Type-safe from database to UI
- ✅ Built-in database safety (automatic backups)
- ✅ Fast hot reload with Turbopack

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ with npm
- **Git** 2.25+
- **Docker/Podman** (optional, for containerized deployment)

### Installation

#### Quick Install (Docker/Podman)

Coming in v0.2.0 - Docker/Podman setup instructions

#### Development Installation

See [Development Setup](#development-setup) below.

#### Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/flyemsafe/oro.git
   cd oro/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Initialize the database
   npm run db:migrate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Application: http://localhost:3000
   - API: http://localhost:3000/api/v1/*

## Quick Start

### Create Your First Prompt

1. Navigate to http://localhost:3000
2. Click "New Prompt"
3. Enter a title and your prompt text
4. Add tags for organization (e.g., "coding", "analysis", "creative")
5. Click "Save"

### Using Templates

1. Click "New from Template"
2. Select a template
3. Fill in variable values
4. Save your customized prompt

### Rating and Feedback

1. After using a prompt, return to Oro
2. Set a rating (1-5 stars) indicating effectiveness
3. Add notes about how it performed
4. Use these insights to refine your prompts

## Development

### Development Setup

1. **Clone and set up environment**
   ```bash
   git clone https://github.com/flyemsafe/oro.git
   cd oro

   # Backend setup
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements-dev.txt
   ```

2. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb oro_dev

   # Run migrations
   alembic upgrade head

   # (Optional) Seed sample data
   python scripts/seed_db.py
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Run tests**
   ```bash
   # Backend tests
   pytest

   # Frontend tests
   npm run test
   ```

### Project Structure

```
oro/
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # System design
│   ├── DEVELOPMENT.md    # Development guide
│   └── API.md           # API reference
├── backend/             # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── api/
│   ├── migrations/
│   └── tests/
├── frontend/            # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
├── scripts/             # Utility scripts
├── requirements.txt     # Python dependencies
├── package.json        # Node.js dependencies
└── README.md          # This file
```

### Running Tests

```bash
# Backend tests with coverage
pytest --cov=app

# Frontend tests
cd frontend && npm run test

# Linting
black app
isort app
eslint frontend
```

### Code Style

**Python:**
- Use Black for code formatting
- isort for import organization
- mypy for type checking
- Follow PEP 8

**TypeScript/JavaScript:**
- Use Prettier for code formatting
- ESLint for linting
- Follow TSConfig strict mode

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:

- Reporting bugs
- Suggesting features
- Development workflow
- Code review process
- Pull request process

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### v0.1.0 (Current - MVP)
- Core prompt CRUD operations
- Basic version control with Git
- Simple tagging system
- Initial API structure

### v0.2.0 (Planned)
- Enhanced UI/UX
- Template system
- Search improvements
- Docker/Podman deployment
- Basic API documentation

### v0.3.0 (Planned)
- LLM-assisted prompt enhancement
- Rating system
- Execution tracking
- Advanced search filters

### v0.4.0 (Planned)
- Multi-user support
- Prompt sharing
- Collaboration features
- Advanced analytics

### v0.5.0 (Future)
- Authentication system
- Export/import features
- Integration with popular LLM platforms
- Mobile app

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design and technical architecture
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup and development workflow
- **[API Reference](docs/API.md)** - Complete API endpoint documentation
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits and Acknowledgments

### Inspiration

Oro draws inspiration from:
- The Yoruba concept of **ọrọ** (words with power) and **àṣẹ** (the force that makes things happen)
- Prompt engineering best practices from the LLM community
- Version control principles that ensure reproducibility

### Technology

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework for production
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL toolkit
- [PostgreSQL](https://www.postgresql.org/) - Advanced open source database
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful React components
- [TanStack Query](https://tanstack.com/query/) - Data fetching library

### Community

Special thanks to:
- The open source community for amazing tools and libraries
- Contributors and early testers
- The Yoruba cultural tradition that inspired this project's name and vision

---

**"Words with power for AI"** - Oro helps you speak to AI with intention and clarity.

For questions, issues, or feedback, please open a [GitHub issue](https://github.com/flyemsafe/oro/issues).
