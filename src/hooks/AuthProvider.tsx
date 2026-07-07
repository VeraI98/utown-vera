import { useEffect, useState, type ReactNode } from 'react'
import type { LoginData, RegisterData, User } from '../types/auth'
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from '../services/authService'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (data: LoginData) => {
    const response = await loginRequest(data)

    localStorage.setItem('token', response.token)
    setUser(response.user)
  }

  const register = async (data: RegisterData) => {
    const response = await registerRequest(data)

    localStorage.setItem('token', response.token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}