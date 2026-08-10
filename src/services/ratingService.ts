import axios from 'axios'

import { api } from './api'

export interface CreateRatingRequest {
  id: number
  grade: number
  userId: number
  restaurantId: number
}

export interface RatingResponse {
  id: number
  grade: number
  userId: number
  restaurantId: number
}

export async function createRating(
  request: CreateRatingRequest,
): Promise<RatingResponse> {
  const { data } = await api.post<RatingResponse>(
    '/ratings',
    request,
  )

  return data
}

export async function getMyRestaurantRating(
  restaurantId: number,
): Promise<RatingResponse | null> {
  try {
    const { data } = await api.get<RatingResponse>(
      `/ratings/my-rating/restaurant/${restaurantId}`,
    )

    return data
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404
    ) {
      return null
    }

    throw error
  }
}