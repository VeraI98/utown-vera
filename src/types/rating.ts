export interface RestaurantRatingResponse {
  id: number
  grade: number
  userId: number
  restaurantId: number
}

export interface RestaurantRatingRequest {
  grade: number
  restaurantId: number
  id?: number
  userId?: number
}