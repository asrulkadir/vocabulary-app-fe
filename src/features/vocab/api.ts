import api from '../../shared/api'
import type { ApiResponse } from '../../shared/types'
import type { CreateVocabRequest, UpdateVocabRequest, VocabListResponse, Vocabulary } from './types'

export const vocabApi = {
  getAll: async (page = 1, pageSize = 10): Promise<ApiResponse<VocabListResponse>> => {
    const response = await api.get<ApiResponse<VocabListResponse>>('/vocabularies', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Vocabulary>> => {
    const response = await api.get<ApiResponse<Vocabulary>>(`/vocabularies/${id}`)
    return response.data
  },

  create: async (data: CreateVocabRequest): Promise<ApiResponse<Vocabulary>> => {
    const response = await api.post<ApiResponse<Vocabulary>>('/vocabularies', data)
    return response.data
  },

  update: async (id: number, data: UpdateVocabRequest): Promise<ApiResponse<Vocabulary>> => {
    const response = await api.put<ApiResponse<Vocabulary>>(`/vocabularies/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/vocabularies/${id}`)
    return response.data
  },

  updateTestResult: async (id: number, passed: boolean): Promise<ApiResponse<Vocabulary>> => {
    const response = await api.post<ApiResponse<Vocabulary>>(`/vocabularies/${id}/test-result`, {
      passed,
    })
    return response.data
  },
}
