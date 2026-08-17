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

  const [username, setUsername] =
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

    const normalizedUsername =
      username.trim()

    if (!normalizedUsername) {
      setError(
        'Enter your username or phone number.',
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
        username: normalizedUsername,
        password,
      })

      navigate('/', {
        replace: true,
      })
    } catch {
      setError(
        'Invalid username or password.',
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
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(
                  event.target.value,
                )

                setError('')
              }}
              placeholder="Username or Phone Number"
              autoComplete="username"
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