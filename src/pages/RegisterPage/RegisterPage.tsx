import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

import arrowLeftIcon from '../../assets/icons/arrow-left.svg'
import phoneIcon from '../../assets/icons/phone.svg'
import lockIcon from '../../assets/icons/lock.svg'

import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  const clearError = () => {
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const normalizedPhone = phoneNumber.replace(/\D/g, '')

    if (!normalizedPhone) {
      setError('Enter your phone number.')
      return
    }

    if (normalizedPhone.length < 8) {
      setError('Enter a valid phone number.')
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

    setIsSubmitting(true)

    try {
      await register({
        username: normalizedPhone,
        password,
        firstName: 'UTown',
        lastName: 'Client',
        role: 'CLIENT',
      })

      navigate('/profile', { replace: true })
    } catch {
      setError('This account already exists.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mobile-page register-page">
      <section className="register-content">
        <button
          className="register-back-button"
          type="button"
          onClick={() => navigate('/login')}
          aria-label="Go back to login"
        >
          <img src={arrowLeftIcon} alt="" aria-hidden="true" />
        </button>

        <h1 className="register-title">User Registration</h1>

        <p className="register-subtitle">
          Register to access all the benefits of the app
        </p>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label className="register-label" htmlFor="register-phone">
              Phone Number
            </label>

            <div className="register-input-wrapper">
              <img
                className="register-input-icon"
                src={phoneIcon}
                alt=""
                aria-hidden="true"
              />

              <input
                id="register-phone"
                name="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(event) => {
                  setPhoneNumber(event.target.value)
                  clearError()
                }}
                placeholder="Enter your phone number without dashes"
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </div>
          </div>

          <div className="register-form-group">
            <label className="register-label" htmlFor="register-password">
              Password
            </label>

            <div className="register-input-wrapper">
              <img
                className="register-input-icon"
                src={lockIcon}
                alt=""
                aria-hidden="true"
              />

              <input
                id="register-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearError()
                }}
                placeholder="Enter your password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="register-form-group register-repeat-group">
            <label
              className="register-label"
              htmlFor="register-repeat-password"
            >
              Repeat Password
            </label>

            <div className="register-input-wrapper">
              <img
                className="register-input-icon"
                src={lockIcon}
                alt=""
                aria-hidden="true"
              />

              <input
                id="register-repeat-password"
                name="repeatPassword"
                type="password"
                value={repeatPassword}
                onChange={(event) => {
                  setRepeatPassword(event.target.value)
                  clearError()
                }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="register-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <Link className="register-login-link" to="/login">
          Already have an account?
        </Link>

        <p className="register-terms">
          By registering, you agree to the Terms of Service and Privacy Policy,
          as well as the Cookie Policy.
        </p>
      </section>
    </main>
  )
}

export default RegisterPage