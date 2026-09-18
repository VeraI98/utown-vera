import { api } from './api'

import type { OrderResponse, OrderStatus } from '../types/cart'
import type { PaginatedResponse } from '../types/restaurant'

export interface GetOwnerOrdersParams {
  page?: number
  size?: number
  sort?: string
  status?: OrderStatus
}

// All of these hit the restaurant-owner-facing /orders/... paths (not
// /admin/orders/...) — the backend checks that the logged-in owner actually
// owns restaurantId and rejects the request otherwise, so there's no extra
// ownership filtering to do on the frontend.
export async function getOwnerOrders(
  restaurantId: number,
  params: GetOwnerOrdersParams = {},
): Promise<PaginatedResponse<OrderResponse>> {
  const { page = 0, size = 10, sort, status } = params

  if (status) {
    const { data } = await api.get<PaginatedResponse<OrderResponse>>(
      `/orders/restaurant/${restaurantId}/status/${status}`,
      {
        params: { page, size, sort },
      },
    )

    return data
  }

  const { data } = await api.get<PaginatedResponse<OrderResponse>>(
    `/orders/restaurant/${restaurantId}`,
    {
      params: { page, size, sort },
    },
  )

  return data
}

export async function getOwnerActiveOrders(
  restaurantId: number,
): Promise<OrderResponse[]> {
  const { data } = await api.get<OrderResponse[]>(
    `/orders/restaurant/${restaurantId}/active`,
  )

  return data
}

export async function getOwnerOrdersCount(
  restaurantId: number,
): Promise<Record<string, number>> {
  const { data } = await api.get<Record<string, number>>(
    `/orders/restaurant/${restaurantId}/count`,
  )

  return data
}

export async function getOrderById(orderId: number): Promise<OrderResponse> {
  const { data } = await api.get<OrderResponse>(`/orders/${orderId}`)

  return data
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
): Promise<OrderResponse> {
  const { data } = await api.put<OrderResponse>(`/orders/${orderId}/status`, {
    status,
  })

  return data
}
