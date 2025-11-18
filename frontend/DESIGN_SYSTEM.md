# Oro Design System

Comprehensive design system for Oro - A personal prompt management tool with Yoruba-inspired branding.

## Overview

The Oro design system provides a complete set of reusable components, design tokens, and patterns for building consistent, accessible, and beautiful user interfaces.

## Design Principles

1. **Clarity** - Clean, uncluttered interfaces that prioritize content
2. **Efficiency** - Fast access to common actions with minimal friction
3. **Cultural** - Subtle Yoruba-inspired elements (colors, patterns, symbolism)
4. **Accessibility** - WCAG 2.1 AA compliance for all interactive elements
5. **Responsiveness** - Mobile-first design that scales beautifully

## Brand Colors

### Oro Orange (Primary)
Main brand color for primary actions, highlights, and key UI elements.

- `oro-orange-50` to `oro-orange-900` - Full color scale
- Primary: `oro-orange-500` (#f78f2a)
- Usage: Primary buttons, active states, highlights

### Oro Blue (Secondary)
Secondary brand color for links, secondary actions, and supporting elements.

- `oro-blue-50` to `oro-blue-900` - Full color scale
- Primary: `oro-blue-500` (#3687d1)
- Usage: Links, secondary buttons, information states

### Oro Gold (Premium/Accent)
Accent color representing precious value, used for premium features and special highlights.

- `oro-gold-50` to `oro-gold-900` - Full color scale
- Primary: `oro-gold-500` (#d4af37)
- Usage: Premium features, ratings, special badges, logo accent

## Design Tokens

### Typography Scale

```css
--font-size-xs: 0.75rem
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem
--font-size-2xl: 1.5rem
--font-size-3xl: 1.875rem
--font-size-4xl: 2.25rem
--font-size-5xl: 3rem
```

### Line Heights

```css
--line-height-tight: 1.25
--line-height-snug: 1.375
--line-height-normal: 1.5
--line-height-relaxed: 1.625
--line-height-loose: 2
```

### Border Radius

```css
--radius-sm: 0.25rem
--radius: 0.5rem (default)
--radius-md: 0.75rem
--radius-lg: 1rem
--radius-xl: 1.5rem
--radius-2xl: 2rem
--radius-full: 9999px
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)
```

## Component Library

### Layout Components

#### AppLayout
Main application shell with sidebar and header.

```tsx
import { AppLayout } from '@/components/layout'

<AppLayout>
  {/* Your page content */}
</AppLayout>
```

#### Container
Content container with responsive max-width.

```tsx
import { Container } from '@/components/layout'

<Container size="lg"> {/* sm, md, lg, xl, full */}
  {/* Content */}
</Container>
```

#### PageHeader
Reusable page header with title, description, and actions.

```tsx
import { PageHeader } from '@/components/layout'

<PageHeader
  title="My Page"
  description="Page description"
  gradient // Optional gradient on title
  actions={<Button>Action</Button>}
/>
```

### Branding Components

#### Logo
Oro text logo with Yoruba-inspired styling.

```tsx
import { Logo, LogoIcon } from '@/components/ui'

<Logo size="lg" variant="gradient" /> {/* sm, md, lg, xl */}
<LogoIcon size={32} />
```

Variants:
- `gradient` - Orange to blue gradient (default)
- `gold` - Gold color
- `default` - Foreground color

### Typography Components

#### Heading
Semantic headings (h1-h6) with consistent styling.

```tsx
import { Heading } from '@/components/ui'

<Heading level={1} gradient>My Title</Heading>
```

#### Text
Body text with variants.

```tsx
import { Text } from '@/components/ui'

<Text variant="default">Default paragraph</Text>
<Text variant="muted">Muted text</Text>
<Text variant="small">Small text</Text>
<Text variant="large">Large text</Text>
<Text variant="lead">Lead paragraph</Text>
```

#### Code & CodeBlock
Inline and block code display.

```tsx
import { Code, CodeBlock } from '@/components/ui'

<Code>const example = "code"</Code>

<CodeBlock language="typescript" showLineNumbers>
{`function hello() {
  console.log("Hello Oro")
}`}
</CodeBlock>
```

### Utility Components

#### CopyButton
Copy text to clipboard with toast feedback.

```tsx
import { CopyButton } from '@/components/ui'

<CopyButton
  text="Text to copy"
  successMessage="Copied!"
  variant="ghost"
  size="icon"
/>
```

#### SearchInput
Debounced search input with clear button.

```tsx
import { SearchInput } from '@/components/ui'

<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Search..."
  debounceMs={300}
/>
```

#### DateDisplay
Relative or formatted date display.

```tsx
import { DateDisplay } from '@/components/ui'

<DateDisplay date={new Date()} format="relative" />
<DateDisplay date="2024-01-01" format="short" />
<DateDisplay date={date} format="long" />
<DateDisplay date={date} format="full" />
```

#### TagPill & TagPillGroup
Tag display with optional remove button.

```tsx
import { TagPill, TagPillGroup } from '@/components/ui'

<TagPill tag="ai" onRemove={handleRemove} />
<TagPillGroup tags={['ai', 'coding']} variant="secondary" />
```

### State Components

#### EmptyState
Empty state with icon, message, and call-to-action.

```tsx
import { EmptyState } from '@/components/ui'

<EmptyState
  icon={FileText}
  title="No prompts found"
  description="Get started by creating your first prompt"
  action={{
    label: 'Create Prompt',
    onClick: handleCreate
  }}
/>
```

#### LoadingState
Loading states with spinner and message.

```tsx
import {
  LoadingState,
  LoadingSkeleton,
  LoadingSpinner,
  PromptCardSkeleton
} from '@/components/ui'

<LoadingState message="Loading prompts..." size="lg" />
<LoadingSkeleton className="h-20 w-full" />
<LoadingSpinner size="md" />
<PromptCardSkeleton />
```

#### ErrorState
Error display with retry action.

```tsx
import { ErrorState, InlineError } from '@/components/ui'

<ErrorState
  title="Something went wrong"
  message="Failed to load prompts"
  onRetry={handleRetry}
/>

<InlineError message="Invalid input" />
```

### Interactive Components

#### RatingStars
5-star rating display and input.

```tsx
import { RatingStars, RatingDisplay } from '@/components/ui'

<RatingStars
  rating={4.5}
  onRatingChange={setRating}
  interactive
  showLabel
  size="lg"
/>

<RatingDisplay rating={3.5} />
```

#### ConfirmDialog
Confirmation modal for destructive actions.

```tsx
import { ConfirmDialog } from '@/components/ui'

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  onConfirm={handleDelete}
  title="Delete Prompt"
  description="Are you sure you want to delete this prompt?"
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive" // default, destructive, warning, info, success
/>
```

## Dark Mode

Oro fully supports dark mode with automatic theme switching. All components adapt seamlessly.

### Theme Toggle
```tsx
import { ThemeToggle } from '@/components/layout'

<ThemeToggle />
```

### Using Theme in Components
The theme is managed by `next-themes` and all CSS variables automatically adapt.

## Accessibility Features

1. **Focus States** - All interactive elements have visible focus rings
2. **ARIA Labels** - Screen reader support for all components
3. **Keyboard Navigation** - Full keyboard accessibility
4. **Color Contrast** - WCAG 2.1 AA compliant color combinations
5. **Semantic HTML** - Proper heading hierarchy and landmarks

## Responsive Design

### Breakpoints
Using Tailwind's default breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach
All components are designed mobile-first and progressively enhanced for larger screens.

## Usage Examples

### Complete Page Example

```tsx
import { AppLayout, Container, PageHeader } from '@/components/layout'
import { Button, EmptyState, SearchInput } from '@/components/ui'
import { Plus, FileText } from 'lucide-react'

export default function PromptsPage() {
  return (
    <AppLayout>
      <Container size="xl">
        <PageHeader
          title="Prompts"
          description="Manage your AI prompts"
          gradient
          actions={
            <Button className="bg-oro-orange-500 hover:bg-oro-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          }
        />

        <SearchInput placeholder="Search prompts..." className="mb-6" />

        <EmptyState
          icon={FileText}
          title="No prompts yet"
          description="Create your first prompt to get started"
          action={{
            label: 'Create Prompt',
            onClick: () => {}
          }}
        />
      </Container>
    </AppLayout>
  )
}
```

## Component Import Patterns

### Centralized Imports
```tsx
// Import from component index for convenience
import {
  Heading,
  Text,
  Button,
  SearchInput,
  EmptyState,
  LoadingState
} from '@/components/ui'

import {
  AppLayout,
  Container,
  PageHeader
} from '@/components/layout'
```

### Direct Imports
```tsx
// Import specific components directly
import { Logo } from '@/components/ui/Logo'
import { RatingStars } from '@/components/ui/RatingStars'
```

## Design System Demo

Visit `/design-system` in the running application to see all components in action with interactive examples.

## Development

### Running the Design System

```bash
npm run dev
# Visit http://localhost:3000/design-system
```

### Adding New Components

1. Create component in `src/components/ui/` or `src/components/layout/`
2. Add TypeScript types with proper interfaces
3. Follow existing patterns for variants and sizes
4. Export from index files for easy importing
5. Add example to design system page
6. Document in this file

## Future Enhancements

- [ ] Storybook integration for component documentation
- [ ] Animation library integration (Framer Motion)
- [ ] Advanced form components
- [ ] Data table components
- [ ] Chart and visualization components
- [ ] Toast notification system enhancements
- [ ] Context menus and dropdowns
- [ ] Advanced filtering and sorting components

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Next.js Documentation](https://nextjs.org/)
