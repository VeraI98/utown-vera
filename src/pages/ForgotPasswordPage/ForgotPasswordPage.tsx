import HomeLogo from '../../components/HomeLogo/HomeLogo'
import { useState, type FormEvent } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { forgotPassword } from '../../services/authService'

import logo from '../../assets/ut-business-logo.svg'

import '../LoginPage/LoginPage.css'

function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    setError('')

    const normalizedUsername = username.trim()

    if (!normalizedUsername) {
      setError('Enter your username or phone number.')
      return
    }

    setIsSubmitting(true)

    try {
      await forgotPassword({ username: normalizedUsername })

      navigate(
        `/reset-password?username=${encodeURIComponent(normalizedUsername)}`,
      )
    } catch {
      setError('Could not send the recovery code. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-content">
        <HomeLogo className="brand-logo" src={logo} alt="UT" />

        <form className="login-form" onSubmit={handleSubmit}>
          <p className="forgot-password-hint">
            Enter your username or phone number and we will send you a code to
            reset your password.
          </p>

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
            {isSubmitting ? 'Sending...' : 'Send code'}
          </button>
        </form>

        <Link className="forgot-link" to="/login">
          Back to log in
        </Link>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
