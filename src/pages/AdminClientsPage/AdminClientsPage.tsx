import {
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import './AdminClientsPage.css'
import eyeIcon from '../../assets/admin-pages/Eye Icon.png'
import ClientCardModal from './ClientCardModal'
import { getClients } from '../../services/clientService'
import type { ClientResponse } from '../../types/client'

const PAGE_SIZE = 10

const SORTABLE_COLUMNS = [
  'Name',
  'Number',
  'City',
  'Address',
  'Orders',
  'Order History',
]

function AdminClientsPage() {
  const navigate = useNavigate()

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [viewedClient, setViewedClient] =
    useState<ClientResponse | null>(null)

  const [clients, setClients] = useState<ClientResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

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
        })

        if (!isMounted) {
          return
        }

        setClients(data.content)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error(
          'Failed to load clients:',
          error,
        )

        if (isMounted) {
          setClients([])
          setTotalPages(0)
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
    if (selectedIds.length === clients.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(clients.map((client) => client.id))
    }
  }

  const openClientCard = (client: ClientResponse) => {
    setViewedClient(client)
  }

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

  const showEmptyState =
    !isLoading && !loadError && clients.length === 0

  return (
    <div className="admin-clients-page">
      <div className="admin-clients-page__top-row">
        <div className="admin-clients-page__title-block">
          <h1>Clients</h1>

          <nav className="admin-clients-page__breadcrumb">
            <span className="admin-clients-page__breadcrumb-link">
              Home
            </span>
            <span> / </span>
            <span className="admin-clients-page__breadcrumb-link">
              Users
            </span>
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

          <div className="admin-clients-page__toolbar">
            <button
              className="admin-clients-page__toolbar-button admin-clients-page__toolbar-button--filter"
              type="button"
              disabled
            >
              Filter <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-clients-page__toolbar-button admin-clients-page__toolbar-button--choose-action"
              type="button"
              disabled
            >
              Choose action <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-clients-page__apply-button"
              type="button"
              disabled
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
                  selectedIds.length === clients.length &&
                  clients.length > 0
                }
                onChange={toggleSelectAll}
                aria-label="Select all"
              />
            </th>

            {SORTABLE_COLUMNS.map((column) => (
              <th key={column}>
                <button
                  className="admin-clients-page__sort-button"
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
                colSpan={8}
                className="admin-clients-page__state-cell"
              >
                Loading...
              </td>
            </tr>
          )}

          {!isLoading && loadError && (
            <tr>
              <td
                colSpan={8}
                className="admin-clients-page__error-cell"
              >
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
              <td
                colSpan={8}
                className="admin-clients-page__state-cell"
              >
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
                    <img
                      src={eyeIcon}
                      alt=""
                      aria-hidden="true"
                      className="admin-clients-page__eye-icon"
                    />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="admin-clients-page__pagination">
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
                  ? 'admin-clients-page__pagination-active'
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
        />
      )}
    </div>
  )
}

export default AdminClientsPage
