import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './AdminCategoriesPage.css'
import EditCategoryModal from './EditCategoryModal'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal/ConfirmDeleteModal'
import {
  deleteCategory,
  getCategoriesByRestaurant,
  updateCategory,
} from '../../services/categoryService'
import { getEstablishmentById } from '../../services/establishmentService'
import type { DishCategoryResponse } from '../../types/restaurant'

const PAGE_SIZE = 10

function AdminCategoriesPage() {
  const navigate = useNavigate()
  const { establishmentId } = useParams()
  const restaurantId = Number(establishmentId)

  const [establishmentName, setEstablishmentName] = useState('')

  const [allCategories, setAllCategories] = useState<DishCategoryResponse[]>(
    [],
  )
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

  const [editingCategory, setEditingCategory] =
    useState<DishCategoryResponse | null>(null)
  const [categoryToDelete, setCategoryToDelete] =
    useState<DishCategoryResponse | null>(null)
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
        console.error('Failed to load establishment:', error)
      }
    }

    void loadEstablishment()

    return () => {
      isMounted = false
    }
  }, [restaurantId])

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      if (!restaurantId) {
        return
      }

      if (isMounted) {
        setIsLoading(true)
        setLoadError('')
      }

      try {
        const data = await getCategoriesByRestaurant(restaurantId, 0, 200)

        if (!isMounted) {
          return
        }

        setAllCategories(data.content)
        setPriorityDrafts(
          Object.fromEntries(
            data.content.map((category) => [
              category.id,
              String(category.sort ?? 0),
            ]),
          ),
        )
      } catch (error) {
        console.error('Failed to load categories:', error)

        if (isMounted) {
          setAllCategories([])
          setLoadError('Could not load the categories')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [restaurantId, reloadKey])

  const filteredCategories = allCategories.filter((category) => {
    if (!search) {
      return true
    }

    return category.name.toLowerCase().includes(search.toLowerCase())
  })

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / PAGE_SIZE),
  )

  const categories = filteredCategories.slice(
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
    if (selectedIds.length === categories.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(categories.map((category) => category.id))
    }
  }

  const handlePriorityChange = (categoryId: number, value: string) => {
    setPriorityDrafts((current) => ({
      ...current,
      [categoryId]: value,
    }))
  }

  const handlePriorityBlur = async (category: DishCategoryResponse) => {
    const draft = priorityDrafts[category.id]
    const parsedSort = Number(draft)

    if (draft === undefined || draft === '' || Number.isNaN(parsedSort)) {
      setPriorityDrafts((current) => ({
        ...current,
        [category.id]: String(category.sort ?? 0),
      }))

      return
    }

    if (parsedSort === category.sort) {
      return
    }

    try {
      await updateCategory(category.id, { sort: parsedSort })
      setReloadKey((current) => current + 1)
    } catch (error) {
      console.error('Failed to update priority:', error)

      setPriorityDrafts((current) => ({
        ...current,
        [category.id]: String(category.sort ?? 0),
      }))
    }
  }

  const handleEditCategory = async (name: string) => {
    if (!editingCategory) {
      return
    }

    await updateCategory(editingCategory.id, { name })

    setEditingCategory(null)
    setReloadKey((current) => current + 1)
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteCategory(categoryToDelete.id)

      setCategoryToDelete(null)
      setSelectedIds([])
      setReloadKey((current) => current + 1)
    } catch (error) {
      console.error('Failed to delete category:', error)

      setDeleteError('Could not delete the category')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    if (isDeleting) {
      return
    }

    setCategoryToDelete(null)
    setDeleteError('')
  }

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

  const showEmptyState = !isLoading && !loadError && categories.length === 0

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-page__top-row">
        <div className="admin-categories-page__title-block">
          <div className="admin-categories-page__title-row">
            <h1>Categories</h1>

            <button
              type="button"
              className="admin-categories-page__title-button"
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
              className="admin-categories-page__title-button"
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
          </div>

          <nav className="admin-categories-page__breadcrumb">
            <span
              className="admin-categories-page__breadcrumb-link"
              onClick={() => navigate('/admin/clients')}
            >
              Home
            </span>
            <span> / </span>
            <span
              className="admin-categories-page__breadcrumb-link"
              onClick={() => navigate('/admin/establishments')}
            >
              Users / Establishments
            </span>
            <span> / </span>
            <span
              className="admin-categories-page__breadcrumb-link"
              onClick={() =>
                navigate(`/admin/establishments/${restaurantId}/positions`)
              }
            >
              Positions
            </span>
          </nav>
        </div>

        <div className="admin-categories-page__controls">
          <div className="admin-categories-page__search-wrapper">
            <svg
              className="admin-categories-page__search-icon"
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
              className="admin-categories-page__search"
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

          <div className="admin-categories-page__toolbar">
            <button
              className="admin-categories-page__toolbar-button admin-categories-page__toolbar-button--filter"
              type="button"
              disabled
            >
              Filter <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-categories-page__toolbar-button admin-categories-page__toolbar-button--choose-action"
              type="button"
              disabled
            >
              Choose action <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-categories-page__apply-button"
              type="button"
              disabled
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="admin-categories-page__table-wrapper">
        <table className="admin-categories-page__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === categories.length &&
                    categories.length > 0
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>

              <th>
                <button
                  className="admin-categories-page__sort-button"
                  type="button"
                  disabled
                >
                  Categories <span aria-hidden="true">▾</span>
                </button>
              </th>

              <th>
                <button
                  className="admin-categories-page__sort-button"
                  type="button"
                  disabled
                >
                  Priority <span aria-hidden="true">▾</span>
                </button>
              </th>

              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="admin-categories-page__state-cell">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading && loadError && (
              <tr>
                <td colSpan={4} className="admin-categories-page__error-cell">
                  {loadError}
                  <button
                    className="admin-categories-page__retry-button"
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
                <td colSpan={4} className="admin-categories-page__state-cell">
                  No categories found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !loadError &&
              categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(category.id)}
                      onChange={() => toggleSelected(category.id)}
                      aria-label={`Select ${category.name}`}
                    />
                  </td>

                  <td>{category.name}</td>

                  <td>
                    <input
                      className="admin-categories-page__priority-input"
                      type="number"
                      value={priorityDrafts[category.id] ?? ''}
                      onChange={(event) =>
                        handlePriorityChange(category.id, event.target.value)
                      }
                      onBlur={() => handlePriorityBlur(category)}
                    />
                  </td>

                  <td>
                    <button
                      className="admin-categories-page__edit-link"
                      type="button"
                      onClick={() => setEditingCategory(category)}
                    >
                      <span>Edit</span>
                      <span
                        className="admin-categories-page__edit-chevron"
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

      <div className="admin-categories-page__pagination">
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
                ? 'admin-categories-page__pagination-active'
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

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onSave={handleEditCategory}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      {categoryToDelete && (
        <ConfirmDeleteModal
          title="Delete category?"
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  )
}

export default AdminCategoriesPage
