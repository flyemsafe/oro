'use client'

import { Star, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PromptFiltersProps {
  selectedTags: string[]
  availableTags: string[]
  showFavoritesOnly: boolean
  onTagToggle: (tag: string) => void
  onFavoritesToggle: () => void
  onClearFilters: () => void
}

export function PromptFilters({
  selectedTags,
  availableTags,
  showFavoritesOnly,
  onTagToggle,
  onFavoritesToggle,
  onClearFilters,
}: PromptFiltersProps) {
  const hasActiveFilters = selectedTags.length > 0 || showFavoritesOnly

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          size="sm"
          onClick={onFavoritesToggle}
          className={cn(
            "h-8",
            showFavoritesOnly && "bg-[#f78f2a] hover:bg-[#f78f2a]/90"
          )}
        >
          <Star className="h-3 w-3 mr-1" />
          Favorites only
        </Button>

        {availableTags.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Tags
            </div>
            <div className="flex flex-wrap gap-1">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer text-xs",
                      isSelected && "bg-[#3687d1] hover:bg-[#3687d1]/90"
                    )}
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
