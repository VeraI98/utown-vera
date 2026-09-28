import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import logo from '../../assets/ut-business-logo.svg'
import { useToast } from '../../components/Toast/useToast'
import { useAuth } from '../../hooks/useAuth'
import { logError } from '../../utils/logger'

import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { login, isAuthenticated, user } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    const roles = user?.roles ?? []

    const homePath = roles.includes('RESTAURATEUR')
      ? '/owner'
      : roles.includes('ADMIN')
        ? '/admin'
        : '/'

    return <Navigate to={homePath} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    setError('')

    const normalizedUsername = username.trim()

    if (!normalizedUsername) {
      setError('Enter your username or phone number.')
      return
    }

    if (!password) {
      setError('Enter your password.')
      return
    }

    setIsSubmitting(true)

    try {
      const loggedInUser = await login({
        username: normalizedUsername,
        password,
      })

      const destination = loggedInUser.roles.includes('RESTAURATEUR')
        ? '/owner'
        : loggedInUser.roles.includes('ADMIN')
          ? '/admin'
          : '/'

      navigate(destination, {
        replace: true,
      })
    } catch (loginError) {
      logError('Failed to log in:', loginError)
      showToast('Invalid username or password.', 'error')
      setError('Invalid username or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-content">
        <img className="brand-logo" src={logo} alt="UT" />

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
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
                setPassword(event.target.value)
                setError('')
              }}
              placeholder="Password"
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          {error && (
            <p className="input-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <Link className="forgot-link" to="/forgot-password">
          Forgot your password? Recover it
        </Link>

        <div className="login-footer">
          <p>To register an establishment,</p>
          <p>call the number:</p>
          <p>010 1234 56 78</p>
        </div>

        <Link className="registration-link" to="/register">
          Registration
        </Link>
      </section>
    </main>
  )
}

export default LoginPage
