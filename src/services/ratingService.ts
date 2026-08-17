import { api } from './api'

import type {
  PaginatedResponse,
} from '../types/restaurant'

export interface CreateRatingRequest {
  grade: number
  restaurantId: number
  id?: number
  userId?: number
}

export interface UpdateRatingRequest {
  grade: number
  restaurantId: number
  id?: number
  userId?: number
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
  const { data } =
    await api.post<RatingResponse>(
      '/ratings',
      request,
    )

  return data
}

export async function getMyRestaurantRatings(
  page = 0,
  size = 100,
): Promise<
  PaginatedResponse<RatingResponse>
> {
  const { data } =
    await api.get<
      PaginatedResponse<RatingResponse>
    >('/ratings/my-ratings', {
      params: {
        page,
        size,
      },
    })

  return data
}

export async function getMyRestaurantRating(
  restaurantId: number,
): Promise<RatingResponse | null> {
  const ratings =
    await getMyRestaurantRatings(
      0,
      100,
    )

  return (
    ratings.content.find(
      (rating) =>
        rating.restaurantId ===
        restaurantId,
    ) ?? null
  )
}

export async function getRestaurantRatings(
  restaurantId: number,
  page = 0,
  size = 100,
): Promise<
  PaginatedResponse<RatingResponse>
> {
  const { data } =
    await api.get<
      PaginatedResponse<RatingResponse>
    >(
      `/ratings/restaurant/${restaurantId}`,
      {
        params: {
          page,
          size,
        },
      },
    )

  return data
}

export async function getRatingById(
  ratingId: number,
): Promise<RatingResponse> {
  const { data } =
    await api.get<RatingResponse>(
      `/ratings/${ratingId}`,
    )

  return data
}

export async function updateRating(
  ratingId: number,
  request: UpdateRatingRequest,
): Promise<RatingResponse> {
  const { data } =
    await api.put<RatingResponse>(
      `/ratings/${ratingId}`,
      request,
    )

  return data
}

export async function deleteRating(
  ratingId: number,
): Promise<void> {
  await api.delete(
    `/ratings/${ratingId}`,
  )
}

export function calculateAverageRating(
  ratings: RatingResponse[],
): number {
  if (ratings.length === 0) {
    return 0
  }

  const total =
    ratings.reduce(
      (sum, rating) =>
        sum + rating.grade,
      0,
    )

  return total / ratings.length
}