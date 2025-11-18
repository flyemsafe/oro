'use client'

import { PromptForm } from '@/components/prompts/PromptForm'
import { PromptFormValues } from '@/lib/validations/prompt'
import { api } from '@/lib/api'
import { CreatePromptInput } from '@/types/prompt'

export default function NewPromptPage() {
  const handleSubmit = async (data: PromptFormValues) => {
    const payload: CreatePromptInput = {
      title: data.title,
      content: data.content,
      category: data.category || undefined,
      tags: data.tags && data.tags.length > 0 ? data.tags : undefined,
      is_favorite: data.is_favorite,
    }

    await api.post('/api/prompts/', payload)
  }

  // TODO: Fetch existing tags from API
  const existingTags = [
    'development',
    'writing',
    'analysis',
    'code-review',
    'documentation',
    'debugging',
  ]

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <PromptForm
        mode="create"
        onSubmit={handleSubmit}
        existingTags={existingTags}
      />
    </div>
  )
}
