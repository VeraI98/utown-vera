import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import {
  getOwnerOrders,
  updateOrderStatus,
} from '../../../services/ownerOrderService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import type { OrderResponse, OrderStatus } from '../../../types/cart'
import { logError } from '../../../utils/logger'

import './OwnerOrdersPage.css'

const PAGE_SIZE = 50

type OrdersTab = 'ACTIVE' | 'COMPLETED'

const ACTIVE_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
]

const COMPLETED_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED']

const ACTIVE_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: 'Confirmed',
  PREPARING: 'In preparation',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
}

const COMPLETED_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  DELIVERED: 'Completed',
  CANCELLED: 'Declined',
}

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

  return 'Failed to load orders.'
}

function formatAmount(amount: number) {
  if (typeof amount !== 'number') {
    return '-'
  }

  return amount.toLocaleString('en-US')
}

function OwnerOrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id

  const [restaurantId, setRestaurantId] = useState<number | null>(null)

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [tab, setTab] = useState<OrdersTab>('ACTIVE')

  const [reloadKey, setReloadKey] = useState(0)

  const [confirmingOrder, setConfirmingOrder] = useState<OrderResponse | null>(
    null,
  )
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [acceptError, setAcceptError] = useState('')

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true

    const loadOrders = async () => {
      if (isMounted) {
        setIsLoading(true)
        setErrorMessage('')
      }

      try {
        const restaurants = await getOwnerRestaurants(userId)

        const restaurant = restaurants[0]

        if (!restaurant) {
          if (isMounted) {
            setErrorMessage('No restaurant found.')
          }
          return
        }

        if (isMounted) {
          setRestaurantId(restaurant.id)
        }

        const data = await getOwnerOrders(restaurant.id, {
          page: 0,
          size: PAGE_SIZE,
        })

        if (!isMounted) {
          return
        }

        setOrders(data.content)
      } catch (error) {
        logError('OwnerOrdersPage: failed to load orders', error)

        if (isMounted) {
          setOrders([])
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [userId, reloadKey])

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  const visibleOrders = orders.filter((order) =>
    (tab === 'ACTIVE' ? ACTIVE_STATUSES : COMPLETED_STATUSES).includes(
      order.status,
    ),
  )

  const handleAcceptClick = (order: OrderResponse) => {
    setAcceptError('')
    setConfirmingOrder(order)
  }

  const handleCloseConfirm = () => {
    if (isAccepting || isDeclining) {
      return
    }

    setConfirmingOrder(null)
    setAcceptError('')
  }

  const handleConfirmAccept = async () => {
    if (!confirmingOrder || isAccepting || isDeclining) {
      return
    }

    setIsAccepting(true)
    setAcceptError('')

    try {
      await updateOrderStatus(confirmingOrder.id, 'PREPARING')

      const acceptedOrderId = confirmingOrder.id

      setConfirmingOrder(null)
      navigate(`${acceptedOrderId}/cooking-time`)
    } catch (error) {
      logError('OwnerOrdersPage: failed to accept order', error)

      setAcceptError(getErrorMessage(error))
    } finally {
      setIsAccepting(false)
    }
  }

  const handleConfirmDecline = async () => {
    if (!confirmingOrder || isAccepting || isDeclining) {
      return
    }

    setIsDeclining(true)
    setAcceptError('')

    try {
      const updated = await updateOrderStatus(confirmingOrder.id, 'CANCELLED')

      setOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order)),
      )

      setConfirmingOrder(null)
    } catch (error) {
      logError('OwnerOrdersPage: failed to decline order', error)

      setAcceptError(getErrorMessage(error))
    } finally {
      setIsDeclining(false)
    }
  }

  const showEmptyState =
    !isLoading && !errorMessage && visibleOrders.length === 0

  return (
    <main className="owner-orders-page">
      <div className="owner-orders-page__content">
        <div className="owner-orders-page__title-row">
          <h1>Order Table</h1>

          <button
            type="button"
            className="owner-orders-page__refresh"
            aria-label="Refresh orders"
            onClick={handleRetry}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 12a8 8 0 0114.5-4.5M20 12a8 8 0 01-14.5 4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 3.5v4h-4M5.5 20.5v-4h4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="owner-orders-page__tabs">
          <button
            type="button"
            className={`owner-orders-page__tab${
              tab === 'ACTIVE' ? ' owner-orders-page__tab--active' : ''
            }`}
            onClick={() => setTab('ACTIVE')}
          >
            New / In Progress
          </button>

          <button
            type="button"
            className={`owner-orders-page__tab${
              tab === 'COMPLETED' ? ' owner-orders-page__tab--active' : ''
            }`}
            onClick={() => setTab('COMPLETED')}
          >
            Completed
          </button>
        </div>

        {isLoading && <p className="owner-orders-page__message">Loading...</p>}

        {!isLoading && errorMessage && (
          <p className="owner-orders-page__error" role="alert">
            {errorMessage}
            {restaurantId && (
              <button
                className="owner-orders-page__retry"
                type="button"
                onClick={handleRetry}
              >
                Retry
              </button>
            )}
          </p>
        )}

        {showEmptyState && (
          <p className="owner-orders-page__message">No orders found.</p>
        )}

        {!isLoading && !errorMessage && visibleOrders.length > 0 && (
          <div className="owner-orders-page__list">
            {visibleOrders.map((order) => (
              <div className="owner-orders-page__order" key={order.id}>
                <div className="owner-orders-page__order-top">
                  <span className="owner-orders-page__order-number">
                    Order No. {order.number}
                  </span>
                  <span className="owner-orders-page__order-time">
                    {order.time || '-'}
                  </span>
                </div>

                <div className="owner-orders-page__items">
                  {order.items.map((item) => (
                    <div className="owner-orders-page__item" key={item.id}>
                      <span className="owner-orders-page__item-name">
                        {item.dishTitle} / x{item.count}
                      </span>

                      {item.elements.length > 0 && (
                        <span className="owner-orders-page__item-elements">
                          {item.elements
                            .map((element) => element.name)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="owner-orders-page__order-total">
                  {formatAmount(order.totalSum)}
                </div>

                {tab === 'ACTIVE' ? (
                  order.status === 'PENDING' ? (
                    <button
                      type="button"
                      className="owner-orders-page__accept-button"
                      onClick={() => handleAcceptClick(order)}
                    >
                      Accept
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="owner-orders-page__status-button"
                      disabled
                    >
                      {ACTIVE_STATUS_LABELS[order.status] ?? order.status}
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    className={`owner-orders-page__completed-button${
                      order.status === 'CANCELLED'
                        ? ' owner-orders-page__completed-button--declined'
                        : ''
                    }`}
                    disabled
                  >
                    {COMPLETED_STATUS_LABELS[order.status] ?? order.status}
                  </button>
                )}

                <button
                  type="button"
                  className="owner-orders-page__more-details"
                  onClick={() => navigate(`${order.id}`)}
                >
                  More details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmingOrder && (
        <div className="owner-orders-page__modal-overlay">
          <button
            type="button"
            className="owner-orders-page__modal-backdrop"
            aria-label="Close"
            disabled={isAccepting || isDeclining}
            onClick={handleCloseConfirm}
          />

          <div className="owner-orders-page__modal">
            <p className="owner-orders-page__modal-title">
              Accept the order
              <br />
              for processing?
            </p>

            {acceptError && (
              <p className="owner-orders-page__modal-error" role="alert">
                {acceptError}
              </p>
            )}

            <button
              type="button"
              className="owner-orders-page__modal-decline"
              disabled={isAccepting || isDeclining}
              onClick={() => void handleConfirmDecline()}
            >
              {isDeclining ? 'Declining...' : 'Decline'}
            </button>

            <button
              type="button"
              className="owner-orders-page__modal-accept"
              disabled={isAccepting || isDeclining}
              onClick={() => void handleConfirmAccept()}
            >
              {isAccepting ? 'Accepting...' : 'Accept'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default OwnerOrdersPage
