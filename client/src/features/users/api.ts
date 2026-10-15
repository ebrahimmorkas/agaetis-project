import type { UserStatus } from '@/features/auth/types'
import { api, type ApiResponse, type PaginatedData } from '@/lib/api'
import type { CreateUserPayload, ManagerOption, UpdateUserPayload, User, UserFilters } from './types'

export const usersApi = {
  async list(filters: UserFilters) {
    const { data } = await api.get<ApiResponse<PaginatedData<User>>>('/users', { params: filters })
    return data.data
  },

  async get(id: number) {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`)
    return data.data
  },

  async managers() {
    const { data } = await api.get<ApiResponse<ManagerOption[]>>('/users/managers')
    return data.data
  },

  async create(payload: CreateUserPayload) {
    const { data } = await api.post<ApiResponse<User>>('/users', payload)
    return data.data
  },

  async update(id: number, payload: UpdateUserPayload) {
    const { data } = await api.patch<ApiResponse<User>>(`/users/${id}`, payload)
    return data.data
  },

  async setStatus(id: number, status: UserStatus) {
    const { data } = await api.patch<ApiResponse<User>>(`/users/${id}/status`, { status })
    return data.data
  },

  async resetPassword(id: number, password: string) {
    await api.patch(`/users/${id}/password`, { password })
  },
}
