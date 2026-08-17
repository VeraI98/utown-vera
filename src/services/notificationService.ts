import { api } from './api'

import type {
  PaginatedResponse,
} from '../types/restaurant'

export interface NotificationResponse {
  id: number
  title: string
  text: string
  date: string
  time: string
  isSuccessful: boolean
  errorMessage: string | null
  userId: number
}

export async function getMyNotifications(
  page = 0,
  size = 100,
): Promise<
  PaginatedResponse<NotificationResponse>
> {
  const { data } = await api.get<
    PaginatedResponse<NotificationResponse>
  >(
    '/notifications/my-notifications',
    {
      params: {
        page,
        size,
      },
    },
  )

  return data
}