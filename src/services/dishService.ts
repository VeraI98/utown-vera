import { api } from './api'

import type {
  DishResponse,
  PaginatedResponse,
} from '../types/restaurant'

interface GetRestaurantDishesParams {
  page?: number
  size?: number
  sort?: string[]
}

export async function getRestaurantDishes(
  restaurantId: number,
  params: GetRestaurantDishesParams = {},
): Promise<PaginatedResponse<DishResponse>> {
  const {
    page = 0,
    size = 100,
    sort = ['sort,asc'],
  } = params

  const { data } = await api.get<
    PaginatedResponse<DishResponse>
  >(
    `/dishes/restaurant/${restaurantId}`,
    {
      params: {
        page,
        size,
        sort,
      },
    },
  )

  return data
}

export async function getRestaurantDishesByCategory(
  restaurantId: number,
  categoryId: number,
): Promise<DishResponse[]> {
  const { data } = await api.get<DishResponse[]>(
    `/dishes/restaurant/${restaurantId}/category/${categoryId}`,
  )

  return data
}