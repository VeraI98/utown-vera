import { getErrorMessage } from '../../utils/getErrorMessage'
import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/restaurant page/Back button.svg'
import bellIcon from '../../assets/restaurant page/bell.svg'
import deleteButtonIcon from '../../assets/restaurant page/Delete button.svg'
import foodLogo from '../../assets/restaurant page/food.svg'
import utLogo from '../../assets/restaurant page/ut.svg'
import {
  getMyCart,
  removeCartItem,
  updateCartItemQuantity,
} from '../../services/cartService'
import { getRestaurantById } from '../../services/restaurantService'
import type { CartItemResponse, CartResponse } from '../../types/cart'
import { logError } from '../../utils/logger'

import './OrderPage.css'

interface TemporaryOrderProduct {
  id: number
  name: string
  description: string
  price: number
  image: string | null
  options: []
}

export interface OrderItem {
  product: TemporaryOrderProduct
  quantity: number
}

const INVALID_IMAGE_VALUES = [
  'string',
  'null',
  'undefined',
  'file uploaded successfully',
]

function isValidImageUrl(imageUrl?: string | null): boolean {
  if (!imageUrl) {
    return false
  }

  const value = imageUrl.trim()

  if (!value) {
    return false
  }

  return !INVALID_IMAGE_VALUES.includes(value.toLowerCase())
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0'
  }

  return new Intl.NumberFormat('en-US').format(value)
}

function createPaymentOrderItems(cartItems: CartItemResponse[]): OrderItem[] {
  return cartItems.map((item) => {
    const selectedElements = item.elements
      .map((element) => element.name)
      .filter(Boolean)

    const description =
      selectedElements.length > 0
        ? selectedElements.join(', ')
        : item.restaurantName

    const unitPrice = item.count > 0 ? item.sum / item.count : item.sum

    return {
      product: {
        id: item.dishId,
        name: item.dishTitle,
        description,
        price: unitPrice,
        image: item.dishImageUrl,
        options: [],
      },
      quantity: item.count,
    }
  })
}

