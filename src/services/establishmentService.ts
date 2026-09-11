import { api } from './api'

import type { EstablishmentResponse } from '../types/establishment'
import type { PaginatedResponse } from '../types/restaurant'

export interface GetEstablishmentsParams {
  page?: number
  size?: number
  search?: string
  city?: string
  isActive?: boolean
}

export async function getEstablishments(
  params: GetEstablishmentsParams = {},
): Promise<PaginatedResponse<EstablishmentResponse>> {
  const {
    page = 0,
    size = 10,
    search,
    city,
    isActive,
  } = params

  const { data } = await api.get<
    PaginatedResponse<EstablishmentResponse>
  >('/admin/restaurants', {
    params: {
      page,
      size,
      search,
      city,
      isActive,
    },
  })

  return data
}

export async function getEstablishmentById(
  establishmentId: number,
): Promise<EstablishmentResponse> {
  const { data } =
    await api.get<EstablishmentResponse>(
      `/admin/restaurants/${establishmentId}`,
    )

  return data
}

export async function deleteEstablishment(
  establishmentId: number,
): Promise<void> {
  await api.delete(
    `/admin/restaurants/${establishmentId}`,
  )
}
