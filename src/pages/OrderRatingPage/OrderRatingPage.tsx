import axios from 'axios'
import {
  useEffect,
  useState,
  type CSSProperties,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import backButtonIcon from '../../assets/waiting order/Back button.svg'
import bellIcon from '../../assets/waiting order/bell.svg'
import foodLogo from '../../assets/waiting order/food.svg'
import ratingStarsIcon from '../../assets/waiting order/Rating stars.svg'
import utLogo from '../../assets/waiting order/ut.svg'

import { getOrderById } from '../../services/orderService'
import {
  createRating,
  getMyRestaurantRating,
  type RatingResponse,
} from '../../services/ratingService'

import type { OrderResponse } from '../../types/cart'

import './OrderRatingPage.css'

interface StoredUser {
  id?: number
}

function getErrorMessage(
  error: unknown,
): string {
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

    if (error.response?.status === 404) {
      return 'Order not found.'
    }
  }

  return 'Failed to load or save your rating. Please try again.'
}

function getCurrentUserId(): number {
  const storedUser =
    localStorage.getItem('user')

  if (!storedUser) {
    return 0
  }

  try {
    const user =
      JSON.parse(storedUser) as StoredUser

    return user.id ?? 0
  } catch {
    return 0
  }
}

function normalizeStatus(
  status?: string,
): string {
  return status?.trim().toUpperCase() ?? ''
}

function isOrderDelivered(
  order: OrderResponse,
): boolean {
  const status =
    normalizeStatus(order.status)

  const deliveryStatus =
    normalizeStatus(order.deliveryStatus)

  return (
    status === 'DELIVERED' ||
    status === 'COMPLETED' ||
    deliveryStatus === 'DELIVERED' ||
    deliveryStatus === 'COMPLETED'
  )
}

function OrderRatingPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()

  const [order, setOrder] =
    useState<OrderResponse | null>(null)

  const [
    existingRating,
    setExistingRating,
  ] = useState<RatingResponse | null>(null)

  const [rating, setRating] =
    useState(0)

  const [
    hoveredRating,
    setHoveredRating,
  ] = useState(0)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const numericOrderId = Number(orderId)

  const isValidOrderId =
    Number.isInteger(numericOrderId) &&
    numericOrderId > 0

  useEffect(() => {
    if (!isValidOrderId) {
      return
    }

    let isMounted = true

    const loadPage = async () => {
      try {
        const currentOrder =
          await getOrderById(
            numericOrderId,
          )

        if (!isMounted) {
          return
        }

        setOrder(currentOrder)

        if (!isOrderDelivered(currentOrder)) {
          setErrorMessage(
            'You can rate the restaurant only after delivery.',
          )

          return
        }

        if (!currentOrder.restaurantId) {
          setErrorMessage(
            'Restaurant information is missing.',
          )

          return
        }

        const currentRating =
          await getMyRestaurantRating(
            currentOrder.restaurantId,
          )

        if (!isMounted) {
          return
        }

        if (currentRating) {
          setExistingRating(
            currentRating,
          )

          setRating(
            Math.round(currentRating.grade),
          )
        }

        setErrorMessage('')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          getErrorMessage(error),
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      isMounted = false
    }
  }, [
    isValidOrderId,
    numericOrderId,
  ])

  const delivered =
    order
      ? isOrderDelivered(order)
      : false

  const displayedRating =
    hoveredRating || rating

  const ratingPercent =
    displayedRating * 20

  const canChooseRating =
    delivered &&
    !existingRating &&
    !isSubmitting

  const canSubmit =
    Boolean(order) &&
    Boolean(order?.restaurantId) &&
    delivered &&
    !existingRating &&
    rating >= 1 &&
    rating <= 5 &&
    !isSubmitting &&
    !isLoading

  const handleReady = async () => {
    if (!order) {
      return
    }

    if (existingRating) {
      navigate('/food/orders', {
        replace: true,
      })

      return
    }

    if (!delivered) {
      setErrorMessage(
        'You can rate the restaurant only after delivery.',
      )

      return
    }

    if (!canSubmit) {
      return
    }

    const userId =
      getCurrentUserId()

    if (!userId) {
      setErrorMessage(
        'Unable to determine the current user.',
      )

      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const savedRating =
        await createRating({
          id: 0,
          grade: rating,
          userId,
          restaurantId:
            order.restaurantId,
        })

      setExistingRating(
        savedRating,
      )

      setRating(
        Math.round(savedRating.grade),
      )

      setHoveredRating(0)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isValidOrderId) {
    return (
      <main className="order-rating-page">
        <section className="order-rating-page__content">
          <div
            className="order-rating-page__error"
            role="alert"
          >
            Invalid order ID.
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/food')
            }
          >
            Return to Food
          </button>
        </section>
      </main>
    )
  }

  return (
    <main
      className="order-rating-page"
      aria-busy={
        isLoading ||
        isSubmitting
      }
    >
      <header className="order-rating-page__header">
        <button
          className="order-rating-page__header-button"
          type="button"
          onClick={() =>
            navigate(
              `/food/order/${numericOrderId}/status`,
            )
          }
          aria-label="Go back"
          disabled={isSubmitting}
        >
          <img
            src={backButtonIcon}
            alt=""
            aria-hidden="true"
          />
        </button>

        <div
          className="order-rating-page__logo"
          aria-label="UT Food"
        >
          <img
            src={utLogo}
            alt="UT"
          />

          <img
            src={foodLogo}
            alt="Food"
          />
        </div>

        <button
          className="order-rating-page__header-button"
          type="button"
          onClick={() =>
            navigate('/notifications')
          }
          aria-label="Notifications"
          disabled={isSubmitting}
        >
          <img
            src={bellIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </header>

      <section className="order-rating-page__content">
        {errorMessage && (
          <div
            className="order-rating-page__error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div
            className="order-rating-page__loading"
            role="status"
          >
            <div
              className="order-rating-page__spinner"
              aria-hidden="true"
            />

            <p>
              Loading order...
            </p>
          </div>
        ) : order ? (
          <>
            <div className="order-rating-page__message">
              <h1>
                {existingRating
                  ? 'Thank you!'
                  : delivered
                    ? 'Order delivered!'
                    : 'Order is not delivered yet'}
              </h1>

              <p>
                {existingRating
                  ? 'You have already rated this restaurant'
                  : delivered
                    ? 'Please rate the service'
                    : 'Rating will be available after delivery'}
              </p>
            </div>

            <section className="order-rating-page__rating-section">
              <h2>
                {order.restaurantName ||
                  'Establishment'}
              </h2>

              <div
                className="order-rating-page__rating"
                style={
                  {
                    '--rating-percent':
                      `${ratingPercent}%`,
                    '--rating-mask':
                      `url("${ratingStarsIcon}")`,
                  } as CSSProperties
                }
                onMouseLeave={() => {
                  if (canChooseRating) {
                    setHoveredRating(0)
                  }
                }}
                aria-label={
                  existingRating
                    ? `Your rating: ${rating} out of 5`
                    : `Selected rating: ${rating} out of 5`
                }
              >
                <div
                  className="order-rating-page__stars-image"
                  aria-hidden="true"
                />

                <div className="order-rating-page__star-buttons">
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          if (
                            canChooseRating
                          ) {
                            setRating(value)
                          }
                        }}
                        onMouseEnter={() => {
                          if (
                            canChooseRating
                          ) {
                            setHoveredRating(
                              value,
                            )
                          }
                        }}
                        onFocus={() => {
                          if (
                            canChooseRating
                          ) {
                            setHoveredRating(
                              value,
                            )
                          }
                        }}
                        onBlur={() => {
                          if (
                            canChooseRating
                          ) {
                            setHoveredRating(0)
                          }
                        }}
                        aria-label={`Rate ${value} out of 5`}
                        aria-pressed={
                          rating === value
                        }
                        disabled={
                          !canChooseRating
                        }
                      />
                    ),
                  )}
                </div>
              </div>

              <p
                className="order-rating-page__selected-rating"
                aria-live="polite"
              >
                {existingRating
                  ? `Your rating: ${rating} out of 5`
                  : rating > 0
                    ? `${rating} out of 5`
                    : delivered
                      ? 'Select a rating'
                      : 'Available after delivery'}
              </p>
            </section>
          </>
        ) : null}
      </section>

      {!isLoading && order && (
        <div className="order-rating-page__bottom">
          {existingRating ? (
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/food/orders',
                  {
                    replace: true,
                  },
                )
              }
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                void handleReady()
              }
              disabled={!canSubmit}
            >
              {isSubmitting
                ? 'Saving...'
                : 'Ready'}
            </button>
          )}
        </div>
      )}
    </main>
  )
}

export default OrderRatingPage