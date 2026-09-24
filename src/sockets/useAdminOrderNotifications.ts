import { useEffect } from 'react'

import { useToast } from '../components/Toast/useToast'
import { connectSocket, disconnectSocket, socket } from './socket'

const ORDER_EVENT_NAMES = [
  'orderStatusChanged',
  'order:updated',
  'order:status',
  'orderUpdated',
  'newOrder',
  'order:created',
]

interface OrderEventPayload {
  id?: number
  orderId?: number
  status?: string
  [key: string]: unknown
}

function buildMessage(
  eventName: string,
  payload: OrderEventPayload | undefined,
): string {
  const orderId = payload?.orderId ?? payload?.id

  if (eventName === 'newOrder' || eventName === 'order:created') {
    return orderId ? `Новый заказ №${orderId}` : 'Поступил новый заказ'
  }

  if (payload?.status) {
    return orderId
      ? `Заказ №${orderId}: статус изменён на ${payload.status}`
      : `Статус заказа изменён на ${payload.status}`
  }

  return orderId ? `Заказ №${orderId} обновлён` : 'Заказ обновлён'
}

export function useAdminOrderNotifications() {
  const { showToast } = useToast()

  useEffect(() => {
    connectSocket()

    const handleEvent =
      (eventName: string) => (payload?: OrderEventPayload) => {
        console.log(`[socket] ${eventName}:`, payload)
        showToast(buildMessage(eventName, payload), 'info')
      }

    const handlers = ORDER_EVENT_NAMES.map((eventName) => {
      const handler = handleEvent(eventName)
      socket.on(eventName, handler)
      return { eventName, handler }
    })

    const handleConnectError = (error: Error) => {
      console.error('[socket] connect_error:', error.message)
    }

    socket.on('connect_error', handleConnectError)

    return () => {
      handlers.forEach(({ eventName, handler }) => {
        socket.off(eventName, handler)
      })

      socket.off('connect_error', handleConnectError)
      disconnectSocket()
    }
  }, [showToast])
}
