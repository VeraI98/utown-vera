import { useState, type ReactNode } from 'react'
import type { LoginData, RegisterData, User } from '../types/auth'
import {
  login as loginRequest,
  register as registerRequest,
} from '../services/authService'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

function getStoredUser(): User | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const savedUser = localStorage.getItem(USER_KEY)

  if (!token || !savedUser) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)

    return null
  }

  try {
    return JSON.parse(savedUser) as User
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)

    return null
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(getStoredUser)

  const saveAuthData = (
    token: string,
    refreshToken: string,
    authenticatedUser: User,
  ) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(authenticatedUser),
    )

    setUser(authenticatedUser)
  }

  const login = async (data: LoginData) => {
    const response = await loginRequest(data)

    saveAuthData(
      response.token,
      response.refreshToken,
      response.user,
    )
  }

  const register = async (data: RegisterData) => {
    const response = await registerRequest(data)

    saveAuthData(
      response.token,
      response.refreshToken,
      response.user,
    )
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
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