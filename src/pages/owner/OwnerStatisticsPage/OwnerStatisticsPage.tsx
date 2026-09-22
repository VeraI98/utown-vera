import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import {
  getRestaurantDailyStats,
  getRestaurantStatsSummary,
} from '../../../services/ownerStatisticsService'
import type {
  DailyStatsResponse,
  StatsSummaryResponse,
} from '../../../services/ownerStatisticsService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import { getErrorMessage } from '../../../utils/getErrorMessage'
import { logError } from '../../../utils/logger'

import './OwnerStatisticsPage.css'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function getMonthGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // JS getDay(): 0 = Sunday. The grid starts on Monday, so shift it.
  const firstWeekday = (firstDay.getDay() + 6) % 7

  const cells: (number | null)[] = []

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  const weeks: (number | null)[][] = []

  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return weeks
}

function formatAmount(amount: number): string {
  const sign = amount < 0 ? '-' : '+'

  return `${sign} ${Math.abs(amount).toLocaleString('en-US')}`
}

function OwnerStatisticsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id

  const today = useMemo(() => new Date(), [])

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const [summary, setSummary] = useState<StatsSummaryResponse | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStatsResponse[]>([])

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

        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const from = toDateKey(year, month, 1)
        const to = toDateKey(year, month, daysInMonth)

        const [summaryData, dailyData] = await Promise.all([
          getRestaurantStatsSummary(restaurant.id, from, to),
          getRestaurantDailyStats(restaurant.id, from, to),
        ])

        if (!isMounted) {
          return
        }

        setSummary(summaryData)
        setDailyStats(dailyData)
      } catch (error) {
        logError('OwnerStatisticsPage: failed to load statistics', error)

        if (isMounted) {
          setSummary(null)
          setDailyStats([])
          setErrorMessage(getErrorMessage(error, 'Failed to load statistics.'))
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
  }, [userId, year, month])

  const weeks = useMemo(() => getMonthGrid(year, month), [year, month])

  const dailyStatsByDay = useMemo(() => {
    const map = new Map<number, DailyStatsResponse>()

    dailyStats.forEach((stat) => {
      const day = Number(stat.day.slice(-2))

      if (!Number.isNaN(day)) {
        map.set(day, stat)
      }
    })

    return map
  }, [dailyStats])

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear((current) => current - 1)
      setMonth(11)
    } else {
      setMonth((current) => current - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      setYear((current) => current + 1)
      setMonth(0)
    } else {
      setMonth((current) => current + 1)
    }
  }

  const isToday = (day: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    navigate(`/owner/statistics/${toDateKey(year, month, day)}`)
  }

  return (
    <main className="owner-statistics-page">
      <div className="owner-statistics-page__content">
        <h1>Order History</h1>

        {isLoading && (
          <p className="owner-statistics-page__message">Loading...</p>
        )}

        {!isLoading && errorMessage && (
          <p className="owner-statistics-page__error" role="alert">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && summary && (
          <div className="owner-statistics-page__summary">
            <div className="owner-statistics-page__summary-row">
              <span className="owner-statistics-page__summary-label">
                Total for {MONTH_LABELS[month]}
              </span>
              <span className="owner-statistics-page__summary-value">
                {formatAmount(summary.revenue)}
              </span>
            </div>

            <div className="owner-statistics-page__summary-row owner-statistics-page__summary-row--muted">
              <span>Orders</span>
              <span>{summary.orders}</span>
            </div>

            <div className="owner-statistics-page__summary-row owner-statistics-page__summary-row--muted">
              <span>Cancelled Orders</span>
              <span>{summary.cancelled}</span>
            </div>
          </div>
        )}
      </div>

      <div className="owner-statistics-page__calendar">
        <div className="owner-statistics-page__calendar-header">
          <button
            type="button"
            className="owner-statistics-page__nav"
            aria-label="Previous month"
            onClick={handlePrevMonth}
          >
            ‹
          </button>

          <span className="owner-statistics-page__calendar-title">
            {MONTH_LABELS[month]} {year}
          </span>

          <button
            type="button"
            className="owner-statistics-page__nav"
            aria-label="Next month"
            onClick={handleNextMonth}
          >
            ›
          </button>
        </div>

        <div className="owner-statistics-page__weekdays">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="owner-statistics-page__grid">
          {weeks.map((week, weekIndex) => (
            <div className="owner-statistics-page__week" key={weekIndex}>
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return (
                    <span
                      key={dayIndex}
                      className="owner-statistics-page__day owner-statistics-page__day--empty"
                    />
                  )
                }

                const hasStats = dailyStatsByDay.has(day)
                const isSelected =
                  day === selectedDay &&
                  year === today.getFullYear() &&
                  month === today.getMonth()

                return (
                  <button
                    key={day}
                    type="button"
                    className={`owner-statistics-page__day${
                      isSelected ? ' owner-statistics-page__day--selected' : ''
                    }${
                      isToday(day) ? ' owner-statistics-page__day--today' : ''
                    }${
                      hasStats ? ' owner-statistics-page__day--has-stats' : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default OwnerStatisticsPage
