import { api } from './api'

import type {
  DishResponse,
  PaginatedResponse,
  RestaurantResponse,
  RestaurantStatus,
} from '../types/restaurant'

export interface RestaurantSearchParams {
  title?: string
  category?: string
  minRating?: number
  minMinOrderAmount?: number
  maxMinOrderAmount?: number
  city?: string
  status?: RestaurantStatus
  isRecommended?: boolean
  page?: number
  size?: number
}

export async function getRestaurantById(
  restaurantId: number,
): Promise<RestaurantResponse> {
  const { data } = await api.get<RestaurantResponse>(
    `/public/restaurants/${restaurantId}`,
  )

  return data
}

export async function getActiveRestaurants(): Promise<RestaurantResponse[]> {
  const { data } = await api.get<RestaurantResponse[]>(
    '/public/restaurants/active',
  )

  return data
}

export async function getRestaurants(
  page = 0,
  size = 20,
): Promise<PaginatedResponse<RestaurantResponse>> {
  const { data } = await api.get<PaginatedResponse<RestaurantResponse>>(
    '/public/restaurants',
    {
      params: {
        page,
        size,
      },
    },
  )

  return data
}

export async function searchRestaurants(
  title: string,
  page = 0,
  size = 50,
): Promise<PaginatedResponse<RestaurantResponse>> {
  const { data } = await api.get<PaginatedResponse<RestaurantResponse>>(
    '/public/restaurants/search',
    {
      params: {
        title,
        page,
        size,
      },
    },
  )

  return data
}

export async function searchRestaurantsAdvanced(
  params: RestaurantSearchParams,
): Promise<PaginatedResponse<RestaurantResponse>> {
  const {
    title,
    category,
    minRating,
    minMinOrderAmount,
    maxMinOrderAmount,
    city,
    status,
    isRecommended,
    page = 0,
    size = 50,
  } = params

  const { data } = await api.get<PaginatedResponse<RestaurantResponse>>(
    '/public/restaurants/search/advanced',
    {
      params: {
        ...(title ? { title } : {}),
        ...(category ? { category } : {}),
        ...(minRating !== undefined ? { minRating } : {}),
        ...(minMinOrderAmount !== undefined ? { minMinOrderAmount } : {}),
        ...(maxMinOrderAmount !== undefined ? { maxMinOrderAmount } : {}),
        ...(city ? { city } : {}),
        ...(status ? { status } : {}),
        ...(isRecommended !== undefined ? { isRecommended } : {}),
        page,
        size,
      },
    },
  )

  return data
}

export async function getRestaurantDishes(
  restaurantId: number,
  page = 0,
  size = 100,
): Promise<PaginatedResponse<DishResponse>> {
  const { data } = await api.get<PaginatedResponse<DishResponse>>(
    `/dishes/restaurant/${restaurantId}`,
    {
      params: {
        page,
        size,
      },
    },
  )

  return data
}
