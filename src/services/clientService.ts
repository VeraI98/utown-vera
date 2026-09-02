import { api } from './api'

import type { User } from '../types/auth'
import type { PaginatedResponse } from '../types/restaurant'

export interface GetClientsParams {
  page?: number
  size?: number
  search?: string
  city?: string
}

export async function getClients(
  params: GetClientsParams = {},
): Promise<PaginatedResponse<User>> {
  const {
    page = 0,
    size = 10,
    search,
    city,
  } = params

  const { data } = await api.get<
    PaginatedResponse<User>
  >('/admin/clients', {
    params: {
      page,
      size,
      search,
      city,
    },
  })

  return data
}
