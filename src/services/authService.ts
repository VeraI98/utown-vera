import { api } from './api'

import type {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
} from '../types/auth'

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

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export async function changePassword(
  data: ChangePasswordData,
): Promise<void> {
  await api.post('/auth/password/change', data)
}

export interface UpdateProfileData {
  fullName: string
  username: string
  defaultAddress: string
}

export async function updateProfile(
  data: UpdateProfileData,
): Promise<User> {
  const response = await api.put<User>(
    '/users/profile',
    data,
  )

  return response.data
}

export interface DeleteProfileData {
  password: string
}

export async function deleteProfile(
  data: DeleteProfileData,
): Promise<void> {
  await api.delete('/users/profile', {
    data,
  })
}