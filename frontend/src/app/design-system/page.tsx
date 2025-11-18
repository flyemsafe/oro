'use client'

import { Layout } from '@/components/layout/Layout'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Heading,
  Text,
  Code,
  CodeBlock,
  Logo,
  LogoIcon,
  CopyButton,
  SearchInput,
  DateDisplay,
  TagPill,
  TagPillGroup,
  EmptyState,
  LoadingState,
  LoadingSkeleton,
  LoadingSpinner,
  ErrorState,
  InlineError,
  RatingStars,
  RatingDisplay,
  Button,
  Card,
  Badge,
} from '@/components/ui'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FileText, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function DesignSystemPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rating, setRating] = useState(3.5)

  return (
    <Layout>
      <Container size="xl">
        <PageHeader
          title="Design System"
          description="Oro's comprehensive design system components and patterns"
          gradient
        />

        {/* Colors */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">Brand Colors</Heading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Orange */}
            <div>
              <Text className="mb-3 font-semibold">Oro Orange (Primary)</Text>
              <div className="space-y-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`flex items-center justify-between p-3 rounded bg-oro-orange-${shade}`}
                  >
                    <span className={shade >= 600 ? 'text-white' : 'text-gray-900'}>
                      {shade}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blue */}
            <div>
              <Text className="mb-3 font-semibold">Oro Blue (Secondary)</Text>
              <div className="space-y-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`flex items-center justify-between p-3 rounded bg-oro-blue-${shade}`}
                  >
                    <span className={shade >= 600 ? 'text-white' : 'text-gray-900'}>
                      {shade}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold */}
            <div>
              <Text className="mb-3 font-semibold">Oro Gold (Accent)</Text>
              <div className="space-y-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`flex items-center justify-between p-3 rounded bg-oro-gold-${shade}`}
                  >
                    <span className={shade >= 600 ? 'text-white' : 'text-gray-900'}>
                      {shade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Logo */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">Logo</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <Text className="mb-4 font-semibold">Logo Variants</Text>
              <div className="space-y-6">
                <div>
                  <Text variant="muted" className="mb-2">Gradient (Default)</Text>
                  <Logo size="xl" variant="gradient" />
                </div>
                <div>
                  <Text variant="muted" className="mb-2">Gold</Text>
                  <Logo size="xl" variant="gold" />
                </div>
                <div>
                  <Text variant="muted" className="mb-2">Default</Text>
                  <Logo size="xl" variant="default" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Logo Icon</Text>
              <div className="flex items-center gap-6">
                <LogoIcon size={32} />
                <LogoIcon size={48} />
                <LogoIcon size={64} />
              </div>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">Typography</Heading>
          <div className="space-y-6">
            <div>
              <Heading level={1}>Heading 1</Heading>
              <Heading level={2}>Heading 2</Heading>
              <Heading level={3}>Heading 3</Heading>
              <Heading level={4}>Heading 4</Heading>
              <Heading level={5}>Heading 5</Heading>
              <Heading level={6}>Heading 6</Heading>
            </div>
            <div>
              <Heading level={2} gradient>Gradient Heading</Heading>
            </div>
            <div className="space-y-2">
              <Text>Default text paragraph</Text>
              <Text variant="muted">Muted text</Text>
              <Text variant="small">Small text</Text>
              <Text variant="large">Large text</Text>
              <Text variant="lead">Lead paragraph text with more breathing room</Text>
            </div>
            <div>
              <Text>Inline code: <Code>const greeting = "Hello Oro"</Code></Text>
            </div>
            <CodeBlock language="typescript" showLineNumbers>
{`function greet(name: string): string {
  return \`Hello, \${name}!\`
}

const message = greet("Oro")
console.log(message)`}
            </CodeBlock>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">Buttons</Heading>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button className="bg-oro-orange-500 hover:bg-oro-orange-600">Primary</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* Utility Components */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">Utility Components</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <Text className="mb-4 font-semibold">Search Input</Text>
              <SearchInput placeholder="Search anything..." />
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Copy Button</Text>
              <div className="flex items-center gap-2">
                <Code>const example = "Copy me!"</Code>
                <CopyButton text="const example = 'Copy me!'" />
              </div>
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Date Display</Text>
              <div className="space-y-2">
                <DateDisplay date={new Date()} format="relative" />
                <DateDisplay date={new Date()} format="short" />
                <DateDisplay date={new Date()} format="long" />
              </div>
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Tag Pills</Text>
              <TagPillGroup
                tags={['ai', 'coding', 'productivity']}
                variant="secondary"
              />
            </Card>
          </div>
        </section>

        {/* Rating Stars */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">Rating Stars</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <Text className="mb-4 font-semibold">Interactive Rating</Text>
              <RatingStars
                rating={rating}
                onRatingChange={setRating}
                interactive
                showLabel
                size="lg"
              />
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Display Only</Text>
              <div className="space-y-3">
                <RatingDisplay rating={5} />
                <RatingDisplay rating={4.5} />
                <RatingDisplay rating={3} />
              </div>
            </Card>
          </div>
        </section>

        {/* State Components */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">State Components</Heading>
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-6">
              <Text className="mb-4 font-semibold">Empty State</Text>
              <EmptyState
                icon={FileText}
                title="No prompts found"
                description="Get started by creating your first prompt"
                action={{
                  label: 'Create Prompt',
                  onClick: () => alert('Create prompt'),
                }}
              />
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Loading State</Text>
              <LoadingState message="Loading prompts..." />
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Error State</Text>
              <ErrorState
                title="Failed to load"
                message="Could not load prompts. Please try again."
                onRetry={() => alert('Retry')}
              />
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Inline Error</Text>
              <InlineError message="Invalid input. Please check your data." />
            </Card>

            <Card className="p-6">
              <Text className="mb-4 font-semibold">Loading Skeletons</Text>
              <div className="space-y-3">
                <LoadingSkeleton className="h-8 w-full" />
                <LoadingSkeleton className="h-4 w-3/4" />
                <LoadingSkeleton className="h-4 w-1/2" />
              </div>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">Badges</Heading>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>

        {/* Dialog */}
        <section className="mb-12">
          <Heading level={2} className="mb-6">Confirm Dialog</Heading>
          <div className="flex gap-4">
            <Button onClick={() => setConfirmOpen(true)}>
              Open Confirm Dialog
            </Button>
          </div>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={() => alert('Confirmed!')}
            title="Delete Prompt"
            description="Are you sure you want to delete this prompt? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            variant="destructive"
          />
        </section>
      </Container>
    </Layout>
  )
}
