import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './AdminPositionsPage.css'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal/ConfirmDeleteModal'
import TableSkeleton from '../../components/TableSkeleton/TableSkeleton'
import { useToast } from '../../components/Toast/useToast'
import {
  activateDish,
  deactivateDish,
  deleteDish,
  updateDish,
} from '../../services/adminDishService'
import { getDishesByRestaurant } from '../../services/dishService'
import { getEstablishmentById } from '../../services/establishmentService'
import type { DishResponse } from '../../types/restaurant'
import { logError } from '../../utils/logger'

const PAGE_SIZE = 10

const SORTABLE_COLUMNS = [
  'Positions',
  'Priority',
  'Price',
  'Category',
  'Put on hold',
]

function formatPrice(price: number) {
  if (typeof price !== 'number') {
    return '-'
  }

  return price.toLocaleString('en-US')
}

function AdminPositionsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { establishmentId } = useParams()
  const restaurantId = Number(establishmentId)

  const [establishmentName, setEstablishmentName] = useState('')

  const [allDishes, setAllDishes] = useState<DishResponse[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [page, setPage] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  const [priorityDrafts, setPriorityDrafts] = useState<
    Record<number, string>
  >({})

  const [dishToDelete, setDishToDelete] = useState<DishResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadEstablishment = async () => {
      if (!restaurantId) {
        return
      }

      try {
        const establishment = await getEstablishmentById(restaurantId)

        if (isMounted) {
          setEstablishmentName(establishment.title)
        }
      } catch (error) {
        logError('Failed to load establishment:', error)
      }
    }

    void loadEstablishment()

    return () => {
      isMounted = false
    }
  }, [restaurantId])

  useEffect(() => {
    let isMounted = true

    const loadDishes = async () => {
      if (!restaurantId) {
        return
      }

      if (isMounted) {
        setIsLoading(true)
        setLoadError('')
      }

      try {
        const data = await getDishesByRestaurant(restaurantId, 0, 200)

        if (!isMounted) {
          return
        }

        setAllDishes(data.content)
        setPriorityDrafts(
          Object.fromEntries(
            data.content.map((dish) => [dish.id, String(dish.sort ?? 0)]),
          ),
        )
      } catch (error) {
        logError('Failed to load positions:', error)

        if (isMounted) {
          setAllDishes([])
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
  }, [restaurantId, reloadKey])

  const filteredDishes = allDishes.filter((dish) => {
    if (!search) {
      return true
    }

    const term = search.toLowerCase()

    return (
      dish.title.toLowerCase().includes(term) ||
      (dish.description || '').toLowerCase().includes(term)
    )
  })

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDishes.length / PAGE_SIZE),
  )

  const dishes = filteredDishes.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  )

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
    if (selectedIds.length === dishes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(dishes.map((dish) => dish.id))
    }
  }

  const handlePriorityChange = (dishId: number, value: string) => {
    setPriorityDrafts((current) => ({
      ...current,
      [dishId]: value,
    }))
  }

  const handlePriorityBlur = async (dish: DishResponse) => {
    const draft = priorityDrafts[dish.id]
    const parsedSort = Number(draft)

    if (draft === undefined || draft === '' || Number.isNaN(parsedSort)) {
      setPriorityDrafts((current) => ({
        ...current,
        [dish.id]: String(dish.sort ?? 0),
      }))

      return
    }

    if (parsedSort === dish.sort) {
      return
    }

    try {
      await updateDish(dish.id, { sort: parsedSort })
      setReloadKey((current) => current + 1)
    } catch (error) {
      logError('Failed to update priority:', error)
      showToast('Не удалось сохранить изменение', 'error')

      setPriorityDrafts((current) => ({
        ...current,
        [dish.id]: String(dish.sort ?? 0),
      }))
    }
  }

  const handleTogglePutOnHold = async (dish: DishResponse) => {
    try {
      if (dish.isActive) {
        await deactivateDish(dish.id)
      } else {
        await activateDish(dish.id)
      }

      setReloadKey((current) => current + 1)
    } catch (error) {
      logError('Failed to toggle position status:', error)
      showToast('Не удалось сохранить изменение', 'error')
    }
  }

  const handleConfirmDelete = async () => {
    if (!dishToDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteDish(dishToDelete.id)

      setDishToDelete(null)
      setSelectedIds([])
      setReloadKey((current) => current + 1)
      showToast('Позиция удалена', 'success')
    } catch (error) {
      logError('Failed to delete position:', error)

      showToast('Не удалось удалить позицию', 'error')
      setDeleteError('Could not delete the position')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    if (isDeleting) {
      return
    }

    setDishToDelete(null)
    setDeleteError('')
  }

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

  const showEmptyState = !isLoading && !loadError && dishes.length === 0

  return (
    <div className="admin-positions-page">
      <div className="admin-positions-page__top-row">
        <div className="admin-positions-page__title-block">
          <div className="admin-positions-page__title-row">
            <h1>Positions</h1>

            <button
              type="button"
              className="admin-positions-page__title-button"
              onClick={() =>
                navigate(
                  `/admin/establishments/${restaurantId}/positions/add`,
                )
              }
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 8v8M8 12h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Add position
            </button>

            <button
              type="button"
              className="admin-positions-page__title-button"
              onClick={() =>
                navigate(
                  `/admin/establishments/${restaurantId}/categories/add`,
                )
              }
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 8v8M8 12h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Add category
            </button>

            <button
              type="button"
              className="admin-positions-page__title-button"
              onClick={() =>
                navigate(
                  `/admin/establishments/${restaurantId}/categories`,
                )
              }
            >
              Categories
            </button>
          </div>

          <nav className="admin-positions-page__breadcrumb">
            <span
              className="admin-positions-page__breadcrumb-link"
              onClick={() => navigate('/admin/clients')}
            >
              Home
            </span>
            <span> / </span>
            <span
              className="admin-positions-page__breadcrumb-link"
              onClick={() => navigate('/admin/establishments')}
            >
              Users / Establishments
            </span>
            <span> / </span>
            <span>{establishmentName || 'Positions'}</span>
          </nav>
        </div>

        <div className="admin-positions-page__controls">
          <div className="admin-positions-page__search-wrapper">
            <svg
              className="admin-positions-page__search-icon"
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
              className="admin-positions-page__search"
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

          <div className="admin-positions-page__toolbar">
            <button
              className="admin-positions-page__toolbar-button admin-positions-page__toolbar-button--filter"
              type="button"
              disabled
            >
              Filter <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-positions-page__toolbar-button admin-positions-page__toolbar-button--choose-action"
              type="button"
              disabled
            >
              Choose action <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-positions-page__apply-button"
              type="button"
              disabled
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="admin-positions-page__table-wrapper">
        <table className="admin-positions-page__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === dishes.length && dishes.length > 0
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>

              {SORTABLE_COLUMNS.map((column) => (
                <th key={column}>
                  <button
                    className="admin-positions-page__sort-button"
                    type="button"
                    disabled
                  >
                    {column} <span aria-hidden="true">▾</span>
                  </button>
                </th>
              ))}

              <th>Edit</th>
              <th>Description</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {isLoading && <TableSkeleton columns={9} />}

            {!isLoading && loadError && (
              <tr>
                <td colSpan={9} className="admin-positions-page__error-cell">
                  {loadError}
                  <button
                    className="admin-positions-page__retry-button"
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
                <td colSpan={9} className="admin-positions-page__state-cell">
                  No positions found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !loadError &&
              dishes.map((dish) => (
                <tr key={dish.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(dish.id)}
                      onChange={() => toggleSelected(dish.id)}
                      aria-label={`Select ${dish.title}`}
                    />
                  </td>

                  <td>{dish.title}</td>

                  <td>
                    <input
                      className="admin-positions-page__priority-input"
                      type="number"
                      value={priorityDrafts[dish.id] ?? ''}
                      onChange={(event) =>
                        handlePriorityChange(dish.id, event.target.value)
                      }
                      onBlur={() => handlePriorityBlur(dish)}
                    />
                  </td>

                  <td>{formatPrice(dish.price)}</td>

                  <td>{dish.categoryName || '-'}</td>

                  <td>
                    <button
                      type="button"
                      className={`admin-positions-page__switch${
                        !dish.isActive
                          ? ' admin-positions-page__switch--active'
                          : ''
                      }`}
                      onClick={() => handleTogglePutOnHold(dish)}
                      aria-label={`Put ${dish.title} on hold`}
                    >
                      <span />
                    </button>
                  </td>

                  <td>
                    <button
                      className="admin-positions-page__edit-link"
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/establishments/${restaurantId}/positions/${dish.id}/edit`,
                        )
                      }
                    >
                      <span>Edit</span>
                      <span
                        className="admin-positions-page__edit-chevron"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </button>
                  </td>

                  <td className="admin-positions-page__description-cell">
                    {dish.description || '-'}
                  </td>

                  <td>
                    <button
                      className="admin-positions-page__delete-button"
                      type="button"
                      aria-label={`Delete ${dish.title}`}
                      onClick={() => setDishToDelete(dish)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-1 12a2 2 0 01-2 2H10a2 2 0 01-2-2L7 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="admin-positions-page__pagination">
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
                ? 'admin-positions-page__pagination-active'
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

      {dishToDelete && (
        <ConfirmDeleteModal
          title="Delete position?"
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  )
}

export default AdminPositionsPage
