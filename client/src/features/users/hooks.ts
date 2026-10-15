import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserStatus } from '@/features/auth/types'
import { usersApi } from './api'
import type { CreateUserPayload, UpdateUserPayload, UserFilters } from './types'

const userKeys = {
  all: ['users'] as const,
  list: (filters: UserFilters) => [...userKeys.all, 'list', filters] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
  managers: () => [...userKeys.all, 'managers'] as const,
}

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useUser(id: number | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? 0),
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  })
}

export function useManagerOptions(enabled: boolean) {
  return useQuery({
    queryKey: userKeys.managers(),
    queryFn: usersApi.managers,
    enabled,
  })
}

function useInvalidateUsers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all })
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) => usersApi.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useSetUserStatus() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: UserStatus }) => usersApi.setStatus(id, status),
    onSuccess: invalidate,
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => usersApi.resetPassword(id, password),
  })
}
