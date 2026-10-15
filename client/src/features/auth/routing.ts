import type { AuthUser } from './types'

// Where each role lands after logging in
export function getHomePath(_user: AuthUser) {
  return '/profile'
}
