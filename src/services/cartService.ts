import { api } from './api'

import type {
  AddCartItemRequest,
  CartResponse,
  CheckoutRequest,
  OrderResponse,
} from '../types/cart'

export async function getMyCart(): Promise<CartResponse> {
  const { data } = await api.get<CartResponse>('/my-cart')

  return data
}

export async function checkMyCartExists(): Promise<boolean> {
  const { data } = await api.get<boolean | Record<string, boolean>>(
    '/my-cart/exists',
  )

  if (typeof data === 'boolean') {
    return data
  }

  return Object.values(data).some(Boolean)
}

export async function addItemToCart(
  request: AddCartItemRequest,
): Promise<CartResponse> {
  const { data } = await api.post<CartResponse>(
    '/my-cart/items',
    request,
  )

  return data
}

export async function updateCartItemQuantity(
  dishId: number,
  quantity: number,
): Promise<CartResponse> {
  const { data } = await api.put<CartResponse>(
    `/my-cart/items/${dishId}`,
    null,
    {
      params: {
        quantity,
      },
    },
  )

  return data
}

export async function removeCartItem(
  dishId: number,
): Promise<CartResponse> {
  const { data } = await api.delete<CartResponse>(
    `/my-cart/items/${dishId}`,
  )

  return data
}

export async function clearMyCart(): Promise<CartResponse> {
  const { data } = await api.post<CartResponse>(
    '/my-cart/clear',
  )

  return data
}

export async function checkoutMyCart(
  request: CheckoutRequest,
): Promise<OrderResponse> {
  const { data } = await api.post<OrderResponse>(
    '/my-cart/checkout',
    request,
  )

  return data
}