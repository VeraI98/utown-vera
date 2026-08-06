import { api } from './api'

import type {
  DishResponse,
  PaginatedResponse,
  RestaurantResponse,
} from '../types/restaurant'

export async function getRestaurantById(
  restaurantId: number,
): Promise<RestaurantResponse> {
  const { data } = await api.get<RestaurantResponse>(
    `/public/restaurants/${restaurantId}`,
  )

  return data
}

export async function getRestaurantDishes(
  restaurantId: number,
  page = 0,
  size = 100,
): Promise<PaginatedResponse<DishResponse>> {
  const { data } = await api.get<
    PaginatedResponse<DishResponse>
  >(`/dishes/restaurant/${restaurantId}`, {
    params: {
      page,
      size,
    },
  })

  return data
}