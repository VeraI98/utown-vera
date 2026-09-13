import {
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import './AdminEstablishmentsPage.css'
import EstablishmentCardModal from './EstablishmentCardModal'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal/ConfirmDeleteModal'
import {
  deleteEstablishment,
  getEstablishments,
} from '../../services/establishmentService'
import type { EstablishmentResponse } from '../../types/establishment'

const PAGE_SIZE = 10

const SORTABLE_COLUMNS = [
  'Name',
  'Phone number',
  'City',
  'Number of orders',
  'Categories',
  'Positions',
  'Order history',
]

function AdminEstablishmentsPage() {
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [viewedEstablishment, setViewedEstablishment] =
    useState<EstablishmentResponse | null>(null)

  const [establishmentToDelete, setEstablishmentToDelete] =
    useState<EstablishmentResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [establishments, setEstablishments] = useState<
    EstablishmentResponse[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadEstablishments = async () => {
      if (isMounted) {
        setIsLoading(true)
        setLoadError('')
      }

      try {
        const data = await getEstablishments({
          page,
          size: PAGE_SIZE,
          search: search || undefined,
        })

        if (!isMounted) {
          return
        }

        setEstablishments(data.content)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error(
          'Failed to load establishments:',
          error,
        )

        if (isMounted) {
          setEstablishments([])
          setTotalPages(0)
          setLoadError('Could not load the establishments')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadEstablishments()

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

  const handleConfirmDelete = async () => {
    if (!establishmentToDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteEstablishment(establishmentToDelete.id)

      setEstablishmentToDelete(null)
      setSelectedIds([])
      setReloadKey((current) => current + 1)
    } catch (error) {
      console.error(
        'Failed to delete establishment:',
        error,
      )

      setDeleteError('Could not delete the establishment')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    if (isDeleting) {
      return
    }

    setEstablishmentToDelete(null)
    setDeleteError('')
  }

  const toggleSelected = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === establishments.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(
        establishments.map((establishment) => establishment.id),
      )
    }
  }

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

  const showEmptyState =
    !isLoading && !loadError && establishments.length === 0

  return (
    <div className="admin-establishments-page">
      <div className="admin-establishments-page__top-row">
        <div className="admin-establishments-page__title-block">
          <h1>Establishments</h1>

          <nav className="admin-establishments-page__breadcrumb">
            <span className="admin-establishments-page__breadcrumb-link">
              Home
            </span>
            <span> / </span>
            <span className="admin-establishments-page__breadcrumb-link">
              Users
            </span>
            <span> / </span>
            <span>Establishments</span>
          </nav>
        </div>

        <div className="admin-establishments-page__controls">
          <div className="admin-establishments-page__search-wrapper">
            <svg
              className="admin-establishments-page__search-icon"
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
              className="admin-establishments-page__search"
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearchSubmit()
                }
              }}
            />
          </div>

          <div className="admin-establishments-page__toolbar">
            <button
              className="admin-establishments-page__toolbar-button admin-establishments-page__toolbar-button--filter"
              type="button"
              disabled
            >
              Filter <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-establishments-page__toolbar-button admin-establishments-page__toolbar-button--choose-action"
              type="button"
              disabled
            >
              Choose action <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-establishments-page__apply-button"
              type="button"
              disabled
            >
              Apply
            </button>

            <button
              className="admin-establishments-page__add-button"
              type="button"
              onClick={() => navigate('/admin/establishments/add')}
            >
              Add establishment
            </button>
          </div>
        </div>
      </div>

      <table className="admin-establishments-page__table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  selectedIds.length === establishments.length &&
                  establishments.length > 0
                }
                onChange={toggleSelectAll}
                aria-label="Select all"
              />
            </th>

            {SORTABLE_COLUMNS.map((column) => (
              <th key={column}>
                <button
                  className="admin-establishments-page__sort-button"
                  type="button"
                  disabled
                >
                  {column} <span aria-hidden="true">▾</span>
                </button>
              </th>
            ))}

            <th />
          </tr>
        </thead>

        <tbody>
          {isLoading && (
            <tr>
              <td
                colSpan={9}
                className="admin-establishments-page__state-cell"
              >
                Loading...
              </td>
            </tr>
          )}

          {!isLoading && loadError && (
            <tr>
              <td
                colSpan={9}
                className="admin-establishments-page__error-cell"
              >
                {loadError}

                <button
                  className="admin-establishments-page__retry-button"
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
                colSpan={9}
                className="admin-establishments-page__state-cell"
              >
                No establishments found.
              </td>
            </tr>
          )}

          {!isLoading &&
            !loadError &&
            establishments.map((establishment) => (
              <tr key={establishment.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(establishment.id)}
                    onChange={() => toggleSelected(establishment.id)}
                    aria-label={`Select ${establishment.title}`}
                  />
                </td>

                <td>{establishment.title}</td>

                <td>{establishment.phone || '-'}</td>

                <td>{establishment.city || '-'}</td>

                <td>{establishment.ordersCount ?? 0}</td>

                <td>
                  <button
                    className="admin-establishments-page__view-link"
                    type="button"
                    disabled
                  >
                    <span>View</span>
                    <span
                      className="admin-establishments-page__view-chevron"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </button>
                </td>

                <td>
                  <button
                    className="admin-establishments-page__view-link"
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/establishments/${establishment.id}/positions`,
                      )
                    }
                  >
                    <span>View</span>
                    <span
                      className="admin-establishments-page__view-chevron"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </button>
                </td>

                <td>
                  <button
                    className="admin-establishments-page__view-link"
                    type="button"
                    disabled
                  >
                    <span>View</span>
                    <span
                      className="admin-establishments-page__view-chevron"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </button>
                </td>

                <td>
                  <button
                    className="admin-establishments-page__eye-button"
                    type="button"
                    aria-label={`Preview ${establishment.title}`}
                    onClick={() =>
                      setViewedEstablishment(establishment)
                    }
                  >
                    <svg
                      className="admin-establishments-page__eye-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
                        stroke="#101828"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="#101828"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="admin-establishments-page__pagination">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() =>
            setPage((current) => current - 1)
          }
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map(
          (_, index) => (
            <button
              type="button"
              key={index}
              className={
                index === page
                  ? 'admin-establishments-page__pagination-active'
                  : undefined
              }
              onClick={() => setPage(index)}
            >
              {index + 1}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={!canGoNext}
          onClick={() =>
            setPage((current) => current + 1)
          }
        >
          Next
        </button>
      </div>

      {viewedEstablishment && (
        <EstablishmentCardModal
          establishment={viewedEstablishment}
          onClose={() => setViewedEstablishment(null)}
          onDelete={() => {
            setEstablishmentToDelete(viewedEstablishment)
            setViewedEstablishment(null)
          }}
        />
      )}

      {establishmentToDelete && (
        <ConfirmDeleteModal
          title="Delete establishment?"
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  )
}

export default AdminEstablishmentsPage
