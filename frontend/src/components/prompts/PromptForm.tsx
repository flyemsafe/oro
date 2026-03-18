'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save, X } from 'lucide-react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { promptFormSchema, PromptFormValues } from '@/lib/validations/prompt'
import { Prompt } from '@/types/prompt'
import { PromptTagInput } from './PromptTagInput'
import { extractTemplateVariables } from '@/lib/prompt-utils'

type LiteLLMChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Record<string, unknown>
    }
  }>
}

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') {
      continue
    }
    const normalized = item.trim()
    if (!normalized) {
      continue
    }
    seen.add(normalized)
  }
  return Array.from(seen)
}

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
  const [isParsing, setIsParsing] = useState(false)
  const [rawPromptInput, setRawPromptInput] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          system_prompt: initialData.system_prompt || '',
          description: initialData.description || '',
          tags: initialData.tags || [],
          is_favorite: initialData.is_favorite || false,
          is_template: initialData.is_template || false,
        }
      : {
          title: '',
          content: '',
          system_prompt: '',
          description: '',
          tags: [],
          is_favorite: false,
          is_template: false,
        },
  })

  const watchedValues = form.watch()
  const watchedContent = form.watch('content')

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

  async function parseWithLiteLLM() {
    if (!rawPromptInput.trim()) {
      toast.error('Paste raw prompt text before parsing.')
      return
    }

    setIsParsing(true)

    try {
      const response = await fetch('http://localhost:4000/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'your-local-model-name',
          messages: [
            {
              role: 'system',
              content: "You are a prompt-parsing assistant. Extract the components of the user's raw text into a JSON object. You must extract: 'title' (a short name), 'description' (brief summary), 'tags' (array of strings for categorization), 'system_prompt' (instructions to the AI, if any), and 'content' (the main prompt body). Return ONLY valid JSON matching these keys.",
            },
            {
              role: 'user',
              content: rawPromptInput,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      })

      const payload = (await response.json()) as LiteLLMChatCompletionResponse & {
        error?: { message?: string }
      }

      if (!response.ok) {
        throw new Error(payload.error?.message || `LiteLLM request failed (${response.status})`)
      }

      const messageContent = payload.choices?.[0]?.message?.content
      if (!messageContent) {
        throw new Error('LiteLLM returned an empty response.')
      }

      const parsed =
        typeof messageContent === 'string'
          ? (JSON.parse(messageContent) as Record<string, unknown>)
          : messageContent

      const nextTitle = toTrimmedString(parsed.title)
      const nextDescription = toTrimmedString(parsed.description)
      const nextSystemPrompt = toTrimmedString(parsed.system_prompt)
      const nextContent = toTrimmedString(parsed.content)
      const nextTags = normalizeTags(parsed.tags)

      form.setValue('title', nextTitle, { shouldDirty: true, shouldValidate: true })
      form.setValue('description', nextDescription, { shouldDirty: true, shouldValidate: true })
      form.setValue('system_prompt', nextSystemPrompt, { shouldDirty: true, shouldValidate: true })
      form.setValue('content', nextContent, { shouldDirty: true, shouldValidate: true })
      form.setValue('tags', nextTags, { shouldDirty: true, shouldValidate: true })
      form.setValue(
        'is_template',
        extractTemplateVariables(nextContent).length > 0,
        { shouldDirty: true }
      )

      toast.success('Prompt parsed. Review and save.')
    } catch (error) {
      console.error('LiteLLM parsing failed:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to parse prompt with LiteLLM.'
      )
    } finally {
      setIsParsing(false)
    }
  }

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
    <div className="space-y-4">
      {/* Header with actions */}
      <div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'create' ? 'Create Prompt' : 'Edit Prompt'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Paste unstructured prompt notes, parse with LiteLLM, then review and save.
          </p>
          {autoSaveStatus !== 'idle' && (
            <p className="text-sm text-muted-foreground mt-1">
              {autoSaveStatus === 'saving' ? 'Saving draft...' : 'Draft saved'}
            </p>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Pane - Ingestion */}
            <div className="rounded-xl border bg-card/30 p-5 space-y-4 shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="raw-prompt-input">Raw Prompt Input</Label>
                <Textarea
                  id="raw-prompt-input"
                  value={rawPromptInput}
                  onChange={(event) => setRawPromptInput(event.target.value)}
                  placeholder="Paste raw AI prompt notes, transcript snippets, or rough ideas here..."
                  className="min-h-[300px] font-mono bg-muted/40 focus:bg-background border-muted-foreground/20"
                />
                <p className="text-sm text-muted-foreground">
                  This raw text is sent to your local LiteLLM router and parsed into structured fields.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => void parseWithLiteLLM()}
                disabled={isParsing}
                className="w-full sm:w-auto"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  'Parse Prompt'
                )}
              </Button>
            </div>

            {/* Right Pane - Validation */}
            <div className="rounded-xl border bg-card/30 p-5 space-y-4 shadow-sm">
              <div className="flex h-full flex-col space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Short prompt title..."
                          className="bg-muted/40 focus:bg-background border-muted-foreground/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <PromptTagInput
                          value={field.value || []}
                          onChange={field.onChange}
                          existingTags={existingTags}
                        />
                      </FormControl>
                      <FormDescription>
                        Use tags for classification.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary of this prompt..."
                          className="min-h-[60px] bg-muted/40 focus:bg-background border-muted-foreground/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Main prompt body..."
                          className="min-h-[220px] font-mono bg-muted/40 focus:bg-background border-muted-foreground/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex items-center justify-between gap-2">
                        <span>Use {'{{variable}}'} syntax for template variables</span>
                        <span className="text-xs">{watchedContent?.length || 0} characters</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="system_prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional system-level instructions for the model..."
                          className="min-h-[100px] font-mono bg-muted/40 focus:bg-background border-muted-foreground/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action buttons */}
                <div className="flex gap-3 pt-2 mt-auto">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {mode === 'create' ? 'Save Prompt' : 'Save Changes'}
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
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
