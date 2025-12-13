export type VocabularyStatus = 'learning' | 'memorized'

export interface Vocabulary {
  id: string
  user_id: string
  word: string
  definition: string
  example?: Array<string>
  translation?: string
  status: VocabularyStatus
  test_count: number
  passed_test_count: number
  failed_test_count: number
  created_at: string
  updated_at: string
}

// TestVocabulary - vocabulary without answer fields (definition, example, translation)
export interface TestVocabulary {
  id: string
  user_id: string
  word: string
  status: VocabularyStatus
  test_count: number
  passed_test_count: number
  failed_test_count: number
  created_at: string
  updated_at: string
}

// TestOption - only id and translation for multiple-choice options
export interface TestOption {
  id: string
  translation: string
}

export interface TestOptionsResponse {
  options: Array<TestOption>
}

export interface VocabListResponse {
  data: Array<Vocabulary>
  total: number
  page: number
  page_size: number
  total_pages: number
  search?: string
  status?: string
}

export interface VocabStatsResponse {
  total: number
  learning: number
  memorized: number
}

export interface CreateVocabRequest {
  word: string
  definition?: string
  example?: Array<string>
  translation?: string
}

export interface UpdateVocabRequest {
  word?: string
  definition?: string
  example?: Array<string>
  translation?: string
  status?: VocabularyStatus
}

export interface TestAnswerRequest {
  input: string
}

export interface TestResultResponse {
  passed: boolean
  correct_answer?: string
  vocabulary: TestVocabulary
}
