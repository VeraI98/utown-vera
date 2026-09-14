export interface EstablishmentResponse {
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
  imageUrl: string | null
  city: string
  fullAddress: string
  dishesCount: number
  ordersCount: number
  ownerName: string
  ownerId: number
  createdAt: string
  updatedAt: string
}
