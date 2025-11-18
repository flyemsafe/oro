import { api } from '../api'
import type {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  PromptsResponse
} from '@/types/prompt'

export interface FetchPromptsParams {
  skip?: number
  limit?: number
  search?: string
  category?: string
  tags?: string[]
  is_favorite?: boolean
  sort_by?: 'created_at' | 'updated_at' | 'title'
  sort_order?: 'asc' | 'desc'
}

export const promptsApi = {
  /**
   * Fetch prompts with pagination, search, and filters
   */
  async fetchPrompts(params: FetchPromptsParams = {}): Promise<PromptsResponse> {
    const queryParams = new URLSearchParams()

    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.category) queryParams.append('category', params.category)
    if (params.tags?.length) {
      params.tags.forEach(tag => queryParams.append('tags', tag))
    }
    if (params.is_favorite !== undefined) {
      queryParams.append('is_favorite', params.is_favorite.toString())
    }
    if (params.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params.sort_order) queryParams.append('sort_order', params.sort_order)

    const { data } = await api.get<PromptsResponse>(
      `/v1/prompts?${queryParams.toString()}`
    )
    return data
  },

  /**
   * Fetch a single prompt by ID
   */
  async fetchPrompt(id: string): Promise<Prompt> {
    const { data } = await api.get<Prompt>(`/v1/prompts/${id}`)
    return data
  },

  /**
   * Create a new prompt
   */
  async createPrompt(input: CreatePromptInput): Promise<Prompt> {
    const { data } = await api.post<Prompt>('/v1/prompts', input)
    return data
  },

  /**
   * Update an existing prompt
   */
  async updatePrompt(id: string, input: UpdatePromptInput): Promise<Prompt> {
    const { data } = await api.put<Prompt>(`/v1/prompts/${id}`, input)
    return data
  },

  /**
   * Delete a prompt
   */
  async deletePrompt(id: string): Promise<void> {
    await api.delete(`/v1/prompts/${id}`)
  },
}
