import { createContext } from 'react'
import type {
  LoginData,
  RegisterData,
  User,
} from '../types/auth'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (updatedUser: User) => void
}

export const AuthContext =
  createContext<AuthContextValue | null>(null)