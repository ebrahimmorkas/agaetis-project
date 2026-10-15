import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginPayload } from './api'

export const currentUserKey = ['auth', 'me'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: authApi.me,
    staleTime: Infinity,
    retry: false,
  })
}

// Use inside routes that are already behind RequireAuth
export function useAuthUser() {
  const { data } = useCurrentUser()
  if (!data) throw new Error('useAuthUser must be used inside a protected route')
  return data
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user) => queryClient.setQueryData(currentUserKey, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(currentUserKey, null)
      navigate('/login', { replace: true })
    },
  })
}
