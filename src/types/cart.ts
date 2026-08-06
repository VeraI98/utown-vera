export interface CartItemElement {
  id: number
  name: string
  description: string
  price: number
}

export interface CartItemResponse {
  id: number
  dishId: number
  dishTitle: string
  dishImageUrl: string
  count: number
  sum: number
  restaurantId: number
  restaurantName: string
  elements: CartItemElement[]
}

export interface CartResponse {
  id: number
  deliveryPrice: number
  sumOrder: number
  totalDish: number
  totalSum: number
  items: CartItemResponse[]
}

export interface AddCartItemRequest {
  dishId: number
  count: number
  elements: number[]
}

export interface CheckoutRequest {
  restaurantId: number
  fullAddress: string
  area: string
  city: string
  state: string
  postcode: string
  street: string
  latitude: number
  longitude: number
  typeAddress: number
  intercomCode: string
  clientPhone: string
  deliveryTime: string
  payment: string
  noteForCourier: string
  details: string
}

export interface OrderItemResponse {
  id: number
  dishId: number
  dishTitle: string
  dishImageUrl: string
  count: number
  sum: number
  restaurantId: number
  restaurantName: string
  elements: CartItemElement[]
}

export interface OrderResponse {
  id: number
  number: string
  status: string
  deliveryStatus: string

  fullAddress: string
  area: string
  city: string
  state: string
  postcode: string
  street: string

  latitude: number
  longitude: number
  typeAddress: number
  intercomCode: string
  clientPhone: string

  deliveryTime: string
  payment: string
  noteForCourier: string
  details: string

  restaurantId: number
  restaurantName: string

  orderPrice: number
  deliveryPrice: number
  totalSum: number

  isPaid: boolean

  userId: number
  userName: string
  restaurantPhone: string

  date: string
  time: string

  items: OrderItemResponse[]
}