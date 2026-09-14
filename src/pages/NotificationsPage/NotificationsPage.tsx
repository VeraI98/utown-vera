import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import backButton from '../../assets/icon bell/Back Button black.svg'
import logoGradient from '../../assets/icon bell/logo gradient.svg'
import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import {
  getMyNotifications,
  type NotificationResponse,
} from '../../services/notificationService'

import './NotificationsPage.css'

interface NotificationGroup {
  label: string
  notifications: NotificationResponse[]
}

const parseNotificationDate = (notification: NotificationResponse) => {
  const value = `${notification.date}T${notification.time || '00:00:00'}`

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

const getDateKey = (notification: NotificationResponse) => notification.date

const getDateLabel = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  const today = new Date()

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  const notificationStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )

  const difference = todayStart.getTime() - notificationStart.getTime()

  const differenceInDays = Math.round(difference / (1000 * 60 * 60 * 24))

  if (differenceInDays === 0) {
    return 'Today'
  }

  if (differenceInDays === 1) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

const formatTime = (value: string) => {
  if (!value) {
    return ''
  }

  return value.slice(0, 5)
}

function NotificationsPage() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<NotificationResponse[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadNotifications = async () => {
      try {
        const response = await getMyNotifications(0, 100)

        if (!isMounted) {
          return
        }

        setNotifications(response.content ?? [])

        setError('')
      } catch {
        if (!isMounted) {
          return
        }

        setNotifications([])

        setError('Failed to load notifications.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      isMounted = false
    }
  }, [])

  const groups = useMemo<NotificationGroup[]>(() => {
    const sorted = [...notifications].sort((first, second) => {
      const firstDate = parseNotificationDate(first)

      const secondDate = parseNotificationDate(second)

      if (!firstDate || !secondDate) {
        return 0
      }

      return secondDate.getTime() - firstDate.getTime()
    })

    const grouped = new Map<string, NotificationResponse[]>()

    sorted.forEach((notification) => {
      const key = getDateKey(notification)

      const current = grouped.get(key) ?? []

      current.push(notification)

      grouped.set(key, current)
    })

    return Array.from(grouped.entries()).map(([date, groupNotifications]) => ({
      label: getDateLabel(date),
      notifications: groupNotifications,
    }))
  }, [notifications])

  return (
    <main className="mobile-page notifications-page">
      <section className="notifications-screen">
        <header className="notifications-header">
          <button
            className="notifications-back-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={backButton} alt="" aria-hidden="true" />
          </button>

          <img className="notifications-logo" src={logoGradient} alt="UTOWN" />
        </header>

        <div className="notifications-content">
          <h1 className="notifications-title">Notifications</h1>

          {isLoading && (
            <p className="notifications-state" role="status">
              Loading notifications...
            </p>
          )}

          {!isLoading && error && (
            <p
              className="notifications-state notifications-state--error"
              role="alert"
            >
              {error}
            </p>
          )}

          {!isLoading && !error && groups.length === 0 && (
            <div className="notifications-empty">
              <strong>No notifications yet</strong>

              <p>Your notifications will appear here.</p>
            </div>
          )}

          {!isLoading &&
            !error &&
            groups.map((group) => (
              <section className="notifications-group" key={group.label}>
                <p className="notifications-date">{group.label}</p>

                {group.notifications.map((notification) => (
                  <article className="notification-item" key={notification.id}>
                    <div className="notification-message">
                      {notification.title && (
                        <>
                          <strong>{notification.title}</strong>

                          <br />
                        </>
                      )}

                      {notification.text}
                    </div>

                    <time className="notification-time">
                      {formatTime(notification.time)}
                    </time>
                  </article>
                ))}
              </section>
            ))}
        </div>

        <nav
          className="bottom-nav notifications-bottom-nav"
          aria-label="Main navigation"
        >
          <Link className="bottom-nav-link" to="/">
            <img src={homeIcon} alt="" aria-hidden="true" />

            <span>Home</span>
          </Link>

          <Link className="bottom-nav-link" to="/favorites">
            <img src={favoritesIcon} alt="" aria-hidden="true" />

            <span>Favorites</span>
          </Link>

          <Link className="bottom-nav-link" to="/profile">
            <img src={profileIcon} alt="" aria-hidden="true" />

            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default NotificationsPage
