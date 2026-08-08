import italianPizzaImage from '../../assets/restaurant page/italian pizza.svg'
import kazakhPizzaImage from '../../assets/restaurant page/kazakh-pizza.svg'
import uzbekPizzaImage from '../../assets/restaurant page/uzbek-pizza.svg'
import italianSaladImage from '../../assets/restaurant page/italian salads.svg'
import kazakhSaladImage from '../../assets/restaurant page/kazakh-salads.svg'
import uzbekSaladImage from '../../assets/restaurant page/uzbek-salads.svg'
import italianJuiceImage from '../../assets/restaurant page/italian juice.svg'
import kazakhJuiceImage from '../../assets/restaurant page/kazakh-juice.svg'
import uzbekJuiceImage from '../../assets/restaurant page/uzbek-juice.svg'

import type { DishOption } from '../../types/restaurant'

export type RestaurantCategory =
  | 'pizza'
  | 'salads'
  | 'drinks'

export interface RestaurantProduct {
  id: number
  name: string
  description: string
  price: number
  category: RestaurantCategory
  image: string
  options?: DishOption[]
}

export const restaurantProducts: RestaurantProduct[] = [
  {
    id: 1,
    name: 'Italian Pizza',
    description:
      'Beef, zucchini, celery, cheese, pepper, cheese crusts',
    price: 7000,
    category: 'pizza',
    image: italianPizzaImage,
    options: [],
  },
  {
    id: 2,
    name: 'Kazakh Pizza',
    description:
      'Beef, zucchini, celery, cheese, pepper, cheese crusts',
    price: 8000,
    category: 'pizza',
    image: kazakhPizzaImage,
    options: [],
  },
  {
    id: 3,
    name: 'Uzbek Pizza',
    description:
      'Beef, zucchini, celery, cheese, pepper, cheese crusts',
    price: 9000,
    category: 'pizza',
    image: uzbekPizzaImage,
    options: [],
  },
  {
    id: 4,
    name: 'Italian Salad',
    description:
      'Fresh vegetables, cheese, herbs and Italian dressing',
    price: 7000,
    category: 'salads',
    image: italianSaladImage,
    options: [],
  },
  {
    id: 5,
    name: 'Kazakh Salad',
    description:
      'Fresh vegetables, meat, herbs and traditional dressing',
    price: 8000,
    category: 'salads',
    image: kazakhSaladImage,
    options: [],
  },
  {
    id: 6,
    name: 'Uzbek Salad',
    description:
      'Fresh vegetables, herbs, spices and traditional dressing',
    price: 9000,
    category: 'salads',
    image: uzbekSaladImage,
    options: [],
  },
  {
    id: 7,
    name: 'Italian Juice',
    description:
      'Fresh fruit juice served chilled',
    price: 7000,
    category: 'drinks',
    image: italianJuiceImage,
    options: [],
  },
  {
    id: 8,
    name: 'Kazakh Juice',
    description:
      'Traditional fruit drink served chilled',
    price: 8000,
    category: 'drinks',
    image: kazakhJuiceImage,
    options: [],
  },
  {
    id: 9,
    name: 'Uzbek Juice',
    description:
      'Fresh traditional fruit drink served chilled',
    price: 9000,
    category: 'drinks',
    image: uzbekJuiceImage,
    options: [],
  },
]

export const pizzaProducts =
  restaurantProducts.filter(
    (product) =>
      product.category === 'pizza',
  )

export const saladProducts =
  restaurantProducts.filter(
    (product) =>
      product.category === 'salads',
  )

export const drinkProducts =
  restaurantProducts.filter(
    (product) =>
      product.category === 'drinks',
  )

export const formatPrice = (
  price: number,
): string =>
  `${price.toLocaleString('en-US')} won`