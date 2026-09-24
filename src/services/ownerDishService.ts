import { api } from './api'
import { getAllDishesByRestaurant } from './dishService'
import type { DishResponse } from '../types/restaurant'

// The public restaurant endpoint returns active dishes only. The owner role
// cannot access /admin/dishes; do not trigger a 401 and a session refresh here.
export async function getOwnerDishes(
  restaurantId: number,
  state: 'active' | 'inactive' | 'deleted' = 'active',
): Promise<DishResponse[]> {
  if (state !== 'active') {
    throw new Error(
      state === 'inactive'
        ? 'On-hold dishes are currently unavailable. Please contact an administrator.'
        : 'Deleted dishes are currently unavailable. Please contact an administrator.',
    )
  }
  return getAllDishesByRestaurant(restaurantId)
}

export async function activateOwnerDish(dishId: number): Promise<void> {
  await api.patch(`/dishes/${dishId}/activate`)
}

export async function deactivateOwnerDish(dishId: number): Promise<void> {
  await api.patch(`/dishes/${dishId}/deactivate`)
}

export interface OwnerDishRequest {
  title: string
  description?: string
  price: number
  sort?: number
  imageUrl?: string
  restaurantId?: number
  dishCategoryId: number
}

// Create/update/delete a dish through the public /dishes endpoints, which a
// RESTAURATEUR is allowed to call (confirmed via Swagger: bearer auth only,
// no admin-only restriction) — unlike /admin/dishes, which returns 401 for
// this role.
export async function createOwnerDish(
  request: OwnerDishRequest,
): Promise<DishResponse> {
  const { data } = await api.post<DishResponse>('/dishes', request)

  return data
}

export async function updateOwnerDish(
  dishId: number,
  request: OwnerDishRequest,
): Promise<DishResponse> {
  const { data } = await api.put<DishResponse>(`/dishes/${dishId}`, request)

  return data
}

export async function deleteOwnerDish(dishId: number): Promise<void> {
  await api.delete(`/dishes/${dishId}`)
}

// Restoring a deleted dish and managing dish options only exist under
// /admin/dishes on the backend (confirmed via Swagger) — a RESTAURATEUR
// gets a 401 there, so those two actions are intentionally not exposed in
// the owner UI yet, pending a non-admin endpoint.
