'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PromptForm } from '@/components/prompts/PromptForm'
import { PromptFormValues } from '@/lib/validations/prompt'
import { api } from '@/lib/api'
import { Prompt, UpdatePromptInput } from '@/types/prompt'
import { Loader2 } from 'lucide-react'

export default function EditPromptPage() {
  const params = useParams()
  const id = params.id as string

  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/prompts/${id}`)
        setPrompt(response.data)
      } catch (err) {
        console.error('Failed to fetch prompt:', err)
        setError('Failed to load prompt')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPrompt()
    }
  }, [id])

  const handleSubmit = async (data: PromptFormValues) => {
    const payload: UpdatePromptInput = {
      title: data.title,
      content: data.content,
      category: data.category || undefined,
      tags: data.tags && data.tags.length > 0 ? data.tags : undefined,
      is_favorite: data.is_favorite,
    }

    await api.put(`/api/prompts/${id}`, payload)
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

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground">
              {error || 'Prompt not found'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <PromptForm
        mode="edit"
        initialData={prompt}
        onSubmit={handleSubmit}
        existingTags={existingTags}
      />
    </div>
  )
}
