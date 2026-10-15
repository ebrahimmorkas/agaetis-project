import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { currentUserKey } from '@/features/auth/hooks'
import { api } from './api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined
        if (status && status < 500) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})

// If the session expires or the account is deactivated mid-use,
// drop the cached user so RequireAuth sends them back to login.
api.interceptors.response.use(undefined, (error) => {
  const url = error.config?.url ?? ''
  if (isAxiosError(error) && error.response?.status === 401 && !url.startsWith('/auth/')) {
    queryClient.setQueryData(currentUserKey, null)
  }
  return Promise.reject(error)
})
