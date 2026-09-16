import axios from 'axios'
import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import backButtonIcon from '../../assets/waiting order/Back button.svg'
import bellIcon from '../../assets/waiting order/bell.svg'
import foodLogo from '../../assets/waiting order/food.svg'
import ratingStarsIcon from '../../assets/waiting order/Rating stars.svg'
import utLogo from '../../assets/waiting order/ut.svg'

import { getOrderById } from '../../services/orderService'

import {
  createRating,
  getMyRestaurantRating,
  updateRating,
  type RatingResponse,
} from '../../services/ratingService'

import type { OrderResponse } from '../../types/cart'
import { logError } from '../../utils/logger'

import './OrderRatingPage.css'

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

    if (error.response?.status === 404) {
      return 'Order not found.'
    }
  }

  return 'Failed to load or save your rating. Please try again.'
}

function normalizeStatus(status?: string): string {
  return status?.trim().toUpperCase() ?? ''
}

function isOrderDelivered(order: OrderResponse): boolean {
  const status = normalizeStatus(order.status)
  const deliveryStatus = normalizeStatus(order.deliveryStatus)

  return status === 'DELIVERED' || deliveryStatus === 'DELIVERED'
}

function OrderRatingPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()

  const [order, setOrder] = useState<OrderResponse | null>(null)

  const [existingRating, setExistingRating] = useState<RatingResponse | null>(
    null,
  )

  const [rating, setRating] = useState(0)

  const [initialRating, setInitialRating] = useState(0)

  const [hoveredRating, setHoveredRating] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')

  const [successMessage, setSuccessMessage] = useState('')

  const numericOrderId = Number(orderId)

  const isValidOrderId = Number.isInteger(numericOrderId) && numericOrderId > 0

  useEffect(() => {
    if (!isValidOrderId) {
      return
    }

    let isMounted = true

    getOrderById(numericOrderId)
      .then(async (currentOrder) => {
        if (!isMounted) {
          return
        }

        setOrder(currentOrder)

        setErrorMessage('')
        setSuccessMessage('')

        if (!isOrderDelivered(currentOrder)) {
          setErrorMessage('You can rate the restaurant only after delivery.')

          return
        }

        if (!currentOrder.restaurantId) {
          setErrorMessage('Restaurant information is missing.')

          return
        }

        const currentRating = await getMyRestaurantRating(
          currentOrder.restaurantId,
        )

        if (!isMounted) {
          return
        }

        if (currentRating) {
          const currentGrade = Math.round(currentRating.grade)

          setExistingRating(currentRating)

          setRating(currentGrade)

          setInitialRating(currentGrade)
        } else {
          setExistingRating(null)

          setRating(0)
          setInitialRating(0)
        }
      })
      .catch((error) => {
        logError('OrderRatingPage: failed to load order or rating', error)

        if (!isMounted) {
          return
        }

        setErrorMessage(getErrorMessage(error))
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isValidOrderId, numericOrderId])

  const delivered = order ? isOrderDelivered(order) : false

  const displayedRating = hoveredRating || rating

  const ratingPercent = displayedRating * 20

  const canChooseRating =
    Boolean(order) &&
    delivered &&
    Boolean(order?.restaurantId) &&
    !isSubmitting &&
    !isLoading

  const ratingChanged = rating !== initialRating

  const canSubmit =
    Boolean(order) &&
    Boolean(order?.restaurantId) &&
    delivered &&
    rating >= 1 &&
    rating <= 5 &&
    !isSubmitting &&
    !isLoading &&
    (!existingRating || ratingChanged)

  const handleRatingChange = (value: number) => {
    if (!canChooseRating) {
      return
    }

    setRating(value)

    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleReady = async () => {
    if (!order || !order.restaurantId) {
      return
    }

    if (!delivered) {
      setErrorMessage('You can rate the restaurant only after delivery.')

      return
    }

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)

    setErrorMessage('')
    setSuccessMessage('')

    try {
      let savedRating: RatingResponse

      if (existingRating) {
        savedRating = await updateRating(existingRating.id, {
          id: existingRating.id,

          grade: rating,

          userId: existingRating.userId,

          restaurantId: order.restaurantId,
        })
      } else {
        savedRating = await createRating({
          grade: rating,

          restaurantId: order.restaurantId,
        })
      }

      const savedGrade = Math.round(savedRating.grade)

      setExistingRating(savedRating)

      setRating(savedGrade)

      setInitialRating(savedGrade)

      setHoveredRating(0)

      setSuccessMessage(existingRating ? 'Rating updated!' : 'Rating saved!')
    } catch (error) {
      logError('OrderRatingPage: failed to save rating', error)

      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isValidOrderId) {
    return (
      <main className="order-rating-page">
        <section className="order-rating-page__content">
          <div className="order-rating-page__error" role="alert">
            Invalid order ID.
          </div>

          <button
            className="order-rating-page__return-button"
            type="button"
            onClick={() => navigate('/food')}
          >
            Return to Food
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="order-rating-page" aria-busy={isLoading || isSubmitting}>
      <header className="order-rating-page__header">
        <button
          className="order-rating-page__header-button"
          type="button"
          onClick={() => navigate(`/food/order/${numericOrderId}/status`)}
          aria-label="Go back"
          disabled={isSubmitting}
        >
          <img src={backButtonIcon} alt="" aria-hidden="true" />
        </button>

        <div className="order-rating-page__logo" aria-label="UT Food">
          <img src={utLogo} alt="UT" />

          <img src={foodLogo} alt="Food" />
        </div>

        <button
          className="order-rating-page__header-button"
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          disabled={isSubmitting}
        >
          <img src={bellIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <section className="order-rating-page__content">
        {errorMessage && (
          <div className="order-rating-page__error" role="alert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="order-rating-page__success"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="order-rating-page__loading" role="status">
            <div className="order-rating-page__spinner" aria-hidden="true" />

            <p>Loading order...</p>
          </div>
        ) : order ? (
          <>
            <div className="order-rating-page__message">
              <h1>
                {delivered
                  ? existingRating
                    ? 'Your rating'
                    : 'Order delivered!'
                  : 'Order is not delivered yet'}
              </h1>

              <p>
                {delivered
                  ? existingRating
                    ? 'You can change your rating'
                    : 'Please rate the service'
                  : 'Rating will be available after delivery'}
              </p>
            </div>

            <section className="order-rating-page__rating-section">
              <h2>{order.restaurantName || 'Establishment'}</h2>

              <div
                className="order-rating-page__rating"
                style={
                  {
                    '--rating-percent': `${ratingPercent}%`,
                    '--rating-mask': `url("${ratingStarsIcon}")`,
                  } as CSSProperties
                }
                onMouseLeave={() => {
                  if (canChooseRating) {
                    setHoveredRating(0)
                  }
                }}
                aria-label={`Selected rating: ${rating} out of 5`}
              >
                <div
                  className="order-rating-page__stars-image"
                  aria-hidden="true"
                />

                <div className="order-rating-page__star-buttons">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingChange(value)}
                      onMouseEnter={() => {
                        if (canChooseRating) {
                          setHoveredRating(value)
                        }
                      }}
                      onFocus={() => {
                        if (canChooseRating) {
                          setHoveredRating(value)
                        }
                      }}
                      onBlur={() => {
                        if (canChooseRating) {
                          setHoveredRating(0)
                        }
                      }}
                      aria-label={`Rate ${value} out of 5`}
                      aria-pressed={rating === value}
                      disabled={!canChooseRating}
                    />
                  ))}
                </div>
              </div>

              <p
                className="order-rating-page__selected-rating"
                aria-live="polite"
              >
                {rating > 0
                  ? `${rating} out of 5`
                  : delivered
                    ? 'Select a rating'
                    : 'Available after delivery'}
              </p>

              {existingRating && ratingChanged && (
                <p className="order-rating-page__changed-rating">
                  Your current saved rating is {initialRating} out of 5
                </p>
              )}
            </section>
          </>
        ) : null}
      </section>

      {!isLoading && order && (
        <div className="order-rating-page__bottom">
          {delivered ? (
            <button
              type="button"
              onClick={() => {
                if (canSubmit) {
                  void handleReady()
                  return
                }

                if (existingRating && !ratingChanged) {
                  navigate('/food/orders', {
                    replace: true,
                  })
                }
              }}
              disabled={!existingRating && !canSubmit}
            >
              {isSubmitting
                ? 'Saving...'
                : existingRating && !ratingChanged
                  ? 'Done'
                  : existingRating
                    ? 'Update rating'
                    : 'Ready'}
            </button>
          ) : (
            <button type="button" disabled>
              Rating unavailable
            </button>
          )}
        </div>
      )}
    </main>
  )
}

export default OrderRatingPage
