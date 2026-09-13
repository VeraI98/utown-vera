import { api } from './api'

import type {
  DishResponse,
  PaginatedResponse,
} from '../types/restaurant'

export async function searchDishes(
  title: string,
  page = 0,
  size = 50,
): Promise<PaginatedResponse<DishResponse>> {
  const { data } = await api.get<
    PaginatedResponse<DishResponse>
  >('/dishes/search', {
    params: {
      title,
      page,
      size,
    },
  })

  return data
}

export async function getDishesByRestaurant(
  restaurantId: number,
  page = 0,
  size = 100,
): Promise<PaginatedResponse<DishResponse>> {
  const { data } = await api.get<
    PaginatedResponse<DishResponse>
  >(
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

export async function getDishesByCategory(
  categoryId: number,
  page = 0,
  size = 100,
): Promise<PaginatedResponse<DishResponse>> {
  const { data } = await api.get<
    PaginatedResponse<DishResponse>
  >(
    `/dishes/category/${categoryId}`,
    {
      params: {
        page,
        size,
      },
    },
  )

  return data
}