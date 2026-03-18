import { Prisma } from '@prisma/client'

export interface PromptRatingSummary {
  averageRating: number | null
  ratingsCount: number
}

export function extractTemplateVariables(text: string | null | undefined): string[] {
  if (!text) {
    return []
  }

  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g
  const seen = new Set<string>()
  let match = regex.exec(text)

  while (match) {
    seen.add(match[1])
    match = regex.exec(text)
  }

  return Array.from(seen)
}

export function renderTemplateText(
  content: string,
  variables: Record<string, string>
): { renderedContent: string; missingVariables: string[]; usedVariables: string[] } {
  const usedVariables = extractTemplateVariables(content)
  const missingVariables = usedVariables.filter((name) => !(name in variables))

  const renderedContent = content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_full, rawName) => {
    const name = String(rawName)
    return Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : `{{${name}}}`
  })

  return {
    renderedContent,
    missingVariables,
    usedVariables,
  }
}

export function normalizeTagNames(tagNames: unknown): string[] {
  if (!Array.isArray(tagNames)) {
    return []
  }

  const unique = new Set<string>()
  for (const tag of tagNames) {
    if (typeof tag !== 'string') {
      continue
    }
    const normalized = tag.trim()
    if (!normalized) {
      continue
    }
    unique.add(normalized)
  }
  return Array.from(unique)
}

export function summarizeRatings(executions: Array<{ rating: number | null }>): PromptRatingSummary {
  const ratings = executions
    .map((execution) => execution.rating)
    .filter((rating): rating is number => typeof rating === 'number')

  if (ratings.length === 0) {
    return {
      averageRating: null,
      ratingsCount: 0,
    }
  }

  const sum = ratings.reduce((acc, current) => acc + current, 0)
  return {
    averageRating: Number((sum / ratings.length).toFixed(2)),
    ratingsCount: ratings.length,
  }
}

type PromptWithTags = Prisma.PromptGetPayload<{
  include: {
    tags: {
      include: {
        tag: true
      }
    }
  }
}>

export function toPromptResponse(
  prompt: PromptWithTags,
  ratingSummary?: PromptRatingSummary
) {
  return {
    id: prompt.id,
    title: prompt.name,
    content: prompt.content,
    system_prompt: prompt.systemPrompt,
    description: prompt.description,
    tags: prompt.tags.map((promptTag) => promptTag.tag.name),
    is_favorite: prompt.isFavorite,
    is_template: prompt.isTemplate,
    template_variables: extractTemplateVariables(prompt.content),
    average_rating: ratingSummary?.averageRating ?? null,
    ratings_count: ratingSummary?.ratingsCount ?? 0,
    created_at: prompt.createdAt.toISOString(),
    updated_at: prompt.updatedAt.toISOString(),
  }
}
