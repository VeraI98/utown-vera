import { api } from './api'

import { invalidateOwnerRestaurantsCache } from './ownerRestaurantService'

export interface OwnerRestaurantAddress {
  id: number
  area: string
  city: string
  details: string
  fullAddress: string
  latitude: number
  longitude: number
  postcode: string
  state: string
  street: string
  typeAddress: number
  intercomCode: string
}

export interface OwnerRestaurantOperatingMode {
  id: number
  dayOfWeek: number
  start: string | null
  end: string | null
  dayOff: boolean
}

export interface OwnerRestaurant {
  id: number
  title: string
  description: string
  category: string
  deliveryTime: string
  facilities: string
  isRecommended: boolean
  minOrderAmount: number
  phone: string
  ratings: number
  status: number
  statusDisplay: string
  totalRatings: number
  isActive: boolean
  imageUrl: string
  address: OwnerRestaurantAddress
  operatingModes: OwnerRestaurantOperatingMode[]
  createdAt?: string
  updatedAt?: string
}

export async function getOwnerRestaurants(
  userId: number,
): Promise<OwnerRestaurant[]> {
  const { data } = await api.get<OwnerRestaurant[]>(
    '/restaurant-owner/restaurants',
    {
      params: {
        userId,
      },
    },
  )

  return data
}

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
