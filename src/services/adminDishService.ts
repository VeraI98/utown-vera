import { api } from './api'

import type {
  DishOption,
  DishResponse,
  PaginatedResponse,
} from '../types/restaurant'

export interface CreateDishRequest {
  title: string
  description?: string
  price: number
  sort?: number
  imageUrl?: string
  restaurantId: number
  dishCategoryId: number
}

export interface UpdateDishRequest {
  title?: string
  description?: string
  price?: number
  sort?: number
  imageUrl?: string
  dishCategoryId?: number
}

export interface GetAdminDishesParams {
  page?: number
  size?: number
  search?: string
  category?: string
  isActive?: boolean
}

export async function getAdminDishes(
  params: GetAdminDishesParams = {},
): Promise<PaginatedResponse<DishResponse>> {
  const {
    page = 0,
    size = 10,
    search,
    category,
    isActive,
  } = params

  const { data } = await api.get<
    PaginatedResponse<DishResponse>
  >('/admin/dishes', {
    params: {
      page,
      size,
      search,
      category,
      isActive,
    },
  })

  return data
}

export async function createDish(
  request: CreateDishRequest,
): Promise<DishResponse> {
  const { data } = await api.post<DishResponse>(
    '/admin/dishes',
    request,
  )

  return data
}

export async function updateDish(
  dishId: number,
  request: UpdateDishRequest,
): Promise<DishResponse> {
  const { data } = await api.put<DishResponse>(
    `/admin/dishes/${dishId}`,
    request,
  )

  return data
}

export async function deleteDish(
  dishId: number,
): Promise<void> {
  await api.delete(`/admin/dishes/${dishId}`)
}

export async function activateDish(
  dishId: number,
): Promise<void> {
  await api.patch(`/dishes/${dishId}/activate`)
}

export async function deactivateDish(
  dishId: number,
): Promise<void> {
  await api.patch(`/dishes/${dishId}/deactivate`)
}

export interface CreateElementRequest {
  name: string
  description?: string
  price?: number
}

export interface CreateOptionRequest {
  name: string
  isRequired?: boolean
  min?: number
  max?: number
  elements: CreateElementRequest[]
}

export async function createDishOption(
  dishId: number,
  request: CreateOptionRequest,
): Promise<DishOption> {
  const { data } = await api.post<DishOption>(
    `/admin/dishes/${dishId}/options`,
    request,
  )

  return data
}

export async function updateDishOption(
  dishId: number,
  optionId: number,
  request: CreateOptionRequest,
): Promise<DishOption> {
  const { data } = await api.put<DishOption>(
    `/admin/dishes/${dishId}/options/${optionId}`,
    request,
  )

  return data
}

export async function deleteDishOption(
  dishId: number,
  optionId: number,
): Promise<void> {
  await api.delete(`/admin/dishes/${dishId}/options/${optionId}`)
}
