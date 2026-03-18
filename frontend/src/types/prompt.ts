export interface Prompt {
  id: string
  title: string
  content: string
  system_prompt?: string | null
  description?: string | null
  category?: string
  tags: string[]
  is_favorite: boolean
  is_template: boolean
  template_variables: string[]
  average_rating: number | null
  ratings_count: number
  created_at: string
  updated_at: string
}

export interface CreatePromptInput {
  title: string
  content: string
  system_prompt?: string
  description?: string
  category?: string
  tags?: string[]
  is_favorite?: boolean
  is_template?: boolean
}

export interface UpdatePromptInput {
  title?: string
  content?: string
  system_prompt?: string
  description?: string
  category?: string
  tags?: string[]
  is_favorite?: boolean
  is_template?: boolean
}

export interface PromptsResponse {
  prompts: Prompt[]
  total: number
  skip: number
  limit: number
}

export interface RatePromptInput {
  rating: number
  success?: boolean
  notes?: string
}

export interface RenderTemplateInput {
  variables: Record<string, string>
}

export interface RenderTemplateResponse {
  rendered_content: string
  missing_variables: string[]
  used_variables: string[]
}
