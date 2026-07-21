import { api } from './api'
import type {
  AuthResponse,
  LoginData,
  RegisterData,
} from '../types/auth'

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export async function login(
  data: LoginData,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/auth/login',
    data,
  )

  return response.data
}

export async function register(
  data: RegisterData,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/auth/register',
    data,
  )

  return response.data
}

export async function changePassword(
  data: ChangePasswordData,
): Promise<void> {
  await api.post('/auth/password/change', data)
}