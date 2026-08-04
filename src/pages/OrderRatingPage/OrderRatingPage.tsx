import {
  useState,
  type CSSProperties,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/waiting order/Back button.svg'
import bellIcon from '../../assets/waiting order/bell.svg'
import foodLogo from '../../assets/waiting order/food.svg'
import ratingStarsIcon from '../../assets/waiting order/Rating stars.svg'
import utLogo from '../../assets/waiting order/ut.svg'

import type { OrderItem } from '../OrderPage/OrderPage'

import './OrderRatingPage.css'

interface OrderRatingPageState {
  orderItems?: OrderItem[]
  orderAmount?: number
  deliveryPrice?: number
  serviceFee?: number
  totalPrice?: number
}

function OrderRatingPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as OrderRatingPageState | null

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const displayedRating = hoveredRating || rating
  const ratingPercent = displayedRating * 20

  const handleReady = () => {
    if (rating === 0) {
      return
    }

    navigate('/food/order/status', {
      replace: true,
      state: {
        ...state,
        rating,
      },
    })
  }

  return (
    <main className="order-rating-page">
      <header className="order-rating-page__header">
        <button
          className="order-rating-page__header-button"
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
          className="order-rating-page__logo"
          aria-label="UT Food"
        >
          <img src={utLogo} alt="UT" />
          <img src={foodLogo} alt="Food" />
        </div>

        <button
          className="order-rating-page__header-button"
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <img
            src={bellIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </header>

      <section className="order-rating-page__content">
        <div className="order-rating-page__message">
          <h1>Order delivered!</h1>

          <p>Please rate the service</p>
        </div>

        <section className="order-rating-page__rating-section">
          <h2>Establishment</h2>

          <div
            className="order-rating-page__rating"
            style={
              {
                '--rating-percent': `${ratingPercent}%`,
                '--rating-mask': `url("${ratingStarsIcon}")`,
              } as CSSProperties
            }
            onMouseLeave={() => setHoveredRating(0)}
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
                  onClick={() => setRating(value)}
                  onMouseEnter={() =>
                    setHoveredRating(value)
                  }
                  onFocus={() =>
                    setHoveredRating(value)
                  }
                  onBlur={() => setHoveredRating(0)}
                  aria-label={`Rate ${value} out of 5`}
                  aria-pressed={rating === value}
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
              : 'Select a rating'}
          </p>
        </section>
      </section>

      <div className="order-rating-page__bottom">
        <button
          type="button"
          onClick={handleReady}
          disabled={rating === 0}
        >
          Ready
        </button>
      </div>
    </main>
  )
}

export default OrderRatingPage