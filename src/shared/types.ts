// Shared API response type
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}
