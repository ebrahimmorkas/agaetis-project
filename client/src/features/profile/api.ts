import { api, type ApiResponse } from '@/lib/api'
import type { AuthUser } from '@/features/auth/types'

export type ProfilePayload = {
  name: string
  email: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export const profileApi = {
  async update(payload: ProfilePayload) {
    const { data } = await api.patch<ApiResponse<AuthUser>>('/profile', payload)
    return data.data
  },

  async changePassword(payload: ChangePasswordPayload) {
    await api.patch('/profile/password', payload)
  },
}
