export interface Prompt {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface CreatePromptInput {
  title: string
  content: string
  category?: string
  tags?: string[]
  is_favorite?: boolean
}

export interface UpdatePromptInput {
  title?: string
  content?: string
  category?: string
  tags?: string[]
  is_favorite?: boolean
}

export interface PromptsResponse {
  prompts: Prompt[]
  total: number
  skip: number
  limit: number
}
