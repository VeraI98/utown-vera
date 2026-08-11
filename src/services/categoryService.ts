import { api } from './api'

import type {
  DishCategoryResponse,
  PaginatedResponse,
} from '../types/restaurant'

export async function getCategories(
  page = 0,
  size = 100,
): Promise<
  PaginatedResponse<DishCategoryResponse>
> {
  const { data } = await api.get<
    PaginatedResponse<DishCategoryResponse>
  >('/categories', {
    params: {
      page,
      size,
    },
  })

  return data
}

export async function getCategoryById(
  categoryId: number,
): Promise<DishCategoryResponse> {
  const { data } =
    await api.get<DishCategoryResponse>(
      `/categories/${categoryId}`,
    )

  return data
}

export async function getCategoriesByRestaurant(
  restaurantId: number,
  page = 0,
  size = 100,
): Promise<
  PaginatedResponse<DishCategoryResponse>
> {
  const { data } = await api.get<
    PaginatedResponse<DishCategoryResponse>
  >(
    `/categories/restaurant/${restaurantId}`,
    {
      params: {
        page,
        size,
      },
    },
  )

  return data
}