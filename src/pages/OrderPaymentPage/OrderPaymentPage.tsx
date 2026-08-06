import axios from 'axios'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/order/Back button.svg'
import bankIcon from '../../assets/order/bank.svg'
import bellIcon from '../../assets/order/bell.svg'
import deliveryIcon from '../../assets/order/delivery-man.svg'
import foodLogo from '../../assets/order/food.svg'
import mapIcon from '../../assets/order/map.svg'
import utLogo from '../../assets/order/ut.svg'
import warningIcon from '../../assets/order/warning.svg'

import {
  checkoutMyCart,
  getMyCart,
} from '../../services/cartService'
import type { CartResponse } from '../../types/cart'

import { formatPrice } from '../RestaurantPage/restaurantData'

import './OrderPaymentPage.css'

interface OrderPaymentPageState {
  cart?: CartResponse
}

interface StoredUser {
  username?: string
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

  return 'Failed to place the order. Please try again.'
}

function getClientPhone(): string {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return ''
  }

  try {
    const user = JSON.parse(storedUser) as StoredUser

    return user.username ?? ''
  } catch {
    return ''
  }
}

function OrderPaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const locationState =
    location.state as OrderPaymentPageState | null

  const [cart, setCart] = useState<CartResponse | null>(
    locationState?.cart ?? null,
  )
  const [isLoadingCart, setIsLoadingCart] = useState(
    !locationState?.cart,
  )
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadCurrentCart = async () => {
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

        setErrorMessage(getErrorMessage(error))
      } finally {
        if (isMounted) {
          setIsLoadingCart(false)
        }
      }
    }

    void loadCurrentCart()

    return () => {
      isMounted = false
    }
  }, [])

  const orderAmount = cart?.sumOrder ?? 0
  const deliveryPrice = cart?.deliveryPrice ?? 0
  const totalPrice =
    cart?.totalSum ?? orderAmount + deliveryPrice

  const restaurant = cart?.items[0]
  const restaurantId = restaurant?.restaurantId
  const restaurantName =
    restaurant?.restaurantName ?? 'Restaurant'

  const canPay =
    Boolean(cart) &&
    Boolean(restaurantId) &&
    orderAmount >= MIN_ORDER_AMOUNT &&
    !isSending &&
    !isLoadingCart

  const handlePay = async () => {
    if (!canPay || !restaurantId) {
      return
    }

    setIsSending(true)
    setErrorMessage('')

    try {
      const order = await checkoutMyCart({
        restaurantId,
        fullAddress:
          '569 Byeongyeong-ro, Seobuk-gu, Cheonan',
        area: 'Seobuk-gu',
        city: 'Cheonan',
        state: 'Chungcheongnam-do',
        postcode: '31115',
        street: '569 Byeongyeong-ro',
        latitude: 0,
        longitude: 0,
        typeAddress: 0,
        intercomCode: '',
        clientPhone: getClientPhone(),
        deliveryTime: '45–55 minutes',
        payment: 'CASH',
        noteForCourier: 'Leave at the door',
        details: '',
      })

      navigate(`/food/order/${order.id}/status`, {
        replace: true,
        state: {
          order,
        },
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setIsSending(false)
    }
  }

  return (
    <main
      className="order-payment-page"
      aria-busy={isSending || isLoadingCart}
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

        {errorMessage && (
          <div
            className="order-payment-page__error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {isLoadingCart ? (
          <div
            className="order-payment-page__loading"
            role="status"
          >
            Loading order...
          </div>
        ) : (
          <>
            <h2>{restaurantName}</h2>

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
                    Home, 569 Byeongyeong-ro,
                    Seobuk-gu
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
                  <strong>Cash</strong>
                  <span>Payment to the courier</span>
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
                  {formatPrice(deliveryPrice)}
                </strong>
              </div>

              <div className="order-payment-page__summary-row">
                <span>Total</span>

                <strong>
                  {formatPrice(totalPrice)}
                </strong>
              </div>
            </section>
          </>
        )}
      </section>

      {!isLoadingCart && (
        <div className="order-payment-page__bottom">
          <strong>{formatPrice(totalPrice)}</strong>

          <button
            type="button"
            onClick={() => void handlePay()}
            disabled={!canPay}
          >
            {isSending ? 'Sending...' : 'Pay'}
          </button>
        </div>
      )}

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