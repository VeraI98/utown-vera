import type { OrderStatus } from '../types/cart'

// Single source of truth for how an order status is labeled to a
// restaurant owner. Used by both the order table (OwnerOrdersPage) and the
// order detail view (OwnerOrderCardPage), which previously kept their own
// separate label maps and drifted apart (e.g. "Completed"/"Delivered" and
// "Declined"/"Cancelled" for the same status).
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}
