export type VocabularyStatus = 'learning' | 'memorized'

export interface Vocabulary {
  id: number
  user_id: number
  word: string
  definition: string
  example: string[]
  translation?: string
  status: VocabularyStatus
  test_count: number
  passed_test_count: number
  failed_test_count: number
  created_at: string
  updated_at: string
}

export interface VocabListResponse {
  data: Vocabulary[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface CreateVocabRequest {
  word: string
  definition?: string
  example?: string[]
  translation?: string
}

export interface UpdateVocabRequest {
  word?: string
  definition?: string
  example?: string[]
  translation?: string
  status?: VocabularyStatus
}

export interface TestResultRequest {
  passed: boolean
}
