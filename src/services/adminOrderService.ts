import { api } from './api'

import type { OrderResponse } from '../types/cart'
import type { PaginatedResponse } from '../types/restaurant'

export interface GetAdminOrdersParams {
  page?: number
  size?: number
  search?: string
  status?: string
  restaurantId?: number
}

export async function getAdminOrders(
  params: GetAdminOrdersParams = {},
): Promise<PaginatedResponse<OrderResponse>> {
  const { page = 0, size = 10, search, status, restaurantId } = params

  const { data } = await api.get<PaginatedResponse<OrderResponse>>(
    '/admin/orders',
    { params: { page, size, search, status, restaurantId } },
  )

  return data
}
