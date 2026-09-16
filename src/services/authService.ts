import { api } from './api'

import type { AuthResponse, LoginData, RegisterData, User } from '../types/auth'

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordData {
  username: string
}

export interface ResetPasswordData {
  username: string
  code: string
  newPassword: string
}

export interface UpdateProfileData {
  fullName: string
  defaultAddress: number | null
}

export interface DeleteProfileData {
  password: string
}

export async function login(request: LoginData): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', request)

  return data
}

export async function register(request: RegisterData): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', request)

  return data
}

export async function forgotPassword(
  request: ForgotPasswordData,
): Promise<void> {
  await api.post('/auth/password/forgot', request)
}

export async function resetPassword(request: ResetPasswordData): Promise<void> {
  await api.post('/auth/password/reset', request)
}

export async function changePassword(
  request: ChangePasswordData,
): Promise<void> {
  await api.post('/auth/password/change', request)
}

export async function updateProfile(request: UpdateProfileData): Promise<User> {
  const { data } = await api.put<User>('/users/profile', request)

  return data
}

export async function deleteProfile(request: DeleteProfileData): Promise<void> {
  await api.delete('/users/profile', {
    data: request,
  })
}
