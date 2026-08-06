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