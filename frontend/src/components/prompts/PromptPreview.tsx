'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PromptPreviewProps {
  title: string
  content: string
  systemPrompt?: string
  description?: string
  tags?: string[]
}

export function PromptPreview({
  title,
  content,
  systemPrompt,
  description,
  tags = [],
}: PromptPreviewProps) {
  // Function to highlight template variables
  const highlightVariables = (text: string) => {
    if (!text) return null

    const parts = text.split(/(\{\{[^}]+\}\})/g)
    return parts.map((part, index) => {
      if (part.match(/\{\{[^}]+\}\}/)) {
        return (
          <span
            key={index}
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded font-mono"
          >
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Title
          </h3>
          <p className="text-base font-semibold">
            {title || <span className="text-muted-foreground italic">No title</span>}
          </p>
        </div>

        {/* Description */}
        {description && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Description
            </h3>
            <p className="text-sm">{description}</p>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* System Prompt */}
        {systemPrompt && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              System Prompt
            </h3>
            <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
              {highlightVariables(systemPrompt)}
            </div>
          </div>
        )}

        {/* Content */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Content
          </h3>
          <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap min-h-[120px]">
            {content ? (
              highlightVariables(content)
            ) : (
              <span className="text-muted-foreground italic">No content</span>
            )}
          </div>
        </div>

        {/* Character count */}
        <div className="text-xs text-muted-foreground">
          {content?.length || 0} characters
        </div>
      </CardContent>
    </Card>
  )
}
