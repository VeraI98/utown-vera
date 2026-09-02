import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createClient } from '../../services/clientService'

import './AdminClientAddPage.css'

function AdminClientAddPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCancel = () => {
    navigate('/admin/clients')
  }

  const handleAdd = async () => {
    if (!name.trim()) {
      setError('Enter a name')

      return
    }

    setIsSaving(true)
    setError('')

    try {
      await createClient({
        fullName: name.trim(),
      })

      navigate('/admin/clients')
    } catch (requestError) {
      console.error(
        'Failed to create client:',
        requestError,
      )

      setError('Could not create the client')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="admin-client-add-page">
      <h1>Add new client</h1>

      <nav className="admin-client-add-page__breadcrumb">
        <span className="admin-client-add-page__breadcrumb-link">
          Home
        </span>
        <span> / </span>
        <span className="admin-client-add-page__breadcrumb-link">
          Users / Clients
        </span>
        <span> / </span>
        <span>Add</span>
      </nav>

      <div className="admin-client-add-page__card">
        <div className="admin-client-add-page__photo-row">
          <label className="admin-client-add-page__photo-upload">
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

          <div className="admin-client-add-page__photo-panel" />
        </div>

        <div className="admin-client-add-page__field">
          <label htmlFor="client-name">Name</label>
          <input
            id="client-name"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="admin-client-add-page__field">
          <label htmlFor="client-phone">Phone number</label>
          <input
            id="client-phone"
            type="tel"
            placeholder="Enter number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </div>

        <div className="admin-client-add-page__field">
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

      {error && (
        <p className="admin-client-add-page__error">{error}</p>
      )}

      <div className="admin-client-add-page__actions">
        <button
          type="button"
          className="admin-client-add-page__cancel-button"
          onClick={handleCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="admin-client-add-page__add-button"
          disabled={isSaving}
          onClick={handleAdd}
        >
          {isSaving ? 'Saving...' : 'Add'}
        </button>
      </div>
    </div>
  )
}

export default AdminClientAddPage
