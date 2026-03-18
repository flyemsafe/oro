'use client'

import { useRouter } from 'next/navigation'
import { PromptForm } from '@/components/prompts/PromptForm'
import { PromptFormValues } from '@/lib/validations/prompt'
import { useCreatePrompt } from '@/hooks/usePrompts'
import { CreatePromptInput } from '@/types/prompt'
import { toast } from 'sonner'

export default function NewPromptPage() {
  const router = useRouter()
  const createPrompt = useCreatePrompt()

  const handleSubmit = async (data: PromptFormValues) => {
    try {
      const payload: CreatePromptInput = {
        title: data.title,
        content: data.content,
        system_prompt: data.system_prompt || undefined,
        description: data.description || undefined,
        tags: data.tags,
        is_favorite: data.is_favorite,
        is_template: data.is_template,
      }

      await createPrompt.mutateAsync(payload)
      toast.success('Prompt created successfully!')
      router.push('/prompts')
    } catch (error) {
      toast.error('Failed to create prompt')
      console.error('Error creating prompt:', error)
    }
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
