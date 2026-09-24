import { api } from './api'

import { invalidateOwnerRestaurantsCache } from './ownerRestaurantService'

import type { RestaurantResponse } from '../types/restaurant'
export type OwnerRestaurant = RestaurantResponse
export { getOwnerRestaurants } from './ownerRestaurantService'

export async function updateOwnerRestaurant(
  restaurantId: number,
  restaurant: OwnerRestaurant,
): Promise<OwnerRestaurant> {
  const { data } = await api.put<OwnerRestaurant>(
    `/restaurant-owner/restaurants/${restaurantId}`,
    restaurant,
  )

  // This edit can change fields (name, hours, image, ...) that other owner
  // pages read via the cached getOwnerRestaurants() in ownerRestaurantService,
  // so drop that cache to avoid those pages showing stale data.
  invalidateOwnerRestaurantsCache()

  return data
}
