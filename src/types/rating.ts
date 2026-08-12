export interface RestaurantRatingResponse {
  id: number
  grade: number
  userId: number
  restaurantId: number
}

export interface CreateRestaurantRatingRequest {
  grade: number
  restaurantId: number

  /*
   * Swagger показывает также id и userId,
   * но для создания сервер обычно может
   * определить их самостоятельно.
   */
  id?: number
  userId?: number
}

export interface UpdateRestaurantRatingRequest {
  grade: number
  restaurantId: number
  id?: number
  userId?: number
}