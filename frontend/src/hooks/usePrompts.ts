import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { promptsApi, type FetchPromptsParams } from '@/lib/api/prompts'
import type { CreatePromptInput, UpdatePromptInput } from '@/types/prompt'

const PROMPTS_QUERY_KEY = 'prompts'

/**
 * Hook to fetch prompts list with pagination and filters
 */
export function usePrompts(params: FetchPromptsParams = {}) {
  return useQuery({
    queryKey: [PROMPTS_QUERY_KEY, params],
    queryFn: () => promptsApi.fetchPrompts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch a single prompt
 */
export function usePrompt(id: string) {
  return useQuery({
    queryKey: [PROMPTS_QUERY_KEY, id],
    queryFn: () => promptsApi.fetchPrompt(id),
    enabled: !!id,
  })
}

/**
 * Hook to create a new prompt
 */
export function useCreatePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePromptInput) => promptsApi.createPrompt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] })
      toast.success('Prompt created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create prompt')
    },
  })
}

/**
 * Hook to update an existing prompt
 */
export function useUpdatePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromptInput }) =>
      promptsApi.updatePrompt(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY, variables.id] })
      toast.success('Prompt updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update prompt')
    },
  })
}

/**
 * Hook to delete a prompt
 */
export function useDeletePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => promptsApi.deletePrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] })
      toast.success('Prompt deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete prompt')
    },
  })
}
