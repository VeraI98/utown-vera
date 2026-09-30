import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ORDER_STATUS_LABELS as STATUS_LABELS } from '../../../constants/orderStatus'
import {
  getOrderById,
  updateOrderStatus,
} from '../../../services/ownerOrderService'
import type { OrderResponse, OrderStatus } from '../../../types/cart'
import { getErrorMessage } from '../../../utils/getErrorMessage'
import { logError } from '../../../utils/logger'

import './OwnerOrderCardPage.css'

// The order moves through this fixed sequence. Cancelled/refunded are
// end states reachable separately (via the Cancel button), not part of the
// "move forward" flow.
const STATUS_FLOW: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

function formatAmount(amount: number) {
  if (typeof amount !== 'number') {
    return '-'
  }

  return amount.toLocaleString('en-US')
}

function OwnerOrderCardPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const id = Number(orderId)

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id) {
      return
    }

    let isMounted = true

    const loadOrder = async () => {
      if (isMounted) {
        setIsLoading(true)
        setErrorMessage('')
      }

      try {
        const data = await getOrderById(id)

        if (isMounted) {
          setOrder(data)
        }
      } catch (error) {
        logError('OwnerOrderCardPage: failed to load order', error)

        if (isMounted) {
          setErrorMessage(getErrorMessage(error, 'Something went wrong.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrder()

    return () => {
      isMounted = false
    }
  }, [id, reloadKey])

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  const handleChangeStatus = async (nextStatus: OrderStatus) => {
    if (!order || isUpdating) {
      return
    }

    setIsUpdating(true)
    setUpdateError('')

    try {
      const updated = await updateOrderStatus(order.id, nextStatus)

      setOrder(updated)
      if (nextStatus === 'CONFIRMED') {
        navigate(`/owner/orders/${order.id}/cooking-time`)
      }
    } catch (error: unknown) {
      logError('OwnerOrderCardPage: failed to update status', error)

      setUpdateError(getErrorMessage(error, 'Something went wrong.'))
    } finally {
      setIsUpdating(false)
    }
  }

  const currentIndex = order ? STATUS_FLOW.indexOf(order.status) : -1

  const nextStatus =
    currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
      ? STATUS_FLOW[currentIndex + 1]
      : null

  const canCancel =
    order &&
    order.status !== 'CANCELLED' &&
    order.status !== 'DELIVERED' &&
    order.status !== 'REFUNDED'

  return (
    <main className="owner-order-card-page">
      <div className="owner-order-card-page__content">
        {isLoading && (
          <p className="owner-order-card-page__message">Loading...</p>
        )}

        {!isLoading && errorMessage && (
          <p className="owner-order-card-page__error" role="alert">
            {errorMessage}
            <button
              className="owner-order-card-page__retry"
              type="button"
              onClick={handleRetry}
            >
              Retry
            </button>
          </p>
        )}

        {!isLoading && !errorMessage && order && (
          <>
            <div className="owner-order-card-page__header">
              <h1>Order No. {order.number}</h1>
              <span
                className={`owner-order-card-page__status owner-order-card-page__status--${order.status.toLowerCase()}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            <section className="owner-order-card-page__section">
              <h2>Client</h2>
              <p>{order.userName || '-'}</p>
              <p>{order.clientPhone || '-'}</p>
            </section>

            <section className="owner-order-card-page__section">
              <h2>Delivery</h2>
              <p>{order.fullAddress || '-'}</p>
              {order.noteForCourier && <p>{order.noteForCourier}</p>}
              <p>
                {order.date || '-'} {order.time || ''}
              </p>
            </section>

            <section className="owner-order-card-page__section">
              <h2>Items</h2>

              <div className="owner-order-card-page__items">
                {order.items.length === 0 && <p>No items.</p>}

                {order.items.map((item) => (
                  <div className="owner-order-card-page__item" key={item.id}>
                    <span className="owner-order-card-page__item-name">
                      {item.count}× {item.dishTitle}
                    </span>
                    <span>{formatAmount(item.sum)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="owner-order-card-page__section owner-order-card-page__totals">
              <div className="owner-order-card-page__totals-row">
                <span>Order</span>
                <span>{formatAmount(order.orderPrice)}</span>
              </div>
              <div className="owner-order-card-page__totals-row">
                <span>Delivery</span>
                <span>{formatAmount(order.deliveryPrice)}</span>
              </div>
              <div className="owner-order-card-page__totals-row owner-order-card-page__totals-row--total">
                <span>Total</span>
                <span>{formatAmount(order.totalSum)}</span>
              </div>
            </section>

            {updateError && (
              <p className="owner-order-card-page__error" role="alert">
                {updateError}
              </p>
            )}

            <div className="owner-order-card-page__actions">
              {nextStatus && (
                <button
                  className="owner-order-card-page__primary-button"
                  type="button"
                  disabled={isUpdating}
                  onClick={() =>
                    nextStatus === 'PREPARING'
                      ? navigate(`/owner/orders/${order.id}/cooking-time`)
                      : void handleChangeStatus(nextStatus)
                  }
                >
                  {nextStatus === 'CONFIRMED'
                    ? 'Accept the order'
                    : nextStatus === 'PREPARING'
                      ? 'Start cooking'
                      : `Mark as ${STATUS_LABELS[nextStatus]}`}
                </button>
              )}

              {canCancel && (
                <button
                  className="owner-order-card-page__cancel-button"
                  type="button"
                  disabled={isUpdating}
                  onClick={() => void handleChangeStatus('CANCELLED')}
                >
                  Cancel order
                </button>
              )}
            </div>
          </>
        )}

        {!isLoading && !errorMessage && !order && (
          <p className="owner-order-card-page__message">Order not found.</p>
        )}

        <button
          className="owner-order-card-page__back-link"
          type="button"
          onClick={() => navigate('/owner/orders')}
        >
          Back to order table
        </button>
      </div>
    </main>
  )
}

export default OwnerOrderCardPage
