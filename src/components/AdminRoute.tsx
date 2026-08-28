import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface AdminRouteProps {
  children: ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <p className="route-loading">
        Loading...
      </p>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  const isAdmin = user?.roles.includes('ADMIN')

  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return children
}

export default AdminRoute