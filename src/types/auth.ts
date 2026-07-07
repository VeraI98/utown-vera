export type UserRole = 'CLIENT' | 'RESTAURANT_ADMIN' | 'ADMIN'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}