import type {
  DishOption,
} from '../../types/restaurant'

export interface RestaurantProduct {
  id: number
  name: string
  description: string
  price: number
  image: string | null
  options?: DishOption[]
}

export function formatPrice(
  price: number,
): string {
  return `${price.toLocaleString('en-US')} won`
}