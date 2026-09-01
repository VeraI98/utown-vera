import { useState } from 'react'

import './AdminClientsPage.css'
import eyeIcon from '../../assets/admin-pages/Eye Icon.png'
import ClientCardModal from './ClientCardModal'

interface MockClientRow {
  id: number
  name: string
  number: string
  city: string
  address: string
  orders: number
}

const MOCK_CLIENTS: MockClientRow[] = [
  {
    id: 1,
    name: 'Client 1',
    number: '010 1234 56 78',
    city: 'Seoul',
    address: '12 Mugeo-ro, Jung-gu, Seoul, Jeong-o Building',
    orders: 14,
  },
  {
    id: 2,
    name: 'Client 2',
    number: '010 1234 56 78',
    city: 'Seoul',
    address: '12 Mugeo-ro, Jung-gu, Seoul, Jeong-o Building',
    orders: 14,
  },
  {
    id: 3,
    name: 'Client 3',
    number: '010 1234 56 78',
    city: 'Seoul',
    address: '12 Mugeo-ro, Jung-gu, Seoul, Jeong-o Building',
    orders: 14,
  },
  {
    id: 4,
    name: 'Client 4',
    number: '010 1234 56 78',
    city: 'Seoul',
    address: '12 Mugeo-ro, Jung-gu, Seoul, Jeong-o Building',
    orders: 14,
  },
  {
    id: 5,
    name: 'Client 5',
    number: '010 1234 56 78',
    city: 'Seoul',
    address: '12 Mugeo-ro, Jung-gu, Seoul, Jeong-o Building',
    orders: 14,
  },
  {
    id: 6,
    name: 'Client 6',
    number: '010 1234 56 78',
    city: 'Seoul',
    address: '12 Mugeo-ro, Jung-gu, Seoul, Jeong-o Building',
    orders: 14,
  },
]

function AdminClientsPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [viewedClient, setViewedClient] = useState<MockClientRow | null>(null)

  const toggleSelected = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === MOCK_CLIENTS.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(MOCK_CLIENTS.map((client) => client.id))
    }
  }

  const openClientCard = (client: MockClientRow) => {
    setViewedClient(client)
  }

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
                  selectedIds.length === MOCK_CLIENTS.length &&
                  MOCK_CLIENTS.length > 0
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
          {MOCK_CLIENTS.map((client) => (
            <tr key={client.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(client.id)}
                  onChange={() => toggleSelected(client.id)}
                  aria-label={`Select ${client.name}`}
                />
              </td>

              <td>{client.name}</td>

              <td>{client.number}</td>

              <td>{client.city}</td>

              <td className="admin-clients-page__address">
                {client.address}
              </td>

              <td>{client.orders}</td>

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
                  aria-label={`Preview ${client.name}`}
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
        <button type="button">Prev</button>
        <button
          type="button"
          className="admin-clients-page__pagination-active"
        >
          1
        </button>
        <button type="button">2</button>
        <button type="button">3</button>
        <button type="button">Next</button>
      </div>

      {viewedClient && (
        <ClientCardModal
          client={viewedClient}
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