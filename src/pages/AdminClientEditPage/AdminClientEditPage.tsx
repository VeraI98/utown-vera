import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getClientById } from '../../services/clientService'

import './AdminClientEditPage.css'

function AdminClientEditPage() {
  const navigate = useNavigate()
  const { clientId } = useParams()

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadClient = async () => {
      if (!clientId) {
        return
      }

      try {
        const client = await getClientById(
          Number(clientId),
        )

        if (!isMounted) {
          return
        }

        setName(client.fullName)
      } catch (error) {
        console.error(
          'Failed to load client:',
          error,
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadClient()

    return () => {
      isMounted = false
    }
  }, [clientId])

  const handleCancel = () => {
    navigate('/admin/clients')
  }

  const handleSave = () => {
    console.log('Save client (пока не подключено к API):', {
      clientId,
      name,
      phoneNumber,
      address,
    })
  }

  return (
    <div className="admin-client-edit-page">
      <h1>Edit client</h1>

      <nav className="admin-client-edit-page__breadcrumb">
        <span className="admin-client-edit-page__breadcrumb-link">
          Home
        </span>
        <span> / </span>
        <span className="admin-client-edit-page__breadcrumb-link">
          Users / Clients
        </span>
        <span> / </span>
        <span>Edit</span>
      </nav>

      <div className="admin-client-edit-page__card">
        <div className="admin-client-edit-page__photo-row">
          <label className="admin-client-edit-page__photo-upload">
            <input type="file" accept="image/*" hidden />
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 4H20M12 20V9M8 13L12 9L16 13"
                stroke="#101828"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>

          <div className="admin-client-edit-page__photo-panel" />
        </div>

        <div className="admin-client-edit-page__field">
          <label htmlFor="client-name">Name</label>
          <input
            id="client-name"
            type="text"
            placeholder={isLoading ? 'Loading...' : 'Enter name'}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="admin-client-edit-page__field">
          <label htmlFor="client-phone">Phone number</label>
          <input
            id="client-phone"
            type="tel"
            placeholder="Enter number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </div>

        <div className="admin-client-edit-page__field">
          <label htmlFor="client-address">Delivery address</label>
          <input
            id="client-address"
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>
      </div>

      <div className="admin-client-edit-page__actions">
        <button
          type="button"
          className="admin-client-edit-page__cancel-button"
          onClick={handleCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="admin-client-edit-page__save-button"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default AdminClientEditPage