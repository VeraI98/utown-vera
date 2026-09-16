import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <p className="route-loading">Loading...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user?.roles ?? []

    const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role))

    if (!hasAllowedRole) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
