import { api } from './api'

import type {
  RestaurantResponse,
} from '../types/restaurant'

export async function getOwnerRestaurants(
  userId: number,
): Promise<RestaurantResponse[]> {
  const { data } =
    await api.get<RestaurantResponse[]>(
      '/restaurant-owner/restaurants',
      {
        params: {
          userId,
        },
      },
    )

  return data
}

export async function toggleOwnerRestaurantStatus(
  restaurantId: number,
): Promise<void> {
  await api.patch(
    `/restaurant-owner/restaurants/${restaurantId}/toggle-status`,
  )
}