function OrderPage() {
  const navigate = useNavigate()

  const isMountedRef = useRef(true)

  const [cart, setCart] = useState<CartResponse | null>(null)

  const [minimumOrderAmount, setMinimumOrderAmount] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const [errorMessage, setErrorMessage] = useState('')

  const [updatingDishId, setUpdatingDishId] = useState<number | null>(null)

  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(
    () => new Set(),
  )

  const [isEditing, setIsEditing] = useState(false)

  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(
    null,
  )

  useEffect(() => {
    let isActive = true

    getMyCart()
      .then(async (currentCart) => {
        if (!isActive) {
          return
        }

        setCart(currentCart)
        setErrorMessage('')

        const restaurantId = currentCart.items[0]?.restaurantId

        if (!restaurantId) {
          setMinimumOrderAmount(0)
          return
        }

        try {
          const restaurant = await getRestaurantById(restaurantId)

          if (!isActive) {
            return
          }

          setMinimumOrderAmount(restaurant.minOrderAmount)
        } catch (error) {
          logError(
            'OrderPage: failed to load restaurant minimum order amount',
            error,
          )

          if (isActive) {
            setMinimumOrderAmount(0)
          }
        }
      })
      .catch((error) => {
        logError('OrderPage: failed to load cart', error)

        if (!isActive) {
          return
        }

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setCart(null)
          setErrorMessage('')
          setMinimumOrderAmount(0)

          return
        }

        setErrorMessage(
          getErrorMessage(error, 'Something went wrong. Please try again.'),
        )
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const orderItems = useMemo(() => cart?.items ?? [], [cart])

  const totalQuantity = useMemo(
    () => orderItems.reduce((total, item) => total + item.count, 0),
    [orderItems],
  )

  const orderAmount = cart?.sumOrder ?? 0

  const missingAmount = Math.max(minimumOrderAmount - orderAmount, 0)

  const hasReachedMinimum =
    minimumOrderAmount <= 0 || orderAmount >= minimumOrderAmount

  const loadCart = async () => {
    try {
      const currentCart = await getMyCart()

      if (!isMountedRef.current) {
        return
      }

      setCart(currentCart)
      setErrorMessage('')

      const restaurantId = currentCart.items[0]?.restaurantId

      if (!restaurantId) {
        setMinimumOrderAmount(0)
        return
      }

      try {
        const restaurant = await getRestaurantById(restaurantId)

        if (!isMountedRef.current) {
          return
        }

        setMinimumOrderAmount(restaurant.minOrderAmount)
      } catch (error) {
        logError(
          'OrderPage: failed to reload restaurant minimum order amount',
          error,
        )

        if (isMountedRef.current) {
          setMinimumOrderAmount(0)
        }
      }
    } catch (error) {
      logError('OrderPage: failed to reload cart', error)

      if (!isMountedRef.current) {
        return
      }

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setCart(null)
        setErrorMessage('')
        setMinimumOrderAmount(0)

        return
      }

      setErrorMessage(
        getErrorMessage(error, 'Something went wrong. Please try again.'),
      )
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  const updateQuantity = async (dishId: number, quantity: number) => {
    if (updatingDishId !== null || quantity < 1) {
      return
    }

    setUpdatingDishId(dishId)
    setErrorMessage('')
    setDeleteCandidateId(null)

    try {
      const updatedCart = await updateCartItemQuantity(dishId, quantity)

      if (!isMountedRef.current) {
        return
      }

      setCart(updatedCart)
    } catch (error) {
      logError('OrderPage: failed to update cart item quantity', error)

      if (isMountedRef.current) {
        setErrorMessage(
          getErrorMessage(error, 'Something went wrong. Please try again.'),
        )
      }
    } finally {
      if (isMountedRef.current) {
        setUpdatingDishId(null)
      }
    }
  }

  const increaseQuantity = (item: CartItemResponse) => {
    void updateQuantity(item.dishId, item.count + 1)
  }

  const decreaseQuantity = (item: CartItemResponse) => {
    if (item.count === 1) {
      setDeleteCandidateId(item.dishId)

      return
    }

    void updateQuantity(item.dishId, item.count - 1)
  }

  const removeItem = async (dishId: number) => {
    if (updatingDishId !== null) {
      return
    }

    setUpdatingDishId(dishId)
    setErrorMessage('')

    try {
      const updatedCart = await removeCartItem(dishId)

      if (!isMountedRef.current) {
        return
      }

      setCart(updatedCart)
      setDeleteCandidateId(null)

      if (updatedCart.items.length === 0) {
        setIsEditing(false)
        setMinimumOrderAmount(0)
      }
    } catch (error) {
      logError('OrderPage: failed to remove cart item', error)

      if (isMountedRef.current) {
        setErrorMessage(
          getErrorMessage(error, 'Something went wrong. Please try again.'),
        )
      }
    } finally {
      if (isMountedRef.current) {
        setUpdatingDishId(null)
      }
    }
  }

  const toggleEditing = () => {
    setIsEditing((currentValue) => !currentValue)

    setDeleteCandidateId(null)
  }

  const handleImageError = (dishId: number) => {
    setFailedImageIds((currentIds) => {
      const nextIds = new Set(currentIds)

      nextIds.add(dishId)

      return nextIds
    })
  }

  const handleRetry = () => {
    setIsLoading(true)
    setErrorMessage('')

    void loadCart()
  }

  const handleProceedToPayment = () => {
    if (
      orderItems.length === 0 ||
      !hasReachedMinimum ||
      updatingDishId !== null ||
      !cart
    ) {
      return
    }

    const paymentOrderItems = createPaymentOrderItems(orderItems)

    navigate('/food/order/payment', {
      state: {
        orderItems: paymentOrderItems,
        cart,
      },
    })
  }

  return (
    <main className="order-page">
      <header className="order-page__header">
        <button
          className="order-page__header-button"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <img src={backButtonIcon} alt="" aria-hidden="true" />
        </button>

        <div className="order-page__logo" aria-label="UT Food">
          <img src={utLogo} alt="UT" />

          <img src={foodLogo} alt="Food" />
        </div>

        <button
          className="order-page__header-button"
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <img src={bellIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <section className="order-page__content">
        <h1>Your order</h1>

        {errorMessage && (
          <div className="order-page__error" role="alert">
            <p>{errorMessage}</p>

            {!isLoading && orderItems.length === 0 && (
              <button type="button" onClick={handleRetry}>
                Try again
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="order-page__loading" role="status">
            <div className="order-page__loading-spinner" aria-hidden="true" />

            <p>Loading your order...</p>
          </div>
        ) : orderItems.length === 0 ? (
          <div className="order-page__empty">
            <p>Your order is empty</p>

            <button type="button" onClick={() => navigate('/food')}>
              Return to restaurants
            </button>
          </div>
        ) : (
          <>
            <div className="order-page__items-heading">
              <h2>Items</h2>

              <button
                type="button"
                onClick={toggleEditing}
                disabled={updatingDishId !== null}
              >
                {isEditing ? 'Ready' : 'Edit'}
              </button>
            </div>

            <div className="order-page__items">
              {orderItems.map((item) => {
                const isDeleteCandidate = deleteCandidateId === item.dishId

                const isUpdating = updatingDishId === item.dishId

                const selectedElements = item.elements
                  .map((element) => element.name)
                  .filter(Boolean)

                const description =
                  selectedElements.length > 0
                    ? selectedElements.join(', ')
                    : item.restaurantName

                const hasImage =
                  isValidImageUrl(item.dishImageUrl) &&
                  !failedImageIds.has(item.dishId)

                return (
                  <article
                    className={`order-page__item ${
                      isUpdating ? 'order-page__item--updating' : ''
                    }`}
                    key={item.id}
                    aria-busy={isUpdating}
                  >
                    <div className="order-page__item-content">
                      <h3>{item.dishTitle}</h3>

                      <p>{description}</p>

                      <strong>{formatPrice(item.sum)}</strong>
                    </div>

                    <div className="order-page__image-wrapper">
                      {hasImage ? (
                        <img
                          className="order-page__item-image"
                          src={item.dishImageUrl ?? undefined}
                          alt={item.dishTitle}
                          loading="lazy"
                          onError={() => handleImageError(item.dishId)}
                        />
                      ) : (
                        <div
                          className="order-page__image-placeholder"
                          aria-label="No dish image"
                        >
                          No image
                        </div>
                      )}

                      {isEditing &&
                        (isDeleteCandidate ? (
                          <button
                            className="order-page__delete-button"
                            type="button"
                            onClick={() => void removeItem(item.dishId)}
                            aria-label={`Remove ${item.dishTitle}`}
                            disabled={isUpdating}
                          >
                            <img
                              src={deleteButtonIcon}
                              alt=""
                              aria-hidden="true"
                            />
                          </button>
                        ) : (
                          <div className="order-page__quantity">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item)}
                              aria-label={`Decrease ${item.dishTitle} quantity`}
                              disabled={isUpdating}
                            >
                              −
                            </button>

                            <span>{item.count}</span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item)}
                              aria-label={`Increase ${item.dishTitle} quantity`}
                              disabled={isUpdating}
                            >
                              +
                            </button>
                          </div>
                        ))}
                    </div>
                  </article>
                )
              })}
            </div>

            {!hasReachedMinimum && (
              <div className="order-page__minimum-message" role="status">
                Minimum order is {formatPrice(minimumOrderAmount)} won. Add{' '}
                {formatPrice(missingAmount)} won more.
              </div>
            )}
          </>
        )}
      </section>

      {!isLoading && orderItems.length > 0 && (
        <div className="order-page__bottom-area">
          <button
            className="order-page__payment-button"
            type="button"
            onClick={handleProceedToPayment}
            disabled={!hasReachedMinimum || updatingDishId !== null}
            aria-label={
              hasReachedMinimum
                ? `Proceed to payment for ${totalQuantity} items`
                : `Add ${formatPrice(missingAmount)} won more to proceed`
            }
          >
            <span className="order-page__count">{totalQuantity}</span>

            <span className="order-page__payment-label">
              {hasReachedMinimum
                ? 'Proceed to payment'
                : `Add ${formatPrice(missingAmount)} won more`}
            </span>

            <span className="order-page__total">
              {formatPrice(orderAmount)} won
            </span>
          </button>
        </div>
      )}
    </main>
  )
}

export default OrderPage
