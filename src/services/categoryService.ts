import { api } from './api'

import type {
  DishCategoryResponse,
  PaginatedResponse,
} from '../types/restaurant'

export interface CreateCategoryRequest {
  name: string
  sort?: number
  imageUrl?: string
  restaurantId: number
}

export interface UpdateCategoryRequest {
  name?: string
  sort?: number
  imageUrl?: string
}

export async function getCategories(
  page = 0,
  size = 100,
): Promise<PaginatedResponse<DishCategoryResponse>> {
  const { data } = await api.get<PaginatedResponse<DishCategoryResponse>>(
    '/categories',
    {
      params: {
        page,
        size,
      },
    },
  )

  return data
}

export async function getCategoryById(
  categoryId: number,
): Promise<DishCategoryResponse> {
  const { data } = await api.get<DishCategoryResponse>(
    `/categories/${categoryId}`,
  )

  return data
}

export async function getCategoriesByRestaurant(
  restaurantId: number,
  page = 0,
  size = 100,
): Promise<PaginatedResponse<DishCategoryResponse>> {
  const { data } = await api.get<PaginatedResponse<DishCategoryResponse>>(
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

export async function createCategory(
  request: CreateCategoryRequest,
): Promise<DishCategoryResponse> {
  const { data } = await api.post<DishCategoryResponse>(
    '/admin/categories',
    request,
  )

  return data
}

export async function updateCategory(
  categoryId: number,
  request: UpdateCategoryRequest,
): Promise<DishCategoryResponse> {
  const { data } = await api.put<DishCategoryResponse>(
    `/admin/categories/${categoryId}`,
    request,
  )

  return data
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await api.delete(`/admin/categories/${categoryId}`)
}
