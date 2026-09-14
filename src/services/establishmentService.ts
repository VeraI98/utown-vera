import { api } from './api'

import type { EstablishmentResponse } from '../types/establishment'
import type { PaginatedResponse, RestaurantResponse } from '../types/restaurant'

export interface CreateEstablishmentAddress {
  city?: string
  area?: string
  street?: string
  details?: string
  fullAddress?: string
  state?: string
  postcode?: string
  intercomCode?: string
}

export interface CreateEstablishmentRequest {
  title: string
  description?: string
  category: string
  deliveryTime?: string
  facilities?: string
  minOrderAmount: number
  phone?: string
  imageUrl?: string
  address: CreateEstablishmentAddress
}

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
  const { page = 0, size = 10, search, city, isActive } = params

  const { data } = await api.get<PaginatedResponse<EstablishmentResponse>>(
    '/admin/restaurants',
    {
      params: {
        page,
        size,
        search,
        city,
        isActive,
      },
    },
  )

  return data
}

export async function getEstablishmentById(
  establishmentId: number,
): Promise<EstablishmentResponse> {
  const { data } = await api.get<EstablishmentResponse>(
    `/admin/restaurants/${establishmentId}`,
  )

  return data
}

export async function deleteEstablishment(
  establishmentId: number,
): Promise<void> {
  await api.delete(`/admin/restaurants/${establishmentId}`)
}

export async function createEstablishment(
  request: CreateEstablishmentRequest,
): Promise<RestaurantResponse> {
  const { data } = await api.post<RestaurantResponse>(
    '/admin/restaurants',
    request,
  )

  return data
}

export async function updateEstablishment(
  establishmentId: number,
  request: CreateEstablishmentRequest,
): Promise<RestaurantResponse> {
  const { data } = await api.put<RestaurantResponse>(
    `/admin/restaurants/${establishmentId}`,
    request,
  )

  return data
}
