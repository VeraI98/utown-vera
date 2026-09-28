import { api } from './api'

import type { RestaurantResponse } from '../types/restaurant'

export type OwnerRestaurantStatus =
  'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED' | 'BUSY'

// Nearly every owner page calls getOwnerRestaurants(userId) on mount to find
// "my restaurant", so a normal owner session re-fetches the same response
// on every single navigation (Home -> Orders -> Menu -> ...). A short-lived
// in-memory cache lets those quick, same-session navigations reuse the last
// response instead of firing a fresh request each time. It still expires on
// its own after CACHE_TTL_MS, and is force-cleared right after any write
// that could change the result (see invalidateOwnerRestaurantsCache calls
// below and in ownerEditRestaurantService.ts).
const CACHE_TTL_MS = 30_000

interface RestaurantsCacheEntry {
  promise: Promise<RestaurantResponse[]>
  timestamp: number
}

const restaurantsCache = new Map<number, RestaurantsCacheEntry>()

export function invalidateOwnerRestaurantsCache(userId?: number): void {
  if (userId === undefined) {
    restaurantsCache.clear()
    return
  }

  restaurantsCache.delete(userId)
}

async function fetchOwnerRestaurants(
  userId: number,
): Promise<RestaurantResponse[]> {
  const { data } = await api.get<RestaurantResponse[]>(
    '/restaurant-owner/restaurants',
    {
      params: {
        userId,
      },
    },
  )

  return data
}

export function getOwnerRestaurants(
  userId: number,
): Promise<RestaurantResponse[]> {
  const cached = restaurantsCache.get(userId)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.promise
  }

  const promise = fetchOwnerRestaurants(userId).catch((error: unknown) => {
    // Don't cache a failed request — let the next call retry over the network.
    if (restaurantsCache.get(userId)?.promise === promise)
      restaurantsCache.delete(userId)

    throw error
  })

  restaurantsCache.set(userId, { promise, timestamp: Date.now() })

  return promise
}

export async function updateOwnerRestaurantStatus(
  restaurantId: number,
  status: OwnerRestaurantStatus,
): Promise<RestaurantResponse> {
  const { data } = await api.patch<RestaurantResponse>(
    `/restaurant-owner/restaurants/${restaurantId}/status`,
    null,
    {
      params: {
        status,
      },
    },
  )

  invalidateOwnerRestaurantsCache()

  return data
}
