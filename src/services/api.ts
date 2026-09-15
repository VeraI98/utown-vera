import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { logError } from '../utils/logger'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://utown-api.habsida.net/api'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  token: string
  refreshToken?: string
}

function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function redirectToLogin() {
  clearAuthData()
  window.location.href = '/login'
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!refreshToken) {
      redirectToLogin()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const { data } = await axios.post<RefreshResponse>(
        `${API_URL}/auth/refresh`,
        null,
        {
          params: {
            refreshToken,
          },
        },
      )

      localStorage.setItem(TOKEN_KEY, data.token)

      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
      }

      originalRequest.headers.Authorization = `Bearer ${data.token}`

      return api(originalRequest)
    } catch (refreshError) {
      logError('API: failed to refresh authentication token', refreshError)

      redirectToLogin()

      return Promise.reject(refreshError)
    }
  },
)
