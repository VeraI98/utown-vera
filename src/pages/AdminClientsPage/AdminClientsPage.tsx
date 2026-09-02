import {
  useEffect,
  useState,
} from 'react'

import './AdminClientsPage.css'
import eyeIcon from '../../assets/admin-pages/Eye Icon.png'
import ClientCardModal from './ClientCardModal'
import { getClients } from '../../services/clientService'
import type { User } from '../../types/auth'

const PAGE_SIZE = 10

function AdminClientsPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [viewedClient, setViewedClient] = useState<User | null>(null)

  const [clients, setClients] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadClients = async () => {
      if (isMounted) {
        setIsLoading(true)
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
  }, [page, search])

  const handleSearchSubmit = () => {
    setPage(0)
    setSearch(searchInput.trim())
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

  const openClientCard = (client: User) => {
    setViewedClient(client)
  }

  const canGoPrev = page > 0
  const canGoNext = page + 1 < totalPages

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
            >
              Filter <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-clients-page__toolbar-button admin-clients-page__toolbar-button--choose-action"
              type="button"
            >
              Choose action <span aria-hidden="true">▾</span>
            </button>

            <button
              className="admin-clients-page__apply-button"
              type="button"
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

            <th>
              Name <span aria-hidden="true">▾</span>
            </th>

            <th>
              Number <span aria-hidden="true">▾</span>
            </th>

            <th>
              City <span aria-hidden="true">▾</span>
            </th>

            <th>
              Address <span aria-hidden="true">▾</span>
            </th>

            <th>
              Orders <span aria-hidden="true">▾</span>
            </th>

            <th>
              Order History <span aria-hidden="true">▾</span>
            </th>

            <th />
          </tr>
        </thead>

        <tbody>
          {isLoading && clients.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="admin-clients-page__state-cell"
              >
                Loading...
              </td>
            </tr>
          )}

          {!isLoading && clients.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="admin-clients-page__state-cell"
              >
                No clients found.
              </td>
            </tr>
          )}

          {clients.map((client) => (
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

              <td>-</td>

              <td>-</td>

              <td className="admin-clients-page__address">
                -
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
          }}
          onClose={() => setViewedClient(null)}
          onEdit={() => {
            setViewedClient(null)
          }}
        />
      )}
    </div>
  )
}

export default AdminClientsPage
