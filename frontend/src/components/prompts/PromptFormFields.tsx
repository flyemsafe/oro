'use client'

import React, { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PromptTagInput } from './PromptTagInput'
import { PromptFormValues } from '@/lib/validations/prompt'

interface PromptFormFieldsProps {
  form: UseFormReturn<PromptFormValues>
  existingTags?: string[]
}

export function PromptFormFields({
  form,
  existingTags = [],
}: PromptFormFieldsProps) {
  const [showSystemPrompt, setShowSystemPrompt] = useState(
    !!form.getValues('system_prompt')
  )

  const contentValue = form.watch('content')

  return (
    <div className="space-y-6">
      {/* Title Field */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title *</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter prompt title..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description Field */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description of this prompt..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Optional description to help you remember what this prompt does
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category Field */}
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Development, Writing, Analysis..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags Field */}
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
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Content Field */}
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter your prompt content here... Use {{variable}} for template variables."
                className="min-h-[200px] font-mono"
                {...field}
              />
            </FormControl>
            <FormDescription>
              <div className="flex justify-between items-center">
                <span>Use {'{{variable}}'} syntax for template variables</span>
                <span className="text-xs">
                  {contentValue?.length || 0} characters
                </span>
              </div>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* System Prompt Field (Collapsible) */}
      <div className="border rounded-lg p-4">
        <button
          type="button"
          onClick={() => setShowSystemPrompt(!showSystemPrompt)}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <span className="text-sm font-medium">System Prompt (Optional)</span>
          {showSystemPrompt ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showSystemPrompt && (
          <FormField
            control={form.control}
            name="system_prompt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Enter system prompt to set context or behavior..."
                    className="min-h-[120px] font-mono"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  System prompt sets the context or behavior for the AI
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  )
}
