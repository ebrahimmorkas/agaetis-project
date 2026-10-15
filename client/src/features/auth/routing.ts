import { hasAnyUserAccess } from './permissions'
import type { AuthUser } from './types'

// Where each role lands after logging in
export function getHomePath(user: AuthUser) {
  if (user.role === 'manager') return '/team'
  if (hasAnyUserAccess(user)) return '/users'
  return '/profile'
}
