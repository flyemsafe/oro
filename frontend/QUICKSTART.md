# Oro Frontend - Quick Start Guide

## Installation

```bash
cd ~/Workspace/flyemsafe/oro/frontend
npm install
```

## Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

The default configuration connects to the backend at `http://localhost:8000`. Modify `.env.local` if your backend runs on a different URL.

## Running the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Project Status

✅ **Completed**:
- Next.js 14 with TypeScript (strict mode)
- Tailwind CSS with custom Yoruba-inspired colors
- shadcn/ui components (button, input, card, badge, dialog, sonner)
- Dark mode support with system preference detection
- Responsive layout with header and sidebar
- Landing page with branding
- API client configuration (Axios)
- TypeScript types for Prompt entities
- React Query integration for server state
- ESLint and TypeScript configurations

## Features

### Layout Components
- **Header**: Top navigation with theme toggle
- **Sidebar**: Side navigation with icons
- **Layout**: Main wrapper component combining header and sidebar

### UI Components (shadcn/ui)
- Button
- Input
- Card
- Badge
- Dialog
- Sonner (Toast notifications)

### Color Theme
Custom Yoruba-inspired palette:
- **Oro Orange** (Primary): Warm orange tones (#f78f2a)
- **Oro Blue** (Secondary): Deep blue tones (#3687d1)

Both support full range (50-900) for light and dark modes.

### API Integration
- Axios client configured in `src/lib/api.ts`
- Request/response interceptors for error handling
- Ready for authentication token integration

### TypeScript Types
- Prompt interface and related types in `src/types/prompt.ts`
- Strict mode enabled for type safety

## Next Steps

1. **Implement Prompts Page** (Issue #2):
   - Create `/prompts` route
   - Build prompt list component
   - Implement CRUD operations

2. **Add Search Functionality**:
   - Search bar in header
   - Filter by category and tags
   - Full-text search integration

3. **Favorites Feature**:
   - Toggle favorite status
   - Filter by favorites
   - Favorites page

4. **Categories Management**:
   - Category list page
   - Category creation/editing
   - Assign prompts to categories

## Troubleshooting

### Port Already in Use
```bash
PORT=3001 npm run dev
```

### Clear Build Cache
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript Errors
```bash
npx tsc --noEmit  # Check for type errors
```

## Documentation

For detailed documentation, see [README.md](./README.md).
