# Oro Frontend

The frontend application for Oro - a personal prompt management tool.

## Overview

Oro ("word" in Yoruba) is a Next.js-based web application for organizing, managing, and retrieving AI prompts. The frontend is built with modern web technologies and provides an intuitive interface for prompt management.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom Yoruba-inspired color palette
- **Components**: shadcn/ui (built on Radix UI)
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Dark Mode**: next-themes
- **Icons**: Lucide React

## Features

- Responsive design with mobile-first approach
- Dark mode support
- Modern UI components from shadcn/ui
- Type-safe API integration
- Custom Yoruba-inspired color scheme (warm oranges, deep blues)
- Client-side data caching and synchronization

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles with CSS variables
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── sonner.tsx   # Toast notifications
│   │   ├── layout/
│   │   │   ├── Header.tsx   # Top navigation
│   │   │   ├── Sidebar.tsx  # Side navigation
│   │   │   ├── Layout.tsx   # Main layout wrapper
│   │   │   └── ThemeToggle.tsx
│   │   └── providers/
│   │       ├── QueryProvider.tsx  # React Query setup
│   │       └── ThemeProvider.tsx  # Dark mode provider
│   ├── lib/
│   │   ├── utils.ts         # Utility functions (cn helper)
│   │   └── api.ts           # Axios instance and interceptors
│   └── types/
│       └── prompt.ts        # TypeScript type definitions
├── public/                  # Static assets
├── .env.local.example       # Environment variables template
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.js           # Next.js configuration
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:

```bash
cd oro/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and configure your environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically reload when you make changes to the source files.

### Building for Production

Create an optimized production build:

```bash
npm run build
```

### Running Production Build

Start the production server:

```bash
npm run start
```

### Linting

Run ESLint to check for code quality issues:

```bash
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Oro` |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Application description | `Words with Power` |

All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Color Theme

Oro uses a custom Yoruba-inspired color palette:

### Oro Orange
- Primary brand color
- Used for CTAs and highlights
- Range: 50-900 (from light to dark)

### Oro Blue
- Secondary brand color
- Used for accents and supporting elements
- Range: 50-900 (from light to dark)

The theme supports both light and dark modes with automatic system preference detection.

## API Integration

The frontend communicates with the backend API using Axios. The API client is configured in `src/lib/api.ts` with:

- Base URL from environment variables
- Request/response interceptors
- Error handling
- Future authentication token support

Example usage:

```typescript
import api from '@/lib/api'

// GET request
const response = await api.get('/prompts')

// POST request
const newPrompt = await api.post('/prompts', {
  title: 'My Prompt',
  content: 'Prompt content here',
})
```

## Component Library

This project uses shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

## TypeScript

This project uses TypeScript in strict mode. Key type definitions are in `src/types/`:

- `prompt.ts` - Prompt-related types and interfaces

## Development Guidelines

### Adding New Pages

1. Create a new directory in `src/app/` for the route
2. Add `page.tsx` for the page component
3. Add `layout.tsx` if needed for route-specific layouts

### Adding New Components

1. Create component files in appropriate directory under `src/components/`
2. Use TypeScript with proper type definitions
3. Follow the existing component patterns
4. Use shadcn/ui components where applicable

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` helper for conditional classes
- Follow the established color theme
- Ensure dark mode compatibility

### State Management

- Use TanStack Query for server state
- Use React hooks for local component state
- Avoid prop drilling - use composition patterns

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
PORT=3001 npm run dev
```

### Build Errors

Clear Next.js cache and node_modules:

```bash
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript Errors

Ensure you're using the correct Node.js and TypeScript versions:

```bash
node --version  # Should be 18.17 or later
npx tsc --version
```

## Contributing

1. Follow the existing code style
2. Write TypeScript with strict types
3. Test in both light and dark modes
4. Ensure responsive design
5. Update documentation as needed

## License

MIT

## Related Projects

- [Oro Backend](../backend/README.md) - FastAPI backend service
- [Oro Documentation](../docs/README.md) - Project documentation
