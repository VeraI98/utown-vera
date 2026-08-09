import {
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

import logo from '../../assets/ut-business-logo.svg'

import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()

  const {
    login,
    isAuthenticated,
  } = useAuth()

  const [phoneNumber, setPhoneNumber] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault()

    setError('')

    const normalizedPhone =
      phoneNumber.replace(/\D/g, '')

    if (!normalizedPhone) {
      setError(
        'Enter your phone number.',
      )
      return
    }

    if (normalizedPhone.length < 8) {
      setError(
        'Enter a valid phone number.',
      )
      return
    }

    if (!password) {
      setError(
        'Enter your password.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        username: normalizedPhone,
        password,
      })

      navigate('/', {
        replace: true,
      })
    } catch {
      setError(
        'Invalid phone number or password.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-content">
        <img
          className="brand-logo"
          src={logo}
          alt="UT"
        />

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <input
              id="phone-number"
              name="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(event) => {
                setPhoneNumber(
                  event.target.value,
                )

                setError('')
              }}
              placeholder="Phone Number"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="form-field">
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(
                  event.target.value,
                )

                setError('')
              }}
              placeholder="Password"
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <p
              className="input-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Logging in...'
              : 'Log in'}
          </button>
        </form>

        <Link
          className="forgot-link"
          to="/forgot-password"
        >
          Forgot your password? Recover it
        </Link>

        <div className="login-footer">
          <p>
            To register an establishment,
          </p>

          <p>
            call the number:
          </p>

          <p>
            010 1234 56 78
          </p>
        </div>

        <Link
          className="registration-link"
          to="/register"
        >
          Registration
        </Link>
      </section>
    </main>
  )
}

export default LoginPage