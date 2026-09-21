import { api } from './api'

import type { OrderResponse } from '../types/cart'
import type { PaginatedResponse } from '../types/restaurant'

// Field names below are a best-effort guess (the OpenAPI spec truncates
// before these schemas) — verify against the real response in DevTools
// Network once this is live, and adjust if the backend uses different names.
export interface StatsSummaryResponse {
  totalRevenue: number
  ordersCount: number
  cancelledOrdersCount: number
}

export interface DailyStatsResponse {
  date: string
  totalRevenue: number
  ordersCount: number
  cancelledOrdersCount: number
}

function toIsoDateTime(date: string, endOfDay = false): string {
  return `${date}T${endOfDay ? '23:59:59' : '00:00:00'}`
}

export async function getRestaurantStatsSummary(
  restaurantId: number,
  from: string,
  to: string,
): Promise<StatsSummaryResponse> {
  const { data } = await api.get<StatsSummaryResponse>(
    `/restaurants/${restaurantId}/stats/summary`,
    {
      params: {
        from: toIsoDateTime(from),
        to: toIsoDateTime(to, true),
      },
    },
  )

  return data
}

export async function getRestaurantDailyStats(
  restaurantId: number,
  from: string,
  to: string,
): Promise<DailyStatsResponse[]> {
  const { data } = await api.get<DailyStatsResponse[]>(
    `/restaurants/${restaurantId}/stats/daily`,
    {
      params: {
        from: toIsoDateTime(from),
        to: toIsoDateTime(to, true),
      },
    },
  )

  return data
}

export async function getRestaurantOrdersForDay(
  restaurantId: number,
  day: string,
  page = 0,
  size = 100,
): Promise<PaginatedResponse<OrderResponse>> {
  const { data } = await api.get<PaginatedResponse<OrderResponse>>(
    `/restaurants/${restaurantId}/stats/orders`,
    {
      params: {
        day,
        page,
        size,
      },
    },
  )

  return data
}
