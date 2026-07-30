import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/restaurant page/Back button.svg'
import bellIcon from '../../assets/restaurant page/bell.svg'
import foodLogo from '../../assets/restaurant page/food.svg'
import utLogo from '../../assets/restaurant page/ut.svg'

import type { RestaurantProduct } from '../RestaurantPage/restaurantData'
import { formatPrice } from '../RestaurantPage/restaurantData'

import './OrderPage.css'

export interface OrderItem {
  product: RestaurantProduct
  quantity: number
}

interface OrderPageState {
  orderItems?: OrderItem[]
}

function OrderPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const locationState = location.state as OrderPageState | null

  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    locationState?.orderItems ?? [],
  )

  const [isEditing, setIsEditing] = useState(false)
  const [deleteCandidateId, setDeleteCandidateId] = useState<
    number | null
  >(null)

  const totalQuantity = useMemo(
    () =>
      orderItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    [orderItems],
  )

  const totalPrice = useMemo(
    () =>
      orderItems.reduce(
        (total, item) =>
          total + item.product.price * item.quantity,
        0,
      ),
    [orderItems],
  )

  const increaseQuantity = (productId: number) => {
    setDeleteCandidateId(null)

    setOrderItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    )
  }

  const decreaseQuantity = (productId: number) => {
    const currentItem = orderItems.find(
      (item) => item.product.id === productId,
    )

    if (!currentItem) {
      return
    }

    if (currentItem.quantity === 1) {
      setDeleteCandidateId(productId)
      return
    }

    setDeleteCandidateId(null)

    setOrderItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item,
      ),
    )
  }

  const removeItem = (productId: number) => {
    setOrderItems((currentItems) =>
      currentItems.filter(
        (item) => item.product.id !== productId,
      ),
    )

    setDeleteCandidateId(null)
  }

  const toggleEditing = () => {
    setIsEditing((currentValue) => !currentValue)
    setDeleteCandidateId(null)
  }

  const handleProceedToPayment = () => {
    console.log('Proceed to payment:', orderItems)
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
          <img src={bellIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <section className="order-page__content">
        <h1>Your order</h1>

        {orderItems.length === 0 ? (
          <div className="order-page__empty">
            <p>Your order is empty</p>

            <button
              type="button"
              onClick={() => navigate('/food/restaurant')}
            >
              Return to restaurant
            </button>
          </div>
        ) : (
          <>
            <div className="order-page__items-heading">
              <h2>Items</h2>

              <button
                type="button"
                onClick={toggleEditing}
              >
                {isEditing ? 'Ready' : 'Edit'}
              </button>
            </div>

            <div className="order-page__items">
              {orderItems.map((item) => {
                const isDeleteCandidate =
                  deleteCandidateId === item.product.id

                return (
                  <article
                    className="order-page__item"
                    key={item.product.id}
                  >
                    <div className="order-page__item-content">
                      <h3>{item.product.name}</h3>

                      <p>{item.product.description}</p>

                      <strong>
                        {formatPrice(
                          item.product.price * item.quantity,
                        )}
                      </strong>
                    </div>

                    <div className="order-page__image-wrapper">
                      <img
                        className="order-page__item-image"
                        src={item.product.image}
                        alt={item.product.name}
                      />

                      {isEditing &&
                        (isDeleteCandidate ? (
                          <button
                            className="order-page__delete-button"
                            type="button"
                            onClick={() =>
                              removeItem(item.product.id)
                            }
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                d="M8 7V5.5C8 4.67 8.67 4 9.5 4h5c.83 0 1.5.67 1.5 1.5V7m-10 0h12m-10 0 .7 11.2c.05.78.7 1.4 1.49 1.4h3.62c.79 0 1.44-.62 1.49-1.4L16 7M10 10v6m4-6v6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        ) : (
                          <div className="order-page__quantity">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.product.id,
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  item.product.id,
                                )
                              }
                              aria-label="Increase quantity"
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
          </>
        )}
      </section>

      {orderItems.length > 0 && (
        <div className="order-page__bottom-area">
          <button
            className="order-page__payment-button"
            type="button"
            onClick={handleProceedToPayment}
          >
            <span className="order-page__count">
              {totalQuantity}
            </span>

            <span className="order-page__payment-label">
              Proceed to payment
            </span>

            <span className="order-page__total">
              {formatPrice(totalPrice)}
            </span>
          </button>
        </div>
      )}
    </main>
  )
}

export default OrderPage