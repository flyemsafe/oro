import { z } from 'zod'

export const promptFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  content: z
    .string()
    .min(1, 'Content is required'),
  system_prompt: z
    .string()
    .optional(),
  description: z
    .string()
    .optional(),
  category: z
    .string()
    .optional(),
  tags: z
    .array(z.string()),
  is_favorite: z
    .boolean(),
})

export type PromptFormValues = z.infer<typeof promptFormSchema>
