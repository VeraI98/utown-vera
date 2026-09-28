import { getErrorMessage } from '../../utils/getErrorMessage'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import deliveredImage from '../../assets/waiting order/60999822 1.svg'
import backButtonIcon from '../../assets/waiting order/Back button.svg'
import bellIcon from '../../assets/waiting order/bell.svg'
import foodLogo from '../../assets/waiting order/food.svg'
import courierImage from '../../assets/waiting order/Illustration.svg'
import preparingImage from '../../assets/waiting order/Item quantity.svg'
import utLogo from '../../assets/waiting order/ut.svg'

import { getOrderById } from '../../services/orderService'
import type { OrderResponse } from '../../types/cart'
import { logError } from '../../utils/logger'

import './OrderStatusPage.css'

interface StatusContent {
  image: string
  imageAlt: string
  title: string
  message: string
  phase: 'preparing' | 'courier' | 'delivered' | 'cancelled'
}

const POLLING_INTERVAL = 7000

function normalizeStatus(status?: string): string {
  return status?.trim().toUpperCase() ?? ''
}

function getStatusContent(order: OrderResponse): StatusContent {
  const orderStatus = normalizeStatus(order.status)

  switch (orderStatus) {
    case 'PENDING':
      return {
        image: preparingImage,
        imageAlt: 'Order pending',
        title: 'Order received',
        message:
          'The restaurant received your order.\nWaiting for confirmation.',
        phase: 'preparing',
      }

    case 'CONFIRMED':
      return {
        image: preparingImage,
        imageAlt: 'Order confirmed',
        title: 'Your order is confirmed',
        message:
          'The restaurant confirmed your order.\nPreparation will begin soon.',
        phase: 'preparing',
      }

    case 'PREPARING':
      return {
        image: preparingImage,
        imageAlt: 'Restaurant preparing the order',
        title: 'Your order is being prepared',
        message:
          'The restaurant is preparing your order.\nWe will update this page automatically.',
        phase: 'preparing',
      }

    case 'READY':
      return {
        image: preparingImage,
        imageAlt: 'Order ready',
        title: 'Your order is ready',
        message:
          'The restaurant finished preparing your order.\nWaiting for the courier.',
        phase: 'preparing',
      }

    case 'OUT_FOR_DELIVERY':
      return {
        image: courierImage,
        imageAlt: 'Courier delivering the order',
        title: 'The courier is on the way',
        message:
          'The courier has picked up your order!\nYour order will arrive soon.',
        phase: 'courier',
      }

    case 'DELIVERED':
      return {
        image: deliveredImage,
        imageAlt: 'Order delivered',
        title: 'Order delivered',
        message:
          'Your order has been delivered!\nThank you for choosing UT Food.',
        phase: 'delivered',
      }

    case 'CANCELLED':
      return {
        image: preparingImage,
        imageAlt: 'Order cancelled',
        title: 'Order cancelled',
        message:
          'Unfortunately, your order was cancelled.\nPlease contact support for more information.',
        phase: 'cancelled',
      }

    case 'REFUNDED':
      return {
        image: preparingImage,
        imageAlt: 'Order refunded',
        title: 'Order refunded',
        message:
          'The order has been refunded.\nPlease contact support if you have any questions.',
        phase: 'cancelled',
      }

    default:
      return {
        image: preparingImage,
        imageAlt: 'Order status',
        title: 'Order status',
        message:
          'We are checking the current order status.\nThis page will update automatically.',
        phase: 'preparing',
      }
  }
}

