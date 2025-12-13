import api from '../../shared/api'
import type { ApiResponse } from '../../shared/types'
import type {
  CreateVocabRequest,
  TestAnswerRequest,
  TestOptionsResponse,
  TestResultResponse,
  TestVocabulary,
  UpdateVocabRequest,
  VocabListResponse,
  VocabStatsResponse,
  Vocabulary,
  VocabularyStatus,
} from './types'

export interface GetAllVocabsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: VocabularyStatus | 'all' | ''
}

export const vocabApi = {
  getAll: async ({
    page = 1,
    pageSize = 10,
    search = '',
    status = '',
  }: GetAllVocabsParams = {}): Promise<ApiResponse<VocabListResponse>> => {
    const response = await api.get<ApiResponse<VocabListResponse>>('/vocabularies', {
      params: {
        page,
        page_size: pageSize,
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
      },
    })
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<Vocabulary>> => {
    const response = await api.get<ApiResponse<Vocabulary>>(`/vocabularies/${id}`)
    return response.data
  },

  getStats: async (): Promise<ApiResponse<VocabStatsResponse>> => {
    const response = await api.get<ApiResponse<VocabStatsResponse>>('/vocabularies/stats')
    return response.data
  },

  create: async (data: CreateVocabRequest): Promise<ApiResponse<Vocabulary>> => {
    const response = await api.post<ApiResponse<Vocabulary>>('/vocabularies', data)
    return response.data
  },

  update: async (id: string, data: UpdateVocabRequest): Promise<ApiResponse<Vocabulary>> => {
    const response = await api.put<ApiResponse<Vocabulary>>(`/vocabularies/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/vocabularies/${id}`)
    return response.data
  },

  // Test endpoints
  getRandomForTest: async (
    status: VocabularyStatus | 'all' = 'all',
  ): Promise<ApiResponse<TestVocabulary>> => {
    const response = await api.get<ApiResponse<TestVocabulary>>('/test/vocabularies', {
      params: { status },
    })
    return response.data
  },

  getTestOptions: async (vocabId: string): Promise<ApiResponse<TestOptionsResponse>> => {
    const response = await api.get<ApiResponse<TestOptionsResponse>>(
      `/test/vocabularies/${vocabId}/options`,
    )
    return response.data
  },

  submitTestAnswer: async (
    id: string,
    data: TestAnswerRequest,
  ): Promise<ApiResponse<TestResultResponse>> => {
    const response = await api.post<ApiResponse<TestResultResponse>>(
      `/test/vocabularies/${id}/answer`,
      data,
    )
    return response.data
  },
}
