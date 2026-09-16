import { api } from './api'

import type { RestaurantResponse } from '../types/restaurant'

export type OwnerRestaurantStatus =
  'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED' | 'BUSY'

export async function getOwnerRestaurants(
  userId: number,
): Promise<RestaurantResponse[]> {
  const { data } = await api.get<RestaurantResponse[]>(
    '/restaurant-owner/restaurants',
    {
      params: {
        userId,
      },
    },
  )

  return data
}

export async function updateOwnerRestaurantStatus(
  restaurantId: number,
  status: OwnerRestaurantStatus,
): Promise<RestaurantResponse> {
  const { data } = await api.patch<RestaurantResponse>(
    `/restaurant-owner/restaurants/${restaurantId}/status`,
    null,
    {
      params: {
        status,
      },
    },
  )

  return data
}
