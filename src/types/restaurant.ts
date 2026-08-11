export interface RestaurantAddress {
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

export interface RestaurantOperatingMode {
  id: number
  dayOfWeek: number
  start: string
  end: string
  dayOff: boolean
}

export interface RestaurantResponse {
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
  status: string
  statusDisplay: string
  totalRatings: number
  isActive: boolean
  imageUrl: string | null
  address: RestaurantAddress
  operatingModes: RestaurantOperatingMode[]
  createdAt: string
  updatedAt: string
}

export interface DishCategoryResponse {
  id: number
  name: string
  sort: number
  isActive: boolean
  imageUrl: string | null
  restaurantId: number
  restaurantName: string
}

export interface DishOptionElement {
  id: number
  name: string
  description: string
  price: number
}

export interface DishOption {
  id: number
  name: string
  isRequired: boolean
  min: number
  max: number
  elements: DishOptionElement[]
}

export interface DishResponse {
  id: number
  title: string
  description: string
  price: number
  isActive: boolean
  isDeleted: boolean
  sort: number
  imageUrl: string | null
  restaurantId: number
  restaurantName: string
  dishCategoryId: number
  categoryName: string
  options: DishOption[]
}

export interface SortResponse {
  sorted: boolean
  empty: boolean
  unsorted: boolean
}

export interface PageableResponse {
  pageNumber: number
  pageSize: number
  offset: number
  sort: SortResponse
  paged: boolean
  unpaged: boolean
}

export interface PaginatedResponse<T> {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  pageable: PageableResponse
  size: number
  content: T[]
  number: number
  sort: SortResponse
  numberOfElements: number
  empty: boolean
}