'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PromptList } from '@/components/prompts/PromptList'
import { PromptSearch } from '@/components/prompts/PromptSearch'
import { PromptFilters } from '@/components/prompts/PromptFilters'
import { usePrompts, useUpdatePrompt, useDeletePrompt } from '@/hooks/usePrompts'
import { toast } from 'sonner'
import type { Prompt } from '@/types/prompt'

const ITEMS_PER_PAGE = 12

export default function PromptsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // Fetch prompts with current filters
  const { data, isLoading, error } = usePrompts({
    skip: currentPage * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    search: searchQuery || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    is_favorite: showFavoritesOnly || undefined,
  })

  const updatePrompt = useUpdatePrompt()
  const deletePrompt = useDeletePrompt()

  // Extract all unique tags from prompts for filter options
  const availableTags = useMemo(() => {
    if (!data?.prompts) return []
    const tags = new Set<string>()
    data.prompts.forEach((prompt) => {
      prompt.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [data?.prompts])

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
    setCurrentPage(0) // Reset to first page when filtering
  }

  const handleFavoritesToggle = () => {
    setShowFavoritesOnly((prev) => !prev)
    setCurrentPage(0)
  }

  const handleClearFilters = () => {
    setSelectedTags([])
    setShowFavoritesOnly(false)
    setSearchQuery('')
    setCurrentPage(0)
  }

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    updatePrompt.mutate({
      id,
      data: { is_favorite: isFavorite },
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt.mutate(id)
    }
  }

  const handleEdit = (prompt: Prompt) => {
    // TODO: Implement edit dialog/modal in next iteration
    toast.info('Edit functionality coming soon!')
  }

  const handleCreateNew = () => {
    router.push('/prompts/new')
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0
  const hasFilters = searchQuery.length > 0 || selectedTags.length > 0 || showFavoritesOnly

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Prompts</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
          <p className="text-muted-foreground">
            {data ? `${data.total} total prompts` : 'Loading...'}
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-[#f78f2a] hover:bg-[#f78f2a]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Prompt
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-6 md:grid-cols-[1fr_250px] mb-6">
        <div>
          <PromptSearch
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:row-span-2">
          <PromptFilters
            selectedTags={selectedTags}
            availableTags={availableTags}
            showFavoritesOnly={showFavoritesOnly}
            onTagToggle={handleTagToggle}
            onFavoritesToggle={handleFavoritesToggle}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Prompt List */}
        <div>
          <PromptList
            prompts={data?.prompts || []}
            isLoading={isLoading}
            hasFilters={hasFilters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
            onCreateNew={handleCreateNew}
          />
        </div>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  page === currentPage
                    ? 'bg-[#3687d1] hover:bg-[#3687d1]/90'
                    : ''
                }
              >
                {page + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
