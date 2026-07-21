import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { changePassword } from '../services/authService'

import backButtonBlackIcon from '../assets/icon account/Back Button black.svg'
import logoGradient from '../assets/icon account/logo gradient.svg'

import favoritesIcon from '../assets/icons main pages/Favorites.svg'
import homeIcon from '../assets/icons main pages/Home.svg'
import profileIcon from '../assets/icons main pages/Profile.svg'

function AccountPasswordPage() {
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!currentPassword) {
      setError('Enter your current password.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)

      await changePassword({
       oldPassword: currentPassword,
       newPassword: password,
       confirmPassword: repeatPassword,
 })

      navigate('/account')
    } catch {
      setError('Failed to change password. Please check your current password.')
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
            onClick={() => navigate('/account')}
            aria-label="Go back to account settings"
          >
            <img src={backButtonBlackIcon} alt="" aria-hidden="true" />
          </button>

          <img
            className="account-logo-gradient"
            src={logoGradient}
            alt="UT"
          />
        </header>

        <div className="account-form-content">
          <h1 className="account-form-title">Password</h1>

          <form className="account-form" onSubmit={handleSubmit}>
            <label
              className="account-form-group"
              htmlFor="current-account-password"
            >
              <span>Current Password</span>

              <input
                id="current-account-password"
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value)
                  setError('')
                }}
                placeholder="Enter current password"
              />
            </label>

            <label
              className="account-form-group"
              htmlFor="new-account-password"
            >
              <span>New Password</span>

              <input
                id="new-account-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="Enter new password"
              />
            </label>

            <label
              className="account-form-group"
              htmlFor="repeat-account-password"
            >
              <span>Repeat Password</span>

              <input
                id="repeat-account-password"
                type="password"
                value={repeatPassword}
                onChange={(event) => {
                  setRepeatPassword(event.target.value)
                  setError('')
                }}
                placeholder="Repeat new password"
              />
            </label>

            {error && (
              <p className="account-form-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="account-save-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        <nav
          className="bottom-nav account-bottom-nav"
          aria-label="Main navigation"
        >
          <Link className="bottom-nav-link" to="/">
            <img src={homeIcon} alt="" aria-hidden="true" />
            <span>Home</span>
          </Link>

          <Link className="bottom-nav-link" to="/favorites">
            <img src={favoritesIcon} alt="" aria-hidden="true" />
            <span>Favorites</span>
          </Link>

          <Link className="bottom-nav-link active" to="/profile">
            <img src={profileIcon} alt="" aria-hidden="true" />
            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default AccountPasswordPage