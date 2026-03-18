'use client'

import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Star, Copy, Trash2, Edit, Variable } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RatingStars } from '@/components/ui/RatingStars'
import { promptsApi } from '@/lib/api/prompts'
import { toast } from 'sonner'
import type { Prompt } from '@/types/prompt'

interface PromptCardProps {
  prompt: Prompt
  onEdit?: (prompt: Prompt) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string, isFavorite: boolean) => void
  onRatePrompt?: (id: string, rating: number) => void
}

function getVariables(content: string): string[] {
  const seen = new Set<string>()
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g
  let match = regex.exec(content)
  while (match) {
    seen.add(match[1])
    match = regex.exec(content)
  }
  return Array.from(seen)
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRatePrompt,
}: PromptCardProps) {
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({})
  const [isRenderingTemplate, setIsRenderingTemplate] = useState(false)

  const templateVariables = useMemo(() => {
    if (prompt.template_variables && prompt.template_variables.length > 0) {
      return prompt.template_variables
    }
    return getVariables(prompt.content)
  }, [prompt.template_variables, prompt.content])

  const isTemplatePrompt = prompt.is_template || templateVariables.length > 0

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      toast.success('Prompt copied')
    } catch (error) {
      toast.error('Failed to copy prompt')
      console.error('Copy failed:', error)
    }
  }

  const openTemplateDialog = () => {
    const initialValues: Record<string, string> = {}
    templateVariables.forEach((name) => {
      initialValues[name] = templateValues[name] || ''
    })
    setTemplateValues(initialValues)
    setTemplateOpen(true)
  }

  const handleTemplateCopy = async () => {
    try {
      setIsRenderingTemplate(true)
      const rendered = await promptsApi.renderPromptTemplate(prompt.id, {
        variables: templateValues,
      })

      if (rendered.missing_variables.length > 0) {
        toast.error(`Missing variables: ${rendered.missing_variables.join(', ')}`)
        return
      }

      await navigator.clipboard.writeText(rendered.rendered_content)
      toast.success('Rendered prompt copied')
      setTemplateOpen(false)
    } catch (error) {
      toast.error('Failed to render template')
      console.error('Render template failed:', error)
    } finally {
      setIsRenderingTemplate(false)
    }
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
        {prompt.is_template && (
          <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wide">
            Template
          </Badge>
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

        <div className="mt-3 flex items-center justify-between gap-3">
          <RatingStars
            rating={prompt.average_rating || 0}
            size="sm"
            interactive={!!onRatePrompt}
            onRatingChange={(value) => onRatePrompt?.(prompt.id, value)}
          />
          <span className="text-xs text-muted-foreground">
            {prompt.ratings_count > 0
              ? `${(prompt.average_rating || 0).toFixed(1)} (${prompt.ratings_count})`
              : 'No ratings'}
          </span>
        </div>
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
            title="Copy prompt"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {isTemplatePrompt && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={openTemplateDialog}
              title="Fill template variables"
            >
              <Variable className="h-4 w-4" />
            </Button>
          )}
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

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fill Template Variables</DialogTitle>
            <DialogDescription>
              Enter values for each variable, then copy the rendered prompt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {templateVariables.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No template variables found.
              </p>
            ) : (
              templateVariables.map((variableName) => (
                <div key={variableName} className="space-y-1">
                  <Label htmlFor={`var-${prompt.id}-${variableName}`}>
                    {variableName}
                  </Label>
                  <Input
                    id={`var-${prompt.id}-${variableName}`}
                    value={templateValues[variableName] || ''}
                    onChange={(event) =>
                      setTemplateValues((prev) => ({
                        ...prev,
                        [variableName]: event.target.value,
                      }))
                    }
                    placeholder={`Enter ${variableName}`}
                  />
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTemplateCopy} disabled={isRenderingTemplate}>
              {isRenderingTemplate ? 'Rendering...' : 'Render & Copy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
