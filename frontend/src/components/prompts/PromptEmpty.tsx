'use client'

import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PromptEmptyProps {
  hasFilters?: boolean
  onCreateNew?: () => void
}

export function PromptEmpty({ hasFilters = false, onCreateNew }: PromptEmptyProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {hasFilters ? 'No prompts found' : 'No prompts yet'}
        </h3>

        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {hasFilters
            ? 'Try adjusting your search or filters to find what you\'re looking for.'
            : 'Get started by creating your first prompt. Store and organize all your AI prompts in one place.'}
        </p>

        {!hasFilters && onCreateNew && (
          <Button
            onClick={onCreateNew}
            className="bg-[#f78f2a] hover:bg-[#f78f2a]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create your first prompt
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
