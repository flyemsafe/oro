'use client'

import { PromptCard } from './PromptCard'
import { PromptEmpty } from './PromptEmpty'
import { Skeleton } from '@/components/ui/skeleton'
import type { Prompt } from '@/types/prompt'

interface PromptListProps {
  prompts: Prompt[]
  isLoading?: boolean
  hasFilters?: boolean
  onEdit?: (prompt: Prompt) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string, isFavorite: boolean) => void
  onCreateNew?: () => void
}

export function PromptList({
  prompts,
  isLoading = false,
  hasFilters = false,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCreateNew,
}: PromptListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (prompts.length === 0) {
    return <PromptEmpty hasFilters={hasFilters} onCreateNew={onCreateNew} />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}

function PromptCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}
