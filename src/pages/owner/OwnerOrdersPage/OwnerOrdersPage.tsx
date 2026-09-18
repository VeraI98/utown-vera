import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import { getOwnerOrders } from '../../../services/ownerOrderService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import type { OrderResponse, OrderStatus } from '../../../types/cart'
import { logError } from '../../../utils/logger'

import './OwnerOrdersPage.css'

const PAGE_SIZE = 10

interface StatusFilter {
  label: string
  value: OrderStatus | undefined
}

const STATUS_FILTERS: StatusFilter[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready', value: 'READY' },
  { label: 'Out for delivery', value: 'OUT_FOR_DELIVERY' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

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

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(
    undefined,
  )

  const [reloadKey, setReloadKey] = useState(0)

  // First find the owner's restaurant, then load its orders. Every
  // /orders/restaurant/... call is re-checked for ownership on the backend,
  // but we still need the restaurantId up front to call it at all.
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
          page,
          size: PAGE_SIZE,
          status: statusFilter,
        })

        if (!isMounted) {
          return
        }

        setOrders(data.content)
        setTotalPages(Math.max(1, data.totalPages))
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
  }, [userId, page, statusFilter, reloadKey])

  const handleSelectStatus = (status: OrderStatus | undefined) => {
    setPage(0)
    setStatusFilter(status)
  }

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

  const showEmptyState = !isLoading && !errorMessage && orders.length === 0

  return (
    <main className="owner-orders-page">
      <div className="owner-orders-page__content">
        <h1>Order table</h1>

        <div className="owner-orders-page__filters">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className={`owner-orders-page__filter${
                statusFilter === filter.value
                  ? ' owner-orders-page__filter--active'
                  : ''
              }`}
              onClick={() => handleSelectStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
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

        {!isLoading && !errorMessage && orders.length > 0 && (
          <div className="owner-orders-page__list">
            {orders.map((order) => (
              <button
                className="owner-orders-page__order"
                key={order.id}
                type="button"
                onClick={() => navigate(`${order.id}`)}
              >
                <div className="owner-orders-page__order-top">
                  <span className="owner-orders-page__order-number">
                    No. {order.number}
                  </span>
                  <span
                    className={`owner-orders-page__status owner-orders-page__status--${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="owner-orders-page__order-client">
                  {order.userName || '-'}
                </div>

                <div className="owner-orders-page__order-bottom">
                  <span>{order.time || '-'}</span>
                  <span>{formatAmount(order.totalSum)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {!isLoading && !errorMessage && totalPages > 1 && (
          <div className="owner-orders-page__pagination">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setPage((current) => current - 1)}
            >
              Prev
            </button>

            <span className="owner-orders-page__pagination-label">
              {page + 1} / {totalPages}
            </span>

            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default OwnerOrdersPage
