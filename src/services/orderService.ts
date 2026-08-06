import { api } from './api'

import type { OrderResponse } from '../types/cart'

export async function getOrderById(
  orderId: number,
): Promise<OrderResponse> {
  const { data } = await api.get<OrderResponse>(
    `/orders/${orderId}`,
  )

  return data
}