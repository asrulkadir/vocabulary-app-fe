import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from './api'
import { useAuthStore } from './store'
import type { LoginRequest, RegisterRequest } from './types'

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token)
        queryClient.invalidateQueries()
        navigate({ to: '/dashboard' })
      }
    },
  })
}

export const useRegister = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token)
        queryClient.invalidateQueries()
        navigate({ to: '/dashboard' })
      }
    },
  })
}

export const useLogout = () => {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      navigate({ to: '/login' })
    },
    onError: () => {
      // Still clear auth on error (e.g., token already expired)
      clearAuth()
      queryClient.clear()
      navigate({ to: '/login' })
    },
  })
}
