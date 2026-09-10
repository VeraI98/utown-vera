import type { UserRole } from './auth'

export interface ClientResponse {
  id: number
  fullName: string
  username: string
  email: string
  role: UserRole
  isActive: boolean
  avatarUrl: string | null
  city: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface CreateClientRequest {
  fullName: string
  username: string
  email?: string
  role?: UserRole
  city?: string
  address?: string
}

export interface UpdateClientRequest {
  fullName?: string
  email?: string
  city?: string
  address?: string
}
