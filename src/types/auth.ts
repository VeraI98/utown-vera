export type UserRole =
  | 'CLIENT'
  | 'RESTAURATEUR'
  | 'ADMIN'

export interface User {
  id: number
  username: string
  fullName: string
  isActive: boolean
  defaultAddress: number | null
  roles: UserRole[]
  createdAt: string
  updatedAt: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}