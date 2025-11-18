'use client'

import { X } from 'lucide-react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface TagPillProps {
  tag: string
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  onRemove?: (tag: string) => void
  className?: string
  href?: string
}

export function TagPill({
  tag,
  variant = 'secondary',
  onRemove,
  className,
  href,
}: TagPillProps) {
  const content = (
    <Badge
      variant={variant}
      className={cn(
        'px-3 py-1 text-xs font-medium transition-colors',
        onRemove && 'pr-1',
        href && 'cursor-pointer hover:bg-oro-orange-100 dark:hover:bg-oro-orange-900',
        className
      )}
    >
      <span>{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove(tag)
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
          aria-label={`Remove ${tag} tag`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    )
  }

  return content
}

export function TagPillGroup({ tags, ...props }: { tags: string[] } & Omit<TagPillProps, 'tag'>) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagPill key={tag} tag={tag} {...props} />
      ))}
    </div>
  )
}
