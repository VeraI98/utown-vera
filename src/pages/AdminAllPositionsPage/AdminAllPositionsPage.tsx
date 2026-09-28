import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import TableSkeleton from '../../components/TableSkeleton/TableSkeleton'
import { getAdminDishes } from '../../services/adminDishService'
import type { DishResponse } from '../../types/restaurant'
import { logError } from '../../utils/logger'

import './AdminAllPositionsPage.css'

const PAGE_SIZE = 10

// This page lists positions (dishes) across every establishment, unlike
// AdminPositionsPage which is scoped to a single :establishmentId. It exists
// so "Positions" can be reached directly from the sidebar instead of only
// through a specific establishment's row. /admin/dishes (getAdminDishes)
// has no restaurantId filter, so it already returns dishes from all
// restaurants, and DishResponse carries restaurantId/restaurantName, which
// is enough to show the establishment and link into its own positions page.
const COLUMNS = ['Position', 'Establishment', 'Price', 'Category']

function formatPrice(price: number) {
  if (typeof price !== 'number') {
    return '-'
  }

  return price.toLocaleString('en-US')
}

function AdminAllPositionsPage() {
  const navigate = useNavigate()

  const [dishes, setDishes] = useState<DishResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadDishes = async () => {
      if (isMounted) {
        setIsLoading(true)
        setLoadError('')
      }

      try {
        const data = await getAdminDishes({
          page,
          size: PAGE_SIZE,
          search: search || undefined,
        })

        if (!isMounted) {
          return
        }

        setDishes(data.content)
        setTotalPages(Math.max(1, data.totalPages))
      } catch (error) {
        logError('Failed to load positions:', error)

        if (isMounted) {
          setDishes([])
          setLoadError('Could not load the positions')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDishes()

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

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

  const showEmptyState = !isLoading && !loadError && dishes.length === 0

  return (
    <div className="admin-all-positions-page">
      <div className="admin-all-positions-page__top-row">
        <div className="admin-all-positions-page__title-block">
          <div className="admin-all-positions-page__title-row">
            <h1>Positions</h1>
          </div>

          <nav className="admin-all-positions-page__breadcrumb">
            <span
              className="admin-all-positions-page__breadcrumb-link"
              onClick={() => navigate('/admin/clients')}
            >
              Home
            </span>
            <span> / </span>
            <span>Positions</span>
          </nav>
        </div>

        <div className="admin-all-positions-page__controls">
          <div className="admin-all-positions-page__search-wrapper">
            <svg
              className="admin-all-positions-page__search-icon"
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
              className="admin-all-positions-page__search"
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
        </div>
      </div>

      <div className="admin-all-positions-page__table-wrapper">
        <table className="admin-all-positions-page__table">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column}>{column}</th>
              ))}
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && <TableSkeleton columns={5} />}

            {!isLoading && loadError && (
              <tr>
                <td
                  colSpan={5}
                  className="admin-all-positions-page__error-cell"
                >
                  {loadError}
                  <button
                    className="admin-all-positions-page__retry-button"
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
                <td
                  colSpan={5}
                  className="admin-all-positions-page__state-cell"
                >
                  No positions found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !loadError &&
              dishes.map((dish) => (
                <tr key={dish.id}>
                  <td>{dish.title}</td>

                  <td>{dish.restaurantName || '-'}</td>

                  <td>{formatPrice(dish.price)}</td>

                  <td>{dish.categoryName || '-'}</td>

                  <td>
                    <button
                      className="admin-all-positions-page__edit-link"
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/establishments/${dish.restaurantId}/positions/${dish.id}/edit`,
                        )
                      }
                    >
                      <span>Edit</span>
                      <span
                        className="admin-all-positions-page__edit-chevron"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="admin-all-positions-page__pagination">
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
                ? 'admin-all-positions-page__pagination-active'
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

export default AdminAllPositionsPage
