'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save, X, Eye, EyeOff } from 'lucide-react'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { PromptFormFields } from './PromptFormFields'
import { PromptPreview } from './PromptPreview'
import { promptFormSchema, PromptFormValues } from '@/lib/validations/prompt'
import { Prompt } from '@/types/prompt'

interface PromptFormProps {
  initialData?: Prompt
  onSubmit: (data: PromptFormValues) => Promise<void>
  existingTags?: string[]
  mode: 'create' | 'edit'
}

export function PromptForm({
  initialData,
  onSubmit,
  existingTags = [],
  mode,
}: PromptFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          system_prompt: '',
          description: '',
          category: initialData.category || '',
          tags: initialData.tags || [],
          is_favorite: initialData.is_favorite || false,
        }
      : {
          title: '',
          content: '',
          system_prompt: '',
          description: '',
          category: '',
          tags: [],
          is_favorite: false,
        },
  })

  const watchedValues = form.watch()

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const draftKey = `prompt-draft-${mode}`
      const draft = form.getValues()

      if (draft.title || draft.content) {
        setAutoSaveStatus('saving')
        localStorage.setItem(draftKey, JSON.stringify(draft))
        setTimeout(() => setAutoSaveStatus('saved'), 500)
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      }
    }, 30000) // 30 seconds

    return () => clearTimeout(timer)
  }, [watchedValues, mode, form])

  // Load draft on mount
  useEffect(() => {
    if (!initialData) {
      const draftKey = `prompt-draft-${mode}`
      const savedDraft = localStorage.getItem(draftKey)

      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          const shouldRestore = window.confirm(
            'Found an auto-saved draft. Would you like to restore it?'
          )

          if (shouldRestore) {
            form.reset(draft)
            toast.info('Draft restored')
          } else {
            localStorage.removeItem(draftKey)
          }
        } catch (error) {
          console.error('Failed to restore draft:', error)
        }
      }
    }
  }, [initialData, mode, form])

  const handleSubmit = async (data: PromptFormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)

      // Clear draft on successful submit
      const draftKey = `prompt-draft-${mode}`
      localStorage.removeItem(draftKey)

      toast.success(
        mode === 'create' ? 'Prompt created successfully!' : 'Prompt updated successfully!'
      )

      router.push('/prompts')
    } catch (error) {
      console.error('Failed to save prompt:', error)
      toast.error(
        mode === 'create' ? 'Failed to create prompt' : 'Failed to update prompt'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    const isDirty = form.formState.isDirty

    if (isDirty) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      )

      if (!shouldDiscard) {
        return
      }
    }

    // Clear draft
    const draftKey = `prompt-draft-${mode}`
    localStorage.removeItem(draftKey)

    router.back()
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Create Prompt' : 'Edit Prompt'}
          </h1>
          {autoSaveStatus !== 'idle' && (
            <p className="text-sm text-muted-foreground mt-1">
              {autoSaveStatus === 'saving' ? 'Saving draft...' : 'Draft saved'}
            </p>
          )}
        </div>

        {/* Mobile preview toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="md:hidden"
        >
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Preview
            </>
          )}
        </Button>
      </div>

      {/* Two-column layout */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Form fields */}
            <div className="space-y-6">
              <PromptFormFields form={form} existingTags={existingTags} />

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {mode === 'create' ? 'Create Prompt' : 'Save Changes'}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>

            {/* Right column - Preview */}
            <div className={showPreview ? 'block' : 'hidden md:block'}>
              <div className="sticky top-6">
                <PromptPreview
                  title={watchedValues.title}
                  content={watchedValues.content}
                  systemPrompt={watchedValues.system_prompt}
                  description={watchedValues.description}
                  tags={watchedValues.tags}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
