import { api } from './api'

import type {
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from '../types/client'
import type { PaginatedResponse } from '../types/restaurant'

export interface GetClientsParams {
  page?: number
  size?: number
  search?: string
  city?: string
}

export async function getClients(
  params: GetClientsParams = {},
): Promise<PaginatedResponse<ClientResponse>> {
  const { page = 0, size = 10, search, city } = params

  const { data } = await api.get<PaginatedResponse<ClientResponse>>(
    '/admin/clients',
    {
      params: {
        page,
        size,
        search,
        city,
      },
    },
  )

  return data
}

export async function getClientById(clientId: number): Promise<ClientResponse> {
  const { data } = await api.get<ClientResponse>(`/admin/clients/${clientId}`)

  return data
}

export async function createClient(
  request: CreateClientRequest,
): Promise<ClientResponse> {
  const { data } = await api.post<ClientResponse>('/admin/clients', request)

  return data
}

export async function updateClient(
  clientId: number,
  request: UpdateClientRequest,
): Promise<ClientResponse> {
  const { data } = await api.put<ClientResponse>(
    `/admin/clients/${clientId}`,
    request,
  )

  return data
}
