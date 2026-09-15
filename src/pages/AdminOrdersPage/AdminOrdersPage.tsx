import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './AdminOrdersPage.css'
import { getAdminOrders } from '../../services/adminOrderService'
import type { OrderResponse } from '../../types/cart'

const PAGE_SIZE = 10

const COLUMNS = [
  'Client',
  'Establishment',
  'Rider',
  'Order Number',
  'Amount',
  'Order',
  'Pickup',
  'Delivery',
]

function formatAmount(amount: number) {
  if (typeof amount !== 'number') {
    return '-'
  }

  return amount.toLocaleString('en-US')
}

function formatItems(order: OrderResponse) {
  if (!order.items || order.items.length === 0) {
    return '-'
  }

  return order.items.map((item) => item.dishTitle).join(', ')
}

function AdminOrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      if (isMounted) {
        setIsLoading(true)
        setLoadError('')
      }

      try {
        const data = await getAdminOrders({
          page,
          size: PAGE_SIZE,
          search: search || undefined,
        })

        if (!isMounted) {
          return
        }

        setOrders(data.content)
        setTotalPages(Math.max(1, data.totalPages))
      } catch (error) {
        console.error('Failed to load orders:', error)

        if (isMounted) {
          setOrders([])
          setLoadError('Could not load the orders')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [page, search, reloadKey])

  const handleSearchSubmit = () => {
    setPage(0)
    setSearch(searchInput.trim())
  }

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  const toggleSelected = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(orders.map((order) => order.id))
    }
  }

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

  const showEmptyState = !isLoading && !loadError && orders.length === 0

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-page__top-row">
        <div className="admin-orders-page__title-block">
          <div className="admin-orders-page__title-row">
            <h1>Order History</h1>
          </div>

          <nav className="admin-orders-page__breadcrumb">
            <span
              className="admin-orders-page__breadcrumb-link"
              onClick={() => navigate('/admin/clients')}
            >
              Home
            </span>
            <span> / </span>
            <span
              className="admin-orders-page__breadcrumb-link"
              onClick={() => navigate('/admin/clients')}
            >
              Users
            </span>
            <span> / </span>
            <span>Order History</span>
          </nav>
        </div>

        <div className="admin-orders-page__controls">
          <div className="admin-orders-page__search-wrapper">
            <svg
              className="admin-orders-page__search-icon"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="9"
                r="6.25"
                stroke="#98a2b3"
                strokeWidth="1.5"
              />
              <path
                d="M17 17L13.7 13.7"
                stroke="#98a2b3"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>

            <input
              className="admin-orders-page__search"
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearchSubmit()
                }
              }}
            />
          </div>

          <div className="admin-orders-page__toolbar">
            <button
              className="admin-orders-page__toolbar-button admin-orders-page__toolbar-button--filter"
              type="button"
              disabled
            >
              Filter <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-orders-page__toolbar-button admin-orders-page__toolbar-button--choose-action"
              type="button"
              disabled
            >
              Choose action <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-orders-page__apply-button"
              type="button"
              disabled
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="admin-orders-page__table-wrapper">
        <table className="admin-orders-page__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === orders.length && orders.length > 0
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>

              {COLUMNS.map((column) => (
                <th key={column}>
                  <button
                    className="admin-orders-page__sort-button"
                    type="button"
                    disabled
                  >
                    {column} <span aria-hidden="true">▾</span>
                  </button>
                </th>
              ))}

              <th>Items</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={10} className="admin-orders-page__state-cell">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading && loadError && (
              <tr>
                <td colSpan={10} className="admin-orders-page__error-cell">
                  {loadError}
                  <button
                    className="admin-orders-page__retry-button"
                    type="button"
                    onClick={handleRetry}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            )}

            {showEmptyState && (
              <tr>
                <td colSpan={10} className="admin-orders-page__state-cell">
                  No orders found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !loadError &&
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelected(order.id)}
                      aria-label={`Select order ${order.number}`}
                    />
                  </td>

                  <td>
                    <div className="admin-orders-page__client-name">
                      {order.userName || '-'}
                    </div>
                    <div className="admin-orders-page__client-address">
                      {order.fullAddress || '-'}
                    </div>
                  </td>

                  <td>
                    <div className="admin-orders-page__establishment-name">
                      {order.restaurantName || '-'}
                    </div>
                  </td>

                  <td>
                    <div className="admin-orders-page__rider-transport">
                      -
                    </div>
                  </td>

                  <td>No. {order.number}</td>

                  <td>{formatAmount(order.totalSum)}</td>

                  <td>{order.time || '-'}</td>

                  <td>{order.time || '-'}</td>

                  <td>{order.deliveryTime || '-'}</td>

                  <td className="admin-orders-page__description-cell">
                    {formatItems(order)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="admin-orders-page__pagination">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => setPage((current) => current - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            type="button"
            key={index}
            className={
              index === page
                ? 'admin-orders-page__pagination-active'
                : undefined
            }
            onClick={() => setPage(index)}
          >
            {index + 1}
          </button>
        ))}

        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AdminOrdersPage
