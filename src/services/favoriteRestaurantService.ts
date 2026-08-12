import { api } from './api'

import type {
  PaginatedResponse,
  RestaurantResponse,
} from '../types/restaurant'

export interface FavoriteRestaurantResponse {
  id: number
  userId: number
  restaurantId: number
  restaurant: RestaurantResponse
  createdAt: string
  updatedAt: string
}

export async function getFavoriteRestaurants(): Promise<
  FavoriteRestaurantResponse[]
> {
  const { data } = await api.get<
    FavoriteRestaurantResponse[]
  >('/favorites')

  return data
}

export async function getFavoriteRestaurantsPaginated(
  page = 0,
  size = 20,
): Promise<
  PaginatedResponse<FavoriteRestaurantResponse>
> {
  const { data } = await api.get<
    PaginatedResponse<FavoriteRestaurantResponse>
  >('/favorites/paginated', {
    params: {
      page,
      size,
    },
  })

  return data
}

export async function addRestaurantToFavorites(
  restaurantId: number,
): Promise<FavoriteRestaurantResponse> {
  const { data } =
    await api.post<FavoriteRestaurantResponse>(
      `/favorites/restaurants/${restaurantId}`,
    )

  return data
}

export async function removeRestaurantFromFavorites(
  restaurantId: number,
): Promise<FavoriteRestaurantResponse> {
  const { data } =
    await api.delete<FavoriteRestaurantResponse>(
      `/favorites/restaurants/${restaurantId}`,
    )

  return data
}

export async function isRestaurantFavorite(
  restaurantId: number,
): Promise<boolean> {
  const favorites =
    await getFavoriteRestaurants()

  return favorites.some(
    (favorite) =>
      favorite.restaurantId ===
        restaurantId ||
      favorite.restaurant?.id ===
        restaurantId,
  )
}