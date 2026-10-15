import { Navigate } from 'react-router-dom'
import { useAuthUser } from './hooks'
import { getHomePath } from './routing'

export function HomeRedirect() {
  const user = useAuthUser()
  return <Navigate to={getHomePath(user)} replace />
}
