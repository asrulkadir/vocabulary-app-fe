import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vocabApi } from './api'
import type { CreateVocabRequest, UpdateVocabRequest } from './types'

const VOCAB_KEYS = {
  all: ['vocabularies'] as const,
  list: (page: number, pageSize: number) => [...VOCAB_KEYS.all, page, pageSize] as const,
}

export const useVocabularies = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: VOCAB_KEYS.list(page, pageSize),
    queryFn: () => vocabApi.getAll(page, pageSize),
  })
}

export const useAllVocabularies = () => {
  return useQuery({
    queryKey: [...VOCAB_KEYS.all, 'all'],
    queryFn: () => vocabApi.getAll(1, 1000),
  })
}

export const useCreateVocab = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVocabRequest) => vocabApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCAB_KEYS.all })
    },
  })
}

export const useUpdateVocab = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVocabRequest }) => vocabApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCAB_KEYS.all })
    },
  })
}

export const useDeleteVocab = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => vocabApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCAB_KEYS.all })
    },
  })
}

export const useUpdateTestResult = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { passed: boolean } }) => vocabApi.updateTestResult(id, data.passed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCAB_KEYS.all })
    },
  })
}
