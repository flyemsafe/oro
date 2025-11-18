'use client'

import { formatDistanceToNow } from 'date-fns'
import { Star, Copy, Trash2, Edit } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Prompt } from '@/types/prompt'

interface PromptCardProps {
  prompt: Prompt
  onEdit?: (prompt: Prompt) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string, isFavorite: boolean) => void
}

export function PromptCard({ prompt, onEdit, onDelete, onToggleFavorite }: PromptCardProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content)
    // Toast notification handled by parent component
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1">{prompt.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onToggleFavorite?.(prompt.id, !prompt.is_favorite)}
          >
            <Star
              className={cn(
                "h-4 w-4",
                prompt.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
        {prompt.category && (
          <div className="text-xs text-muted-foreground">
            {prompt.category}
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {prompt.content}
        </p>

        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {prompt.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs hover:bg-[#f78f2a] hover:text-white cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true })}
        </span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit?.(prompt)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete?.(prompt.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
