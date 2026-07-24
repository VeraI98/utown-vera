import {
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { updateProfile } from '../../services/authService'

import arrowAddressIcon from '../../assets/icon account/arrow-address.svg'
import backButtonBlackIcon from '../../assets/icon account/Back Button black.svg'
import logoGradient from '../../assets/icon account/logo gradient.svg'

import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import './PersonalInformationPage.css'

function PersonalInformationPage() {
  const navigate = useNavigate()

  const {
    user,
    updateUser,
  } = useAuth()

  const [name, setName] = useState(
    user?.fullName || '',
  )

  const [phoneNumber, setPhoneNumber] =
    useState(user?.username || '')

  const [address, setAddress] = useState(
    String(user?.defaultAddress ?? ''),
  )

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Enter your name.')
      return
    }

    if (!phoneNumber.trim()) {
      setError('Enter your phone number.')
      return
    }

    try {
      setIsSubmitting(true)

      const updatedUser =
        await updateProfile({
          fullName: name.trim(),
          username: phoneNumber.trim(),
          defaultAddress: address.trim(),
        })

      updateUser(updatedUser)

      navigate('/account')
    } catch {
      setError(
        'Failed to update personal information.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mobile-page account-page">
      <section className="account-form-screen">
        <header className="account-form-header">
          <button
            className="account-form-back-button"
            type="button"
            onClick={() =>
              navigate('/account')
            }
            aria-label="Go back to account settings"
          >
            <img
              src={backButtonBlackIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <img
            className="account-logo-gradient"
            src={logoGradient}
            alt="UT"
          />
        </header>

        <div className="account-form-content">
          <h1 className="account-form-title">
            Personal Information
          </h1>

          <form
            className="account-form"
            onSubmit={handleSubmit}
          >
            <label
              className="account-form-group"
              htmlFor="account-name"
            >
              <span>Your Name</span>

              <input
                id="account-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(
                    event.target.value,
                  )
                  setError('')
                }}
                placeholder="Name"
              />
            </label>

            <label
              className="account-form-group"
              htmlFor="account-phone"
            >
              <span>
                Your Phone Number
              </span>

              <input
                id="account-phone"
                type="tel"
                value={phoneNumber}
                onChange={(event) => {
                  setPhoneNumber(
                    event.target.value,
                  )
                  setError('')
                }}
                placeholder="Phone Number"
              />
            </label>

            <label
              className="account-form-group"
              htmlFor="account-address"
            >
              <span>
                Your Address (for delivery)
              </span>

              <div className="account-address-field">
                <input
                  id="account-address"
                  type="text"
                  value={address}
                  onChange={(event) => {
                    setAddress(
                      event.target.value,
                    )
                    setError('')
                  }}
                  placeholder="Address"
                />

                <img
                  src={arrowAddressIcon}
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </label>

            {error && (
              <p
                className="account-form-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              className="account-save-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : 'Save'}
            </button>
          </form>
        </div>

        <nav
          className="bottom-nav account-bottom-nav"
          aria-label="Main navigation"
        >
          <Link
            className="bottom-nav-link"
            to="/"
          >
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
            />
            <span>Home</span>
          </Link>

          <Link
            className="bottom-nav-link"
            to="/favorites"
          >
            <img
              src={favoritesIcon}
              alt=""
              aria-hidden="true"
            />
            <span>Favorites</span>
          </Link>

          <Link
            className="bottom-nav-link active"
            to="/profile"
          >
            <img
              src={profileIcon}
              alt=""
              aria-hidden="true"
            />
            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default PersonalInformationPage