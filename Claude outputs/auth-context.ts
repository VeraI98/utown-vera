import { createContext } from 'react'

import type { LoginData, RegisterData, User } from '../types/auth'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (data: LoginData) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => void
  updateUser: (updatedUser: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
