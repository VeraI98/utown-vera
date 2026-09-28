import { useEffect, useMemo, useState } from 'react'

import {
  getMyNotifications,
  type NotificationResponse,
} from '../../services/notificationService'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { logError } from '../../utils/logger'

import './OwnerNotificationsPage.css'

function getNotificationDate(notification: NotificationResponse): Date | null {
  if (!notification.date) {
    return null
  }

  const dateTimeValue = notification.time
    ? `${notification.date}T${notification.time}`
    : notification.date

  const date = new Date(dateTimeValue)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function isToday(notification: NotificationResponse): boolean {
  const date = getNotificationDate(notification)

  if (!date) {
    return false
  }

  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function isYesterday(notification: NotificationResponse): boolean {
  const date = getNotificationDate(notification)

  if (!date) {
    return false
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  )
}

interface NotificationGroupProps {
  title: string
  notifications: NotificationResponse[]
}

function NotificationGroup({ title, notifications }: NotificationGroupProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <section className="owner-notifications-page__group">
      <h2>{title}</h2>

      <div className="owner-notifications-page__list">
        {notifications.map((notification) => (
          <article
            className="owner-notifications-page__notification"
            key={notification.id}
          >
            <div className="owner-notifications-page__message">
              {notification.text || notification.title || 'Notification'}
            </div>

            <time>{notification.time}</time>
          </article>
        ))}
      </div>
    </section>
  )
}

function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    getMyNotifications(0, 100)
      .then((response) => {
        if (!isActive) {
          return
        }

        setNotifications(response.content ?? [])
        setErrorMessage('')
      })
      .catch((error: unknown) => {
        logError('OwnerNotificationsPage: failed to load notifications', error)

        if (!isActive) {
          return
        }

        setNotifications([])
        setErrorMessage(getErrorMessage(error, 'Failed to load notifications.'))
      })
      .finally(() => {
        if (!isActive) {
          return
        }

        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort((firstNotification, secondNotification) => {
        const firstDate = getNotificationDate(firstNotification)
        const secondDate = getNotificationDate(secondNotification)

        return (secondDate?.getTime() ?? 0) - (firstDate?.getTime() ?? 0)
      }),
    [notifications],
  )

  const todayNotifications = sortedNotifications.filter((notification) =>
    isToday(notification),
  )

  const yesterdayNotifications = sortedNotifications.filter((notification) =>
    isYesterday(notification),
  )

  const olderNotifications = sortedNotifications.filter(
    (notification) => !isToday(notification) && !isYesterday(notification),
  )

  return (
    <div className="owner-notifications-page">
      <div className="owner-notifications-page__content">
        <h1>Notifications</h1>

        {isLoading && (
          <p className="owner-notifications-page__loading">
            Loading notifications...
          </p>
        )}

        {!isLoading && errorMessage && (
          <p className="owner-notifications-page__error" role="alert">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && notifications.length === 0 && (
          <p className="owner-notifications-page__empty">No notifications.</p>
        )}

        {!isLoading && !errorMessage && (
          <>
            <NotificationGroup
              title="Today"
              notifications={todayNotifications}
            />

            <NotificationGroup
              title="Yesterday"
              notifications={yesterdayNotifications}
            />

            <NotificationGroup
              title="Earlier"
              notifications={olderNotifications}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default OwnerNotificationsPage
