import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import {
  getRestaurantOrdersForDay,
  getRestaurantStatsSummary,
} from '../../../services/ownerStatisticsService'
import type { StatsSummaryResponse } from '../../../services/ownerStatisticsService'
import type { OrderResponse } from '../../../types/cart'
import { logError } from '../../../utils/logger'

import './OwnerStatisticsDayPage.css'

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDateKey(dateKey: string): Date | null {
  const parts = dateKey.split('-').map(Number)

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null
  }

  const [year, month, day] = parts

  return new Date(year, month - 1, day)
}

function formatDayTitle(date: Date): string {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`
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
  }

  return 'Failed to load orders.'
}

function formatAmount(amount: number): string {
  const sign = amount < 0 ? '-' : '+'

  return `${sign} ${Math.abs(amount).toLocaleString('en-US')}`
}

function OwnerStatisticsDayPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { date } = useParams()

  const userId = user?.id

  const selectedDate = useMemo(() => {
    if (!date) {
      return new Date()
    }

    return parseDateKey(date) ?? new Date()
  }, [date])

  const [summary, setSummary] = useState<StatsSummaryResponse | null>(null)
  const [orders, setOrders] = useState<OrderResponse[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true

    const load = async () => {
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

        const dayKey = toDateKey(selectedDate)

        const [summaryData, ordersData] = await Promise.all([
          getRestaurantStatsSummary(restaurant.id, dayKey, dayKey),
          getRestaurantOrdersForDay(restaurant.id, dayKey),
        ])

        if (!isMounted) {
          return
        }

        setSummary(summaryData)
        setOrders(ordersData.content)
      } catch (error) {
        logError('OwnerStatisticsDayPage: failed to load day stats', error)

        if (isMounted) {
          setSummary(null)
          setOrders([])
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [userId, selectedDate])

  const goToDay = (offsetDays: number) => {
    const nextDate = new Date(selectedDate)
    nextDate.setDate(nextDate.getDate() + offsetDays)

    navigate(`/owner/statistics/${toDateKey(nextDate)}`, { replace: true })
  }

  const showEmptyState = !isLoading && !errorMessage && orders.length === 0

  return (
    <main className="owner-statistics-day-page">
      <div className="owner-statistics-day-page__content">
        {isLoading && (
          <p className="owner-statistics-day-page__message">Loading...</p>
        )}

        {!isLoading && errorMessage && (
          <p className="owner-statistics-day-page__error" role="alert">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && summary && (
          <div className="owner-statistics-day-page__summary">
            <div className="owner-statistics-day-page__summary-row">
              <span className="owner-statistics-day-page__summary-label">
                Total for {formatDayTitle(selectedDate)}
              </span>
              <span className="owner-statistics-day-page__summary-value">
                {formatAmount(summary.revenue)}
              </span>
            </div>

            <div className="owner-statistics-day-page__summary-row owner-statistics-day-page__summary-row--muted">
              <span>Orders</span>
              <span>{summary.orders}</span>
            </div>

            <div className="owner-statistics-day-page__summary-row owner-statistics-day-page__summary-row--muted">
              <span>Cancelled orders</span>
              <span>{summary.cancelled}</span>
            </div>
          </div>
        )}
      </div>

      <div className="owner-statistics-day-page__nav-row">
        <button
          type="button"
          className="owner-statistics-day-page__nav"
          aria-label="Previous day"
          onClick={() => goToDay(-1)}
        >
          ‹
        </button>

        <span className="owner-statistics-day-page__nav-title">
          {formatDayTitle(selectedDate)}
        </span>

        <button
          type="button"
          className="owner-statistics-day-page__nav"
          aria-label="Next day"
          onClick={() => goToDay(1)}
        >
          ›
        </button>
      </div>

      <div className="owner-statistics-day-page__orders">
        {showEmptyState && (
          <p className="owner-statistics-day-page__message">
            No orders for this day.
          </p>
        )}

        {!isLoading &&
          !errorMessage &&
          orders.map((order) => (
            <div className="owner-statistics-day-page__order" key={order.id}>
              <span className="owner-statistics-day-page__order-number">
                Order number {order.number}
              </span>
              <span className="owner-statistics-day-page__order-amount">
                {formatAmount(order.totalSum)}
              </span>
            </div>
          ))}
      </div>
    </main>
  )
}

export default OwnerStatisticsDayPage
