import { isAxiosError } from 'axios'
import { api, type ApiResponse } from '@/lib/api'
import type { AuthUser } from './types'

export type LoginPayload = {
  email: string
  password: string
}

export const authApi = {
  async me() {
    try {
      const { data } = await api.get<ApiResponse<AuthUser>>('/auth/me')
      return data.data
    } catch (error) {
      // not logged in is a normal state, not an error
      if (isAxiosError(error) && error.response?.status === 401) return null
      throw error
    }
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post<ApiResponse<AuthUser>>('/auth/login', payload)
    return data.data
  },

  async logout() {
    await api.post('/auth/logout')
  },
}
