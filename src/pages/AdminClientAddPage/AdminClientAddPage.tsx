import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useToast } from '../../components/Toast/useToast'
import { createClient } from '../../services/clientService'
import { logError } from '../../utils/logger'

import './AdminClientAddPage.css'


const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/

function AdminClientAddPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCancel = () => {
    navigate('/admin/clients')
  }

  const handleAdd = async () => {
    const trimmedName = name.trim()
    const normalizedPhone = phoneNumber.replace(
      /[\s()-]/g,
      '',
    )

    if (!trimmedName) {
      setError('Enter a name')

      return
    }

    if (!PHONE_PATTERN.test(normalizedPhone)) {
      setError(
        'Enter the phone number in international format, for example +821012345678',
      )

      return
    }

    setIsSaving(true)
    setError('')

    try {
      await createClient({
        fullName: trimmedName,
        username: normalizedPhone,
        role: 'CLIENT',
        city: city.trim() || undefined,
        address: address.trim() || undefined,
      })

      showToast('Клиент добавлен', 'success')
      navigate('/admin/clients')
    } catch (requestError) {
      logError(
        'Failed to create client:',
        requestError,
      )

      showToast('Could not create the client', 'error')
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
            placeholder="+821012345678"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </div>

        <div className="admin-client-add-page__field">
          <label htmlFor="client-city">City</label>
          <input
            id="client-city"
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
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
