import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import deliveredImage from '../../assets/waiting order/60999822 1.svg'
import backButtonIcon from '../../assets/waiting order/Back button.svg'
import bellIcon from '../../assets/waiting order/bell.svg'
import foodLogo from '../../assets/waiting order/food.svg'
import courierImage from '../../assets/waiting order/Illustration.svg'
import preparingImage from '../../assets/waiting order/Item quantity.svg'
import utLogo from '../../assets/waiting order/ut.svg'

import type { OrderItem } from '../OrderPage/OrderPage'

import './OrderStatusPage.css'

interface OrderStatusPageState {
  orderItems?: OrderItem[]
  orderAmount?: number
  deliveryPrice?: number
  serviceFee?: number
  totalPrice?: number
}

interface OrderStatus {
  id: number
  image: string
  imageAlt: string
  title: string
  message: string
}

const STATUS_CHANGE_DELAY = 10_000

const orderStatuses: OrderStatus[] = [
  {
    id: 1,
    image: preparingImage,
    imageAlt: 'Restaurant preparing the order',
    title: 'Your order is being prepared',
    message:
      'The restaurant has confirmed your order!\nIt will be delivered at 00:00',
  },
  {
    id: 2,
    image: courierImage,
    imageAlt: 'Courier delivering the order',
    title: 'The courier is on the way',
    message:
      'The courier has picked up your order!\nIt will be delivered at 00:00',
  },
  {
    id: 3,
    image: deliveredImage,
    imageAlt: 'Order delivered',
    title: 'Order delivered',
    message:
      'Your order has been delivered!\nThank you for choosing UT Food',
  },
]

function OrderStatusPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [statusIndex, setStatusIndex] = useState(0)

  const state = location.state as OrderStatusPageState | null
  const currentStatus = orderStatuses[statusIndex]

  useEffect(() => {
    if (statusIndex >= orderStatuses.length - 1) {
      return
    }

    const statusTimer = window.setTimeout(() => {
      setStatusIndex((currentIndex) => currentIndex + 1)
    }, STATUS_CHANGE_DELAY)

    return () => {
      window.clearTimeout(statusTimer)
    }
  }, [statusIndex])

  const handleHideStatus = () => {
    navigate('/food', {
      replace: true,
    })
  }

  const messageLines = currentStatus.message.split('\n')

  return (
    <main className="order-status-page">
      <section className="order-status-page__hero">
        <header className="order-status-page__header">
          <button
            className="order-status-page__header-button"
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
            className="order-status-page__logo"
            aria-label="UT Food"
          >
            <img src={utLogo} alt="UT" />
            <img src={foodLogo} alt="Food" />
          </div>

          <button
            className="order-status-page__header-button"
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

        <div className="order-status-page__illustration">
          <img
            key={currentStatus.id}
            src={currentStatus.image}
            alt={currentStatus.imageAlt}
          />
        </div>
      </section>

      <section className="order-status-page__sheet">
        <div className="order-status-page__delivery-time">
          <strong>50–60</strong>
          <span>minutes until delivery</span>
        </div>

        <h1>Pizzalio</h1>

        <section
          className="order-status-page__status"
          aria-live="polite"
        >
          <h2>{currentStatus.title}</h2>

          <p>
            {messageLines.map((line, index) => (
              <span key={`${currentStatus.id}-${line}`}>
                {line}

                {index < messageLines.length - 1 && <br />}
              </span>
            ))}
          </p>

          <button
            className="order-status-page__support-button"
            type="button"
            onClick={() => navigate('/contact-support')}
          >
            Contact support
          </button>
        </section>

        <div className="order-status-page__bottom">
          <button
            className="order-status-page__hide-button"
            type="button"
            onClick={handleHideStatus}
          >
            Hide order status
          </button>
        </div>

        <span className="order-status-page__state-data">
          {state?.orderItems?.length ?? 0}
        </span>
      </section>
    </main>
  )
}

export default OrderStatusPage