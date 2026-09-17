import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ConfirmDeleteModal from '../../components/ConfirmDeleteModal/ConfirmDeleteModal'
import TableSkeleton from '../../components/TableSkeleton/TableSkeleton'
import { useToast } from '../../components/Toast/useToast'
import {
  blockClient,
  deleteClient,
  getClients,
  unblockClient,
} from '../../services/clientService'
import type { ClientResponse } from '../../types/client'
import { logError } from '../../utils/logger'

import ClientCardModal from './ClientCardModal'

import './AdminClientsPage.css'

const PAGE_SIZE = 10

type SortDirection = 'asc' | 'desc'

// Only fields that really exist on UserResponse can be sorted on the
// backend (Spring Pageable). City/Address/Orders are not real fields of
// the client entity (see note on ClientResponse), so they stay
// unsortable rather than silently sending a "sort" the API will ignore.
type SortableField = 'fullName' | 'username'

interface SortState {
  field: SortableField
  direction: SortDirection
}

const COLUMNS: Array<{ label: string; field?: SortableField }> = [
  { label: 'Name', field: 'fullName' },
  { label: 'Username', field: 'username' },
  { label: 'City' },
  { label: 'Address' },
  { label: 'Orders' },
  { label: 'Order History' },
]

type BulkAction = 'block' | 'unblock' | 'delete'

const BULK_ACTIONS: Array<{ value: BulkAction; label: string }> = [
  { value: 'block', label: 'Block' },
  { value: 'unblock', label: 'Unblock' },
  { value: 'delete', label: 'Delete' },
]

const BULK_ACTION_CONFIRM_TITLE: Record<BulkAction, string> = {
  block: 'Block selected clients?',
  unblock: 'Unblock selected clients?',
  delete: 'Delete selected clients?',
}

const BULK_ACTION_CONFIRM_LABEL: Record<BulkAction, string> = {
  block: 'Block',
  unblock: 'Unblock',
  delete: 'Delete',
}

const BULK_ACTION_PENDING_LABEL: Record<BulkAction, string> = {
  block: 'Blocking...',
  unblock: 'Unblocking...',
  delete: 'Deleting...',
}

function AdminClientsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [viewedClient, setViewedClient] = useState<ClientResponse | null>(null)

  const [clientToDelete, setClientToDelete] = useState<ClientResponse | null>(
    null,
  )

  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [clients, setClients] = useState<ClientResponse[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [loadError, setLoadError] = useState('')

  const [page, setPage] = useState(0)

  const [totalPages, setTotalPages] = useState(0)

  const [searchInput, setSearchInput] = useState('')

  const [search, setSearch] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  const [sort, setSort] = useState<SortState | null>(null)

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [city, setCity] = useState('')
  const filterRef = useRef<HTMLDivElement | null>(null)

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null)
  const actionMenuRef = useRef<HTMLDivElement | null>(null)

  const [bulkActionPending, setBulkActionPending] = useState<BulkAction | null>(
    null,
  )
  const [isBulkRunning, setIsBulkRunning] = useState(false)
  const [bulkError, setBulkError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadClients = async () => {
      if (isMounted) {
        setIsLoading(true)
        setLoadError('')
      }

      try {
        const data = await getClients({
          page,
          size: PAGE_SIZE,
          search: search || undefined,
          city: city || undefined,
          sort: sort ? `${sort.field},${sort.direction}` : undefined,
        })

        if (!isMounted) {
          return
        }

        setClients(data.content)

        setTotalPages(data.totalPages)

        setSelectedIds([])
      } catch (error) {
        logError('Failed to load clients:', error)

        if (isMounted) {
          setClients([])
          setTotalPages(0)
          setSelectedIds([])

          setLoadError('Could not load the clients')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadClients()

    return () => {
      isMounted = false
    }
  }, [page, search, city, sort, reloadKey])

  // Close the Filter / Choose action popovers on outside click.
  useEffect(() => {
    if (!isFilterOpen && !isActionMenuOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        isFilterOpen &&
        filterRef.current &&
        !filterRef.current.contains(target)
      ) {
        setIsFilterOpen(false)
      }

      if (
        isActionMenuOpen &&
        actionMenuRef.current &&
        !actionMenuRef.current.contains(target)
      ) {
        setIsActionMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFilterOpen, isActionMenuOpen])

  const handleSearchSubmit = () => {
    if (isLoading) {
      return
    }

    setPage(0)
    setSelectedIds([])

    setSearch(searchInput.trim())
  }

  const handleRetry = () => {
    if (isLoading) {
      return
    }

    setReloadKey((current) => current + 1)
  }

  const handleSort = (field: SortableField) => {
    if (isLoading) {
      return
    }

    setPage(0)

    setSort((current) => {
      if (current?.field !== field) {
        return { field, direction: 'asc' }
      }

      return {
        field,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      }
    })
  }

  const handleApplyFilter = () => {
    setPage(0)
    setCity(cityInput.trim())
    setIsFilterOpen(false)
  }

  const handleClearFilter = () => {
    setCityInput('')
    setCity('')
    setIsFilterOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!clientToDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteClient(clientToDelete.id)

      setClientToDelete(null)
      setSelectedIds([])
      setReloadKey((current) => current + 1)
      showToast('Клиент удалён', 'success')
    } catch (error) {
      logError('Failed to delete client:', error)

      showToast('Не удалось удалить клиента', 'error')
      setDeleteError('Could not delete the client')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    if (isDeleting) {
      return
    }

    setClientToDelete(null)
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
    if (selectedIds.length === clients.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(clients.map((client) => client.id))
    }
  }

  const openClientCard = (client: ClientResponse) => {
    setViewedClient(client)
  }

  const handleApplyBulkAction = () => {
    if (!selectedAction || selectedIds.length === 0) {
      return
    }

    setBulkActionPending(selectedAction)
    setBulkError('')
  }

  const handleCancelBulkAction = () => {
    if (isBulkRunning) {
      return
    }

    setBulkActionPending(null)
    setBulkError('')
  }

  const handleConfirmBulkAction = async () => {
    if (!bulkActionPending) {
      return
    }

    const action = bulkActionPending
    const idsToProcess = [...selectedIds]

    const actionFn =
      action === 'block'
        ? blockClient
        : action === 'unblock'
          ? unblockClient
          : deleteClient

    setIsBulkRunning(true)
    setBulkError('')

    let successCount = 0
    let failureCount = 0

    // The backend only accepts one id per request (no bulk endpoint), so
    // each selected client is processed independently. A failure on one
    // client should not stop the rest — we report a summary at the end.
    for (const id of idsToProcess) {
      try {
        await actionFn(id)
        successCount += 1
      } catch (error) {
        logError(`Failed to ${action} client ${id}:`, error)
        failureCount += 1
      }
    }

    setIsBulkRunning(false)
    setBulkActionPending(null)
    setSelectedAction(null)
    setSelectedIds([])
    setReloadKey((current) => current + 1)

    const actionLabelRu =
      action === 'block'
        ? 'Заблокировано'
        : action === 'unblock'
          ? 'Разблокировано'
          : 'Удалено'

    if (failureCount === 0) {
      showToast(`${actionLabelRu}: ${successCount}`, 'success')
    } else if (successCount === 0) {
      showToast(
        `Не удалось выполнить действие для ${failureCount} клиент(ов)`,
        'error',
      )
    } else {
      showToast(
        `${actionLabelRu}: ${successCount}, не удалось: ${failureCount}`,
        'error',
      )
    }
  }

  const canGoPrev = page > 0

  const canGoNext = page + 1 < totalPages

  const showEmptyState = !isLoading && !loadError && clients.length === 0

  const hasSelection = selectedIds.length > 0

  return (
    <div className="admin-clients-page">
      <div className="admin-clients-page__top-row">
        <div className="admin-clients-page__title-block">
          <h1>Clients</h1>

          <nav className="admin-clients-page__breadcrumb">
            <span className="admin-clients-page__breadcrumb-link">Home</span>

            <span> / </span>

            <span className="admin-clients-page__breadcrumb-link">Users</span>

            <span> / </span>

            <span>Clients</span>
          </nav>
        </div>

        <div className="admin-clients-page__controls">
          <div className="admin-clients-page__search-wrapper">
            <svg
              className="admin-clients-page__search-icon"
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
              className="admin-clients-page__search"
              type="text"
              placeholder="Search"
              value={searchInput}
              disabled={isLoading}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearchSubmit()
                }
              }}
            />
          </div>

          <div className="admin-clients-page__toolbar">
            <div
              className="admin-clients-page__popover-wrapper"
              ref={filterRef}
            >
              <button
                className="admin-clients-page__toolbar-button admin-clients-page__toolbar-button--filter"
                type="button"
                onClick={() => setIsFilterOpen((open) => !open)}
              >
                {city ? `Filter: ${city}` : 'Filter'}{' '}
                <span aria-hidden="true">▾</span>
              </button>

              {isFilterOpen && (
                <div className="admin-clients-page__popover admin-clients-page__popover--filter">
                  <label
                    className="admin-clients-page__popover-label"
                    htmlFor="admin-clients-city-filter"
                  >
                    City
                  </label>

                  <input
                    id="admin-clients-city-filter"
                    className="admin-clients-page__popover-input"
                    type="text"
                    placeholder="e.g. Seoul"
                    value={cityInput}
                    onChange={(event) => setCityInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleApplyFilter()
                      }
                    }}
                  />

                  <div className="admin-clients-page__popover-actions">
                    <button
                      className="admin-clients-page__popover-secondary-button"
                      type="button"
                      onClick={handleClearFilter}
                    >
                      Clear
                    </button>

                    <button
                      className="admin-clients-page__popover-primary-button"
                      type="button"
                      onClick={handleApplyFilter}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className="admin-clients-page__popover-wrapper"
              ref={actionMenuRef}
            >
              <button
                className="admin-clients-page__toolbar-button admin-clients-page__toolbar-button--choose-action"
                type="button"
                onClick={() => setIsActionMenuOpen((open) => !open)}
              >
                {selectedAction
                  ? BULK_ACTIONS.find((item) => item.value === selectedAction)
                      ?.label
                  : 'Choose action'}{' '}
                <span aria-hidden="true">▾</span>
              </button>

              {isActionMenuOpen && (
                <div className="admin-clients-page__popover admin-clients-page__popover--action">
                  {BULK_ACTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className="admin-clients-page__popover-option"
                      onClick={() => {
                        setSelectedAction(item.value)
                        setIsActionMenuOpen(false)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="admin-clients-page__apply-button"
              type="button"
              disabled={!selectedAction || !hasSelection}
              title={
                !hasSelection
                  ? 'Select at least one client'
                  : !selectedAction
                    ? 'Choose an action first'
                    : undefined
              }
              onClick={handleApplyBulkAction}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <table className="admin-clients-page__table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  selectedIds.length === clients.length && clients.length > 0
                }
                disabled={isLoading || clients.length === 0}
                onChange={toggleSelectAll}
                aria-label="Select all"
              />
            </th>

            {COLUMNS.map((column) => (
              <th key={column.label}>
                <button
                  className="admin-clients-page__sort-button"
                  type="button"
                  disabled={!column.field || isLoading}
                  onClick={
                    column.field ? () => handleSort(column.field!) : undefined
                  }
                >
                  {column.label}{' '}
                  <span aria-hidden="true">
                    {column.field && sort?.field === column.field
                      ? sort.direction === 'asc'
                        ? '▲'
                        : '▼'
                      : '▾'}
                  </span>
                </button>
              </th>
            ))}

            <th />
          </tr>
        </thead>

        <tbody>
          {isLoading && <TableSkeleton columns={8} />}

          {!isLoading && loadError && (
            <tr>
              <td colSpan={8} className="admin-clients-page__error-cell">
                {loadError}

                <button
                  className="admin-clients-page__retry-button"
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
              <td colSpan={8} className="admin-clients-page__state-cell">
                No clients found.
              </td>
            </tr>
          )}

          {!isLoading &&
            !loadError &&
            clients.map((client) => (
              <tr key={client.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(client.id)}
                    onChange={() => toggleSelected(client.id)}
                    aria-label={`Select ${client.fullName}`}
                  />
                </td>

                <td>{client.fullName}</td>

                <td>{client.username || '-'}</td>

                <td>{client.city || '-'}</td>

                <td className="admin-clients-page__address">
                  {client.address || '-'}
                </td>

                {/* No admin endpoint returns another user's order count
                    (only /orders/count/user for the caller themselves),
                    so this stays a placeholder until the backend adds one. */}
                <td>-</td>

                <td>
                  <button
                    type="button"
                    className="admin-clients-page__view-link"
                    onClick={() => openClientCard(client)}
                  >
                    <span>View</span>

                    <span
                      className="admin-clients-page__view-chevron"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </button>
                </td>

                <td>
                  <button
                    className="admin-clients-page__eye-button"
                    type="button"
                    aria-label={`Preview ${client.fullName}`}
                    onClick={() => openClientCard(client)}
                  >
                    <svg
                      className="admin-clients-page__eye-icon"
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

      <div className="admin-clients-page__pagination">
        <button
          type="button"
          disabled={isLoading || !canGoPrev}
          onClick={() => setPage((current) => current - 1)}
        >
          Prev
        </button>

        {Array.from({
          length: totalPages,
        }).map((_, index) => (
          <button
            type="button"
            key={index}
            className={
              index === page
                ? 'admin-clients-page__pagination-active'
                : undefined
            }
            disabled={isLoading}
            onClick={() => setPage(index)}
          >
            {index + 1}
          </button>
        ))}

        <button
          type="button"
          disabled={isLoading || !canGoNext}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>

      {viewedClient && (
        <ClientCardModal
          client={{
            id: viewedClient.id,
            name: viewedClient.fullName,
            number: viewedClient.username,
            city: viewedClient.city,
            address: viewedClient.address,
          }}
          onClose={() => setViewedClient(null)}
          onEdit={() => {
            const clientId = viewedClient.id

            setViewedClient(null)

            navigate(`/admin/clients/${clientId}/edit`)
          }}
          onDelete={() => {
            setClientToDelete(viewedClient)
            setViewedClient(null)
          }}
        />
      )}

      {clientToDelete && (
        <ConfirmDeleteModal
          title="Delete client?"
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {bulkActionPending && (
        <ConfirmDeleteModal
          title={`${BULK_ACTION_CONFIRM_TITLE[bulkActionPending]} (${selectedIds.length})`}
          isDeleting={isBulkRunning}
          error={bulkError}
          confirmLabel={BULK_ACTION_CONFIRM_LABEL[bulkActionPending]}
          pendingLabel={BULK_ACTION_PENDING_LABEL[bulkActionPending]}
          onConfirm={handleConfirmBulkAction}
          onCancel={handleCancelBulkAction}
        />
      )}
    </div>
  )
}

export default AdminClientsPage
