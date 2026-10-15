import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageLoader } from '@/components/ui'
import { useCurrentUser } from './hooks'
import { getHomePath } from './routing'
import type { Role } from './types'

type RequireAuthProps = {
  roles?: Role[]
}

export function RequireAuth({ roles }: RequireAuthProps) {
  const { data: user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={getHomePath(user)} replace />

  return <Outlet />
}

export function GuestOnly() {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) return <PageLoader />
  if (user) return <Navigate to={getHomePath(user)} replace />

  return <Outlet />
}
