import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/order/Back button.svg'
import bankIcon from '../../assets/order/bank.svg'
import bellIcon from '../../assets/order/bell.svg'
import deliveryIcon from '../../assets/order/delivery-man.svg'
import foodLogo from '../../assets/order/food.svg'
import mapIcon from '../../assets/order/map.svg'
import utLogo from '../../assets/order/ut.svg'
import warningIcon from '../../assets/order/warning.svg'

import type { OrderItem } from '../OrderPage/OrderPage'
import { formatPrice } from '../RestaurantPage/restaurantData'

import './OrderPaymentPage.css'

interface OrderPaymentPageState {
  orderItems?: OrderItem[]
}

const DELIVERY_PRICE = 6000
const SERVICE_FEE = 300
const SENDING_DURATION = 2000

function OrderPaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [isSending, setIsSending] = useState(false)
  const sendingTimerRef = useRef<number | null>(null)

  const state = location.state as OrderPaymentPageState | null
  const orderItems = state?.orderItems ?? []

  const orderAmount = orderItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0,
  )

  const totalPrice =
    orderAmount + DELIVERY_PRICE + SERVICE_FEE

  useEffect(() => {
    return () => {
      if (sendingTimerRef.current !== null) {
        window.clearTimeout(sendingTimerRef.current)
      }
    }
  }, [])

  const handlePay = () => {
    if (isSending || orderItems.length === 0) {
      return
    }

    setIsSending(true)

    console.log('Pay order:', {
      orderItems,
      orderAmount,
      delivery: DELIVERY_PRICE,
      serviceFee: SERVICE_FEE,
      totalPrice,
    })

    sendingTimerRef.current = window.setTimeout(() => {
      sendingTimerRef.current = null

      navigate('/food/order/rating', {
        replace: true,
        state: {
          orderItems,
          orderAmount,
          deliveryPrice: DELIVERY_PRICE,
          serviceFee: SERVICE_FEE,
          totalPrice,
        },
      })
    }, SENDING_DURATION)
  }

  return (
    <main
      className="order-payment-page"
      aria-busy={isSending}
    >
      <header className="order-payment-page__header">
        <button
          className="order-payment-page__header-button"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          disabled={isSending}
        >
          <img
            src={backButtonIcon}
            alt=""
            aria-hidden="true"
          />
        </button>

        <div
          className="order-payment-page__logo"
          aria-label="UT Food"
        >
          <img src={utLogo} alt="UT" />
          <img src={foodLogo} alt="Food" />
        </div>

        <button
          className="order-payment-page__header-button"
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          disabled={isSending}
        >
          <img
            src={bellIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </header>

      <section className="order-payment-page__content">
        <h1>Order Payment</h1>

        <h2>Pizzalio</h2>

        <div className="order-payment-page__info-list">
          <button
            className="order-payment-page__info-card"
            type="button"
            disabled={isSending}
          >
            <img
              src={deliveryIcon}
              alt=""
              aria-hidden="true"
            />

            <div>
              <strong>
                Delivery in 45–55 minutes.
              </strong>
            </div>
          </button>

          <button
            className="order-payment-page__info-card"
            type="button"
            disabled={isSending}
          >
            <img
              src={mapIcon}
              alt=""
              aria-hidden="true"
            />

            <div>
              <strong>
                Home, 569 Byeongyeong-ro, Seobuk-gu
              </strong>

              <span>Delivery Location</span>
            </div>
          </button>

          <button
            className="order-payment-page__info-card"
            type="button"
            disabled={isSending}
          >
            <img
              src={warningIcon}
              alt=""
              aria-hidden="true"
            />

            <div>
              <strong>Note for the courier</strong>
              <span>Leave at the door</span>
            </div>
          </button>
        </div>

        <section className="order-payment-page__section">
          <h2>Payment</h2>

          <button
            className="order-payment-page__info-card"
            type="button"
            disabled={isSending}
          >
            <img
              src={bankIcon}
              alt=""
              aria-hidden="true"
            />

            <div>
              <strong>KEB Hana Bank</strong>
              <span>4400 4200 1343 1234</span>
            </div>
          </button>
        </section>

        <section className="order-payment-page__summary">
          <h2>Total (won)</h2>

          <div className="order-payment-page__summary-row">
            <span>Order Amount</span>

            <strong>
              {formatPrice(orderAmount)}
            </strong>
          </div>

          <div className="order-payment-page__summary-row">
            <span>Delivery</span>

            <strong>
              {formatPrice(DELIVERY_PRICE)}
            </strong>
          </div>

          <div className="order-payment-page__summary-row">
            <span>Service Fee</span>

            <strong>
              {formatPrice(SERVICE_FEE)}
            </strong>
          </div>

          <div className="order-payment-page__summary-row">
            <span>Total</span>

            <strong>
              {formatPrice(totalPrice)}
            </strong>
          </div>
        </section>
      </section>

      <div className="order-payment-page__bottom">
        <strong>{formatPrice(totalPrice)}</strong>

        <button
          type="button"
          onClick={handlePay}
          disabled={isSending || orderItems.length === 0}
        >
          {isSending ? 'Sending...' : 'Pay'}
        </button>
      </div>

      {isSending && (
        <div
          className="order-payment-page__sending-overlay"
          role="status"
          aria-live="polite"
          aria-label="Sending order"
        >
          <div
            className="order-payment-page__spinner"
            aria-hidden="true"
          />

          <p>Sending order...</p>
        </div>
      )}
    </main>
  )
}

export default OrderPaymentPage