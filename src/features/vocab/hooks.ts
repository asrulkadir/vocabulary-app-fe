import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {  vocabApi } from './api'
import type {GetAllVocabsParams} from './api';
import type {
  CreateVocabRequest,
  TestAnswerRequest,
  UpdateVocabRequest,
  VocabularyStatus,
} from './types'

const VOCAB_KEYS = {
  all: ['vocabularies'] as const,
  list: (params: GetAllVocabsParams) =>
    [...VOCAB_KEYS.all, params.page, params.pageSize, params.search, params.status] as const,
  stats: ['vocabularies', 'stats'] as const,
  test: (status: VocabularyStatus | 'all') => ['test-vocabulary', status] as const,
  testOptions: (vocabId: string) => ['test-options', vocabId] as const,
}

export const useVocabularies = (params: GetAllVocabsParams = {}) => {
  const { page = 1, pageSize = 10, search = '', status = '' } = params
  return useQuery({
    queryKey: VOCAB_KEYS.list({ page, pageSize, search, status }),
    queryFn: () => vocabApi.getAll({ page, pageSize, search, status }),
  })
}

export const useVocabStats = () => {
  return useQuery({
    queryKey: VOCAB_KEYS.stats,
    queryFn: () => vocabApi.getStats(),
  })
}

export const useRandomVocabulary = (status: VocabularyStatus | 'all' = 'all', enabled = true) => {
  return useQuery({
    queryKey: VOCAB_KEYS.test(status),
    queryFn: () => vocabApi.getRandomForTest(status),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })
}

export const useTestOptions = (vocabId: string, enabled = true) => {
  return useQuery({
    queryKey: VOCAB_KEYS.testOptions(vocabId),
    queryFn: () => vocabApi.getTestOptions(vocabId),
    enabled: enabled && !!vocabId,
    staleTime: 0,
    gcTime: 0,
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
    mutationFn: ({ id, data }: { id: string; data: UpdateVocabRequest }) =>
      vocabApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCAB_KEYS.all })
    },
  })
}

export const useDeleteVocab = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vocabApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCAB_KEYS.all })
    },
  })
}

export const useSubmitTestAnswer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestAnswerRequest }) =>
      vocabApi.submitTestAnswer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCAB_KEYS.all })
    },
  })
}
