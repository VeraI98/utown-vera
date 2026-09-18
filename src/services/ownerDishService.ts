import axios from 'axios'

import { api } from './api'
import { getAdminDishes } from './adminDishService'

import type { DishResponse, PaginatedResponse } from '../types/restaurant'

// Owner's own menu. /admin/dishes returns dishes including inactive ones
// (see the fix in AdminPositionsPage — the public /dishes/restaurant/{id}
// endpoint silently drops deactivated dishes, which makes a toggle look
// broken), but it's unclear yet whether the RESTAURATEUR role is allowed to
// call it. So this tries /admin/dishes first and, only on a permission
// error (401/403), falls back to the public restaurant endpoint. The
// fallback means a deactivated dish may briefly disappear from the owner's
// own menu list until that's confirmed one way or the other.
export async function getOwnerDishes(
  restaurantId: number,
): Promise<DishResponse[]> {
  try {
    const data = await getAdminDishes({ page: 0, size: 200 })

    return data.content.filter((dish) => dish.restaurantId === restaurantId)
  } catch (error) {
    const isForbidden =
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)

    if (!isForbidden) {
      throw error
    }

    const { data } = await api.get<PaginatedResponse<DishResponse>>(
      `/dishes/restaurant/${restaurantId}`,
      { params: { page: 0, size: 200 } },
    )

    return data.content
  }
}

export async function activateOwnerDish(dishId: number): Promise<void> {
  await api.patch(`/dishes/${dishId}/activate`)
}

export async function deactivateOwnerDish(dishId: number): Promise<void> {
  await api.patch(`/dishes/${dishId}/deactivate`)
}
