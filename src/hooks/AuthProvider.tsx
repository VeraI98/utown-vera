import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type {
  LoginData,
  RegisterData,
  User,
} from '../types/auth'

import {
  login as loginRequest,
  register as registerRequest,
} from '../services/authService'

import { api } from '../services/api'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

function clearStoredAuthData() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function getStoredUser(): User | null {
  const savedUser = localStorage.getItem(USER_KEY)

  if (!savedUser) {
    return null
  }

  try {
    return JSON.parse(savedUser) as User
  } catch {
    clearStoredAuthData()
    return null
  }
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(
    getStoredUser,
  )

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY)

      if (!token) {
        clearStoredAuthData()
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const { data } = await api.get<User>(
          '/users/profile',
        )

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(data),
        )

        setUser(data)
      } catch {
        clearStoredAuthData()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (data: LoginData) => {
    const response = await loginRequest(data)

    localStorage.setItem(
      TOKEN_KEY,
      response.token,
    )

    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      response.refreshToken,
    )

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(response.user),
    )

    setUser(response.user)
  }

  const register = async (
    data: RegisterData,
  ) => {
    const response = await registerRequest(data)

    localStorage.setItem(
      TOKEN_KEY,
      response.token,
    )

    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      response.refreshToken,
    )

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(response.user),
    )

    setUser(response.user)
  }

  const logout = () => {
    clearStoredAuthData()
    setUser(null)
  }

  const updateUser = (
    updatedUser: User,
  ) => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser),
    )

    setUser(updatedUser)
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
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}