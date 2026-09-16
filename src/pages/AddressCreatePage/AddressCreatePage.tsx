import axios from 'axios'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/order/Back button.svg'
import foodLogo from '../../assets/order/food.svg'
import utLogo from '../../assets/order/ut.svg'
import { createAddress } from '../../services/addressService'
import type { AddressResponse, CreateAddressRequest } from '../../types/address'
import { logError } from '../../utils/logger'

import './AddressCreatePage.css'

interface AddressFormState {
  area: string
  city: string
  details: string
  fullAddress: string
  latitude: string
  longitude: string
  postcode: string
  state: string
  street: string
  typeAddress: string
  intercomCode: string
}

interface AddressCreatePageState {
  returnTo?: string
  createdAddress?: AddressResponse
}

const initialFormState: AddressFormState = {
  area: '',
  city: '',
  details: '',
  fullAddress: '',
  latitude: '0',
  longitude: '0',
  postcode: '',
  state: '',
  street: '',
  typeAddress: '0',
  intercomCode: '',
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message
    }

    if (typeof responseData === 'string') {
      return responseData
    }
  }

  return 'Failed to save address. Please try again.'
}

function AddressCreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as AddressCreatePageState | null

  const [form, setForm] = useState<AddressFormState>(initialFormState)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))

    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSaving) {
      return
    }

    const latitude = Number(form.latitude)
    const longitude = Number(form.longitude)
    const typeAddress = Number(form.typeAddress)

    if (
      !form.fullAddress.trim() ||
      !form.city.trim() ||
      !form.street.trim() ||
      !form.postcode.trim()
    ) {
      setErrorMessage('Please fill in the required address fields.')
      return
    }

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      Number.isNaN(typeAddress)
    ) {
      setErrorMessage(
        'Latitude, longitude and address type must be valid numbers.',
      )
      return
    }

    const request: CreateAddressRequest = {
      area: form.area.trim(),
      city: form.city.trim(),
      details: form.details.trim(),
      fullAddress: form.fullAddress.trim(),
      latitude,
      longitude,
      postcode: form.postcode.trim(),
      state: form.state.trim(),
      street: form.street.trim(),
      typeAddress,
      intercomCode: form.intercomCode.trim(),
    }

    try {
      setIsSaving(true)
      setErrorMessage('')

      const createdAddress = await createAddress(request)

      const returnTo = locationState?.returnTo ?? '/account'

      if (returnTo === '/food/order/payment') {
        navigate('/food/order/payment', {
          replace: true,
          state: {
            ...(locationState ?? {}),
            createdAddress,
          },
        })

        return
      }

      navigate(returnTo, {
        replace: true,
      })
    } catch (error) {
      logError('AddressCreatePage: failed to create address', error)

      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="address-create-page">
      <header className="address-create-page__header">
        <button
          className="address-create-page__header-button"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          disabled={isSaving}
        >
          <img src={backButtonIcon} alt="" aria-hidden="true" />
        </button>

        <div className="address-create-page__logo" aria-label="UT Food">
          <img src={utLogo} alt="UT" />
          <img src={foodLogo} alt="Food" />
        </div>

        <div />
      </header>

      <section className="address-create-page__content">
        <h1>Add delivery address</h1>

        <p className="address-create-page__intro">
          Enter the address details that will be used for delivery.
        </p>

        {errorMessage && (
          <div className="address-create-page__error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="address-create-page__form" onSubmit={handleSubmit}>
          <label>
            <span>Full address *</span>
            <input
              name="fullAddress"
              value={form.fullAddress}
              onChange={handleChange}
              placeholder="Full delivery address"
              disabled={isSaving}
              required
            />
          </label>

          <label>
            <span>Street *</span>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Street"
              disabled={isSaving}
              required
            />
          </label>

          <div className="address-create-page__row">
            <label>
              <span>City *</span>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                disabled={isSaving}
                required
              />
            </label>

            <label>
              <span>Postcode *</span>
              <input
                name="postcode"
                value={form.postcode}
                onChange={handleChange}
                placeholder="Postcode"
                disabled={isSaving}
                required
              />
            </label>
          </div>

          <div className="address-create-page__row">
            <label>
              <span>State / Province</span>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                disabled={isSaving}
              />
            </label>

            <label>
              <span>Area</span>
              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="Area"
                disabled={isSaving}
              />
            </label>
          </div>

          <div className="address-create-page__row">
            <label>
              <span>Latitude</span>
              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleChange}
                disabled={isSaving}
              />
            </label>

            <label>
              <span>Longitude</span>
              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleChange}
                disabled={isSaving}
              />
            </label>
          </div>

          <label>
            <span>Address type</span>
            <input
              name="typeAddress"
              type="number"
              value={form.typeAddress}
              onChange={handleChange}
              disabled={isSaving}
            />
          </label>

          <label>
            <span>Intercom code</span>
            <input
              name="intercomCode"
              value={form.intercomCode}
              onChange={handleChange}
              placeholder="Optional"
              disabled={isSaving}
            />
          </label>

          <label>
            <span>Details</span>
            <textarea
              name="details"
              value={form.details}
              onChange={handleChange}
              placeholder="Apartment, floor, entrance, etc."
              rows={3}
              disabled={isSaving}
            />
          </label>

          <button
            className="address-create-page__save-button"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save delivery address'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AddressCreatePage
