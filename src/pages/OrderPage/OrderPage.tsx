import axios from 'axios'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
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
import type {
  CartItemResponse,
  CartResponse,
} from '../../types/cart'

import type { RestaurantProduct } from '../RestaurantPage/restaurantData'
import { formatPrice } from '../RestaurantPage/restaurantData'

import './OrderPage.css'

export interface OrderItem {
  product: RestaurantProduct
  quantity: number
}

const MIN_ORDER_AMOUNT = 15000

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message
    }

    if (typeof responseData === 'string') {
      return responseData
    }
  }

  return 'Something went wrong. Please try again.'
}

function createTemporaryOrderItems(
  cartItems: CartItemResponse[],
): OrderItem[] {
  return cartItems.map((item) => ({
    product: {
      id: item.dishId,
      name: item.dishTitle,
      description:
        item.elements
          .map((element) => element.name)
          .filter(Boolean)
          .join(', ') || item.restaurantName,
      price:
        item.count > 0
          ? Math.round(item.sum / item.count)
          : item.sum,
      image: item.dishImageUrl,
    } as RestaurantProduct,
    quantity: item.count,
  }))
}

function OrderPage() {
  const navigate = useNavigate()

  const [cart, setCart] = useState<CartResponse | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingDishId, setUpdatingDishId] = useState<
    number | null
  >(null)

  const [isEditing, setIsEditing] = useState(false)
  const [deleteCandidateId, setDeleteCandidateId] = useState<
    number | null
  >(null)

  const loadCart = useCallback(
  async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }

    try {
      const currentCart = await getMyCart()

      setCart(currentCart)
      setErrorMessage('')
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        setCart(null)
        setErrorMessage('')
        return
      }

      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  },
  [],
)

useEffect(() => {
  let isMounted = true

  const fetchInitialCart = async () => {
    try {
      const currentCart = await getMyCart()

      if (!isMounted) {
        return
      }

      setCart(currentCart)
      setErrorMessage('')
    } catch (error) {
      if (!isMounted) {
        return
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        setCart(null)
        setErrorMessage('')
      } else {
        setErrorMessage(getErrorMessage(error))
      }
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  void fetchInitialCart()

  return () => {
    isMounted = false
  }
}, [])

const orderItems = useMemo(
  () => cart?.items ?? [],
  [cart],
)

  const totalQuantity = useMemo(
    () =>
      orderItems.reduce(
        (total, item) => total + item.count,
        0,
      ),
    [orderItems],
  )

  const orderAmount = cart?.sumOrder ?? 0

  const missingAmount = Math.max(
    MIN_ORDER_AMOUNT - orderAmount,
    0,
  )

  const hasReachedMinimum = missingAmount === 0

  const updateQuantity = async (
    dishId: number,
    quantity: number,
  ) => {
    if (updatingDishId !== null || quantity < 1) {
      return
    }

    setUpdatingDishId(dishId)
    setErrorMessage('')
    setDeleteCandidateId(null)

    try {
      const updatedCart = await updateCartItemQuantity(
        dishId,
        quantity,
      )

      setCart(updatedCart)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setUpdatingDishId(null)
    }
  }

  const increaseQuantity = (
    item: CartItemResponse,
  ) => {
    void updateQuantity(item.dishId, item.count + 1)
  }

  const decreaseQuantity = (
    item: CartItemResponse,
  ) => {
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

      setCart(updatedCart)
      setDeleteCandidateId(null)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setUpdatingDishId(null)
    }
  }

  const toggleEditing = () => {
    setIsEditing((currentValue) => !currentValue)
    setDeleteCandidateId(null)
  }

  const handleProceedToPayment = () => {
    if (
      orderItems.length === 0 ||
      !hasReachedMinimum ||
      updatingDishId !== null
    ) {
      return
    }

    const temporaryOrderItems =
      createTemporaryOrderItems(orderItems)

    navigate('/food/order/payment', {
      state: {
        orderItems: temporaryOrderItems,
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
          <img
            src={backButtonIcon}
            alt=""
            aria-hidden="true"
          />
        </button>

        <div
          className="order-page__logo"
          aria-label="UT Food"
        >
          <img src={utLogo} alt="UT" />
          <img src={foodLogo} alt="Food" />
        </div>

        <button
          className="order-page__header-button"
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <img
            src={bellIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </header>

      <section className="order-page__content">
        <h1>Your order</h1>

        {errorMessage && (
          <div
            className="order-page__error"
            role="alert"
          >
            <p>{errorMessage}</p>

            {isLoading === false && orderItems.length === 0 && (
              <button
                type="button"
                onClick={() => void loadCart()}
              >
                Try again
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div
            className="order-page__loading"
            role="status"
          >
            <div
              className="order-page__loading-spinner"
              aria-hidden="true"
            />

            <p>Loading your order...</p>
          </div>
        ) : orderItems.length === 0 ? (
          <div className="order-page__empty">
            <p>Your order is empty</p>

            <button
              type="button"
              onClick={() => navigate('/food')}
            >
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
                const isDeleteCandidate =
                  deleteCandidateId === item.dishId

                const isUpdating =
                  updatingDishId === item.dishId

                const description =
                  item.elements
                    .map((element) => element.name)
                    .filter(Boolean)
                    .join(', ') || item.restaurantName

                return (
                  <article
                    className={`order-page__item ${
                      isUpdating
                        ? 'order-page__item--updating'
                        : ''
                    }`}
                    key={item.id}
                    aria-busy={isUpdating}
                  >
                    <div className="order-page__item-content">
                      <h3>{item.dishTitle}</h3>

                      <p>{description}</p>

                      <strong>
                        {formatPrice(item.sum)}
                      </strong>
                    </div>

                    <div className="order-page__image-wrapper">
                      {item.dishImageUrl ? (
                        <img
                          className="order-page__item-image"
                          src={item.dishImageUrl}
                          alt={item.dishTitle}
                        />
                      ) : (
                        <div
                          className="order-page__image-placeholder"
                          aria-label="No dish image"
                        />
                      )}

                      {isEditing &&
                        (isDeleteCandidate ? (
                          <button
                            className="order-page__delete-button"
                            type="button"
                            onClick={() =>
                              void removeItem(item.dishId)
                            }
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
                              onClick={() =>
                                decreaseQuantity(item)
                              }
                              aria-label={`Decrease ${item.dishTitle} quantity`}
                              disabled={isUpdating}
                            >
                              −
                            </button>

                            <span>{item.count}</span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(item)
                              }
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
              <div
                className="order-page__minimum-message"
                role="status"
              >
                Minimum order is{' '}
                {formatPrice(MIN_ORDER_AMOUNT)}.
                Add {formatPrice(missingAmount)} more.
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
            disabled={
              !hasReachedMinimum ||
              updatingDishId !== null
            }
            aria-label={
              hasReachedMinimum
                ? `Proceed to payment for ${totalQuantity} items`
                : `Add ${formatPrice(
                    missingAmount,
                  )} more to proceed`
            }
          >
            <span className="order-page__count">
              {totalQuantity}
            </span>

            <span className="order-page__payment-label">
              {hasReachedMinimum
                ? 'Proceed to payment'
                : `Add ${formatPrice(missingAmount)} more`}
            </span>

            <span className="order-page__total">
              {formatPrice(orderAmount)}
            </span>
          </button>
        </div>
      )}
    </main>
  )
}

export default OrderPage