import { getErrorMessage } from '../../utils/getErrorMessage'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/order/Back button.svg'
import bellIcon from '../../assets/order/bell.svg'
import foodLogo from '../../assets/order/food.svg'
import utLogo from '../../assets/order/ut.svg'

import { getMyOrders } from '../../services/orderService'
import type { OrderResponse } from '../../types/cart'
import { logError } from '../../utils/logger'

import './OrdersHistoryPage.css'

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

function normalizeStatus(status?: string): string {
  return status?.trim().toUpperCase() ?? ''
}

function getStatusLabel(status?: string): string {
  switch (normalizeStatus(status)) {
    case 'PENDING':
      return 'Order received'

    case 'CONFIRMED':
      return 'Confirmed'

    case 'PREPARING':
      return 'Preparing'

    case 'READY':
      return 'Ready'

    case 'OUT_FOR_DELIVERY':
      return 'Out for delivery'

    case 'DELIVERED':
      return 'Delivered'

    case 'CANCELLED':
      return 'Cancelled'

    case 'REFUNDED':
      return 'Refunded'

    default:
      return status || 'Unknown status'
  }
}

function getStatusClass(status?: string): string {
  switch (normalizeStatus(status)) {
    case 'DELIVERED':
      return 'orders-history-page__status--delivered'

    case 'CANCELLED':
    case 'REFUNDED':
      return 'orders-history-page__status--cancelled'

    case 'OUT_FOR_DELIVERY':
      return 'orders-history-page__status--delivery'

    default:
      return 'orders-history-page__status--active'
  }
}

function isDeliveredOrder(order: OrderResponse): boolean {
  const status = normalizeStatus(order.status)

  const deliveryStatus = normalizeStatus(order.deliveryStatus)

  return status === 'DELIVERED' || deliveryStatus === 'DELIVERED'
}

function sortOrders(currentOrders: OrderResponse[]): OrderResponse[] {
  return [...currentOrders].sort(
    (firstOrder, secondOrder) => secondOrder.id - firstOrder.id,
  )
}

function OrdersHistoryPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState<OrderResponse[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [errorMessage, setErrorMessage] = useState('')

  const loadOrders = useCallback(async () => {
    try {
      const currentOrders = await getMyOrders()

      const sortedOrders = sortOrders(currentOrders)

      setOrders(sortedOrders)

      setErrorMessage('')
    } catch (error) {
      logError('OrdersHistoryPage: failed to refresh orders', error)

      setErrorMessage(
        getErrorMessage(error, 'Failed to load your orders. Please try again.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    getMyOrders()
      .then((currentOrders) => {
        if (!isMounted) {
          return
        }

        setOrders(sortOrders(currentOrders))

        setErrorMessage('')
      })
      .catch((error) => {
        logError('OrdersHistoryPage: failed to load orders', error)

        if (!isMounted) {
          return
        }

        setErrorMessage(
          getErrorMessage(
            error,
            'Failed to load your orders. Please try again.',
          ),
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setErrorMessage('')

    void loadOrders()
  }

  const handleOpenOrder = (order: OrderResponse) => {
    navigate(`/food/order/${order.id}/status`, {
      state: {
        order,
      },
    })
  }

  const handleRateOrder = (order: OrderResponse) => {
    if (!isDeliveredOrder(order)) {
      return
    }

    navigate(`/food/order/${order.id}/rating`, {
      state: {
        order,
      },
    })
  }

  return (
    <main className="orders-history-page">
      <header className="orders-history-page__header">
        <button
          className="orders-history-page__header-button"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <img src={backButtonIcon} alt="" aria-hidden="true" />
        </button>

        <Link
          to="/"
          className="orders-history-page__logo"
          aria-label="Go to home"
        >
          <img src={utLogo} alt="UT" />

          <img src={foodLogo} alt="Food" />
        </Link>

        <button
          className="orders-history-page__header-button"
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <img src={bellIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <section className="orders-history-page__content">
        <div className="orders-history-page__title-row">
          <h1>My orders</h1>

          {!isLoading && orders.length > 0 && (
            <button type="button" onClick={handleRefresh}>
              Refresh
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="orders-history-page__error" role="alert">
            <p>{errorMessage}</p>

            <button type="button" onClick={handleRefresh}>
              Try again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="orders-history-page__loading" role="status">
            <div className="orders-history-page__spinner" aria-hidden="true" />

            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-history-page__empty">
            <h2>No orders yet</h2>

            <p>Your food orders will appear here.</p>

            <button type="button" onClick={() => navigate('/food')}>
              Find food
            </button>
          </div>
        ) : (
          <div className="orders-history-page__list">
            {orders.map((order) => {
              const isDelivered = isDeliveredOrder(order)

              return (
                <article className="orders-history-page__card" key={order.id}>
                  <div className="orders-history-page__card-top">
                    <div>
                      <h2>{order.restaurantName || 'Restaurant'}</h2>

                      <p>
                        {order.number
                          ? `Order ${order.number}`
                          : `Order #${order.id}`}
                      </p>
                    </div>

                    <span
                      className={`orders-history-page__status ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="orders-history-page__details">
                    {order.date && (
                      <div>
                        <span>Date</span>

                        <strong>{order.date}</strong>
                      </div>
                    )}

                    {order.time && (
                      <div>
                        <span>Time</span>

                        <strong>{order.time}</strong>
                      </div>
                    )}

                    <div>
                      <span>Total</span>

                      <strong>
                        {formatPrice(order.totalSum ?? order.orderPrice ?? 0)}
                      </strong>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="orders-history-page__items">
                      {order.items.slice(0, 2).map((item) => {
                        const hasImage = isValidImageUrl(item.dishImageUrl)

                        return (
                          <div
                            className="orders-history-page__item"
                            key={item.id}
                          >
                            {hasImage ? (
                              <img
                                src={item.dishImageUrl}
                                alt={item.dishTitle || 'Dish'}
                              />
                            ) : (
                              <div
                                className="orders-history-page__item-image-placeholder"
                                aria-hidden="true"
                              />
                            )}

                            <div>
                              <strong>{item.dishTitle || 'Dish'}</strong>

                              <span>
                                {item.count} × {formatPrice(item.sum ?? 0)}
                              </span>
                            </div>
                          </div>
                        )
                      })}

                      {order.items.length > 2 && (
                        <p className="orders-history-page__more-items">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  )}

                  <div className="orders-history-page__actions">
                    <button
                      type="button"
                      className="orders-history-page__view-button"
                      onClick={() => handleOpenOrder(order)}
                    >
                      {isDelivered ? 'View order' : 'Track order'}
                    </button>

                    {isDelivered && (
                      <button
                        type="button"
                        className="orders-history-page__rate-button"
                        onClick={() => handleRateOrder(order)}
                      >
                        Rate order
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default OrdersHistoryPage
