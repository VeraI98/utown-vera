import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useToast } from '../../components/Toast/useToast'
import {
  getClientById,
  updateClient,
} from '../../services/clientService'
import { logError } from '../../utils/logger'

import './AdminClientEditPage.css'

function AdminClientEditPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { clientId } = useParams()

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

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
        setPhoneNumber(client.username)
        setCity(client.city)
        setAddress(client.address)
      } catch (requestError) {
        logError(
          'Failed to load client:',
          requestError,
        )

        if (isMounted) {
          setError('Could not load the client')
        }
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

  const handleSave = async () => {
    const trimmedName = name.trim()

    if (!clientId || !trimmedName) {
      setError('Enter a name')

      return
    }

    setIsSaving(true)
    setError('')

    try {
      await updateClient(Number(clientId), {
        fullName: trimmedName,
        city: city.trim(),
        address: address.trim(),
      })

      showToast('Изменения сохранены', 'success')
      navigate('/admin/clients')
    } catch (requestError) {
      logError(
        'Failed to update client:',
        requestError,
      )

      showToast('Could not save the changes', 'error')
      setError('Could not save the changes')
    } finally {
      setIsSaving(false)
    }
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
            value={phoneNumber}
            disabled
          />
        </div>

        <div className="admin-client-edit-page__field">
          <label htmlFor="client-city">City</label>
          <input
            id="client-city"
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
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

      {error && (
        <p className="admin-client-edit-page__error">{error}</p>
      )}

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
          disabled={isSaving || isLoading}
          onClick={handleSave}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default AdminClientEditPage