function OrderStatusPage() {
  const navigate = useNavigate()

  const { orderId } = useParams()

  const [order, setOrder] = useState<OrderResponse | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  const [isRefreshing, setIsRefreshing] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')

  const requestInProgressRef = useRef(false)

  const numericOrderId = Number(orderId)

  const isValidOrderId = Number.isInteger(numericOrderId) && numericOrderId > 0

  const loadOrder = useCallback(
    async (initialLoad = false) => {
      if (!isValidOrderId || requestInProgressRef.current) {
        return
      }

      requestInProgressRef.current = true

      if (!initialLoad) {
        setIsRefreshing(true)
      }

      try {
        const currentOrder = await getOrderById(numericOrderId)

        setOrder(currentOrder)

        setErrorMessage('')
      } catch (error) {
        logError('OrderStatusPage: failed to refresh order status', error)

        setErrorMessage(
          getErrorMessage(
            error,
            'Failed to load order status. Please try again.',
            { 404: 'Order not found.' },
          ),
        )
      } finally {
        requestInProgressRef.current = false

        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [isValidOrderId, numericOrderId],
  )

  useEffect(() => {
    if (!isValidOrderId) {
      return
    }

    let isActive = true

    const fetchInitialOrder = async () => {
      requestInProgressRef.current = true

      try {
        const currentOrder = await getOrderById(numericOrderId)

        if (!isActive) {
          return
        }

        setOrder(currentOrder)

        setErrorMessage('')
      } catch (error) {
        logError('OrderStatusPage: failed to load order status', error)

        if (!isActive) {
          return
        }

        setErrorMessage(
          getErrorMessage(
            error,
            'Failed to load order status. Please try again.',
            { 404: 'Order not found.' },
          ),
        )
      } finally {
        requestInProgressRef.current = false

        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void fetchInitialOrder()

    return () => {
      isActive = false
    }
  }, [isValidOrderId, numericOrderId])

  const currentStatus = useMemo(
    () => (order ? getStatusContent(order) : null),
    [order],
  )

  useEffect(() => {
    if (
      !isValidOrderId ||
      !currentStatus ||
      currentStatus.phase === 'delivered' ||
      currentStatus.phase === 'cancelled'
    ) {
      return
    }

    const pollingTimer = window.setInterval(() => {
      void loadOrder()
    }, POLLING_INTERVAL)

    return () => {
      window.clearInterval(pollingTimer)
    }
  }, [currentStatus, isValidOrderId, loadOrder])

  const handleHideStatus = () => {
    navigate('/food', {
      replace: true,
    })
  }

  const handleRateOrder = () => {
    if (!order || normalizeStatus(order.status) !== 'DELIVERED') {
      return
    }

    navigate(`/food/order/${order.id}/rating`, {
      state: {
        order,
      },
    })
  }

  if (!isValidOrderId) {
    return (
      <main className="order-status-page">
        <section className="order-status-page__sheet order-status-page__sheet--error">
          <h1>Invalid order</h1>

          <p>The order ID in the address is invalid.</p>

          <button
            className="order-status-page__support-button"
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
    <main className="order-status-page" aria-busy={isLoading || isRefreshing}>
      <section className="order-status-page__hero">
        <header className="order-status-page__header">
          <button
            className="order-status-page__header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={backButtonIcon} alt="" aria-hidden="true" />
          </button>

          <Link
            to="/"
            className="order-status-page__logo"
            aria-label="Go to home"
          >
            <img src={utLogo} alt="UT" />

            <img src={foodLogo} alt="Food" />
          </Link>

          <button
            className="order-status-page__header-button"
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <img src={bellIcon} alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="order-status-page__illustration">
          {isLoading ? (
            <div className="order-status-page__spinner" aria-hidden="true" />
          ) : currentStatus ? (
            <img src={currentStatus.image} alt={currentStatus.imageAlt} />
          ) : null}
        </div>
      </section>

      <section className="order-status-page__sheet">
        {errorMessage && (
          <div className="order-status-page__error" role="alert">
            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={() => void loadOrder()}
              disabled={isRefreshing}
            >
              Try again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="order-status-page__loading" role="status">
            Loading order status...
          </div>
        ) : order && currentStatus ? (
          <>
            <div className="order-status-page__delivery-time">
              {currentStatus.phase === 'delivered' ? (
                <>
                  <strong>Delivered</strong>

                  <span>order completed</span>
                </>
              ) : currentStatus.phase === 'cancelled' ? (
                <>
                  <strong>Closed</strong>

                  <span>order is no longer active</span>
                </>
              ) : order.deliveryTime ? (
                <>
                  <strong>{order.deliveryTime}</strong>

                  <span>estimated delivery time</span>
                </>
              ) : (
                <>
                  <strong>Unavailable</strong>

                  <span>delivery time unavailable</span>
                </>
              )}
            </div>

            <h1>{order.restaurantName || 'Restaurant'}</h1>

            <section className="order-status-page__status" aria-live="polite">
              <h2>{currentStatus.title}</h2>

              <p>
                {currentStatus.message.split('\n').map((line, index, lines) => (
                  <span key={`${line}-${index}`}>
                    {line}

                    {index < lines.length - 1 && <br />}
                  </span>
                ))}
              </p>

              {isRefreshing && (
                <span className="order-status-page__refreshing">
                  Updating status...
                </span>
              )}

              {currentStatus.phase === 'delivered' && (
                <button
                  className="order-status-page__rating-button"
                  type="button"
                  onClick={handleRateOrder}
                >
                  Rate order
                </button>
              )}

              {currentStatus.phase !== 'delivered' && (
                <button
                  className="order-status-page__support-button"
                  type="button"
                  onClick={() => navigate('/contact-support')}
                >
                  Contact support
                </button>
              )}
            </section>
          </>
        ) : null}

        <div className="order-status-page__bottom">
          <button
            className="order-status-page__hide-button"
            type="button"
            onClick={handleHideStatus}
          >
            Hide order status
          </button>
        </div>
      </section>
    </main>
  )
}

export default OrderStatusPage
