import { api } from './api'

import type { User } from '../types/auth'
import type { PaginatedResponse } from '../types/restaurant'

export interface GetClientsParams {
  page?: number
  size?: number
  search?: string
  city?: string
}

export interface ClientPayload {
  fullName: string
}

export async function createClient(
  payload: ClientPayload,
): Promise<User> {
  const { data } = await api.post<User>(
    '/admin/clients',
    payload,
  )

  return data
}

export async function updateClient(
  clientId: number,
  payload: ClientPayload,
): Promise<User> {
  const { data } = await api.put<User>(
    `/admin/clients/${clientId}`,
    payload,
  )

  return data
}

export async function getClientById(
  clientId: number,
): Promise<User> {
  const { data } = await api.get<User>(
    `/admin/clients/${clientId}`,
  )

  return data
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
