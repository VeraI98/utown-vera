import HomeLogo from '../../components/HomeLogo/HomeLogo'
import { useState, type FormEvent } from 'react'

import { Link, useSearchParams } from 'react-router-dom'

import { resetPassword } from '../../services/authService'

import logo from '../../assets/ut-business-logo.svg'

import '../LoginPage/LoginPage.css'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()

  const [username, setUsername] = useState(searchParams.get('username') || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    setError('')

    const normalizedUsername = username.trim()
    const normalizedCode = code.trim()

    if (!normalizedUsername) {
      setError('Enter your username or phone number.')
      return
    }

    if (!normalizedCode) {
      setError('Enter the code we sent you.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({
        username: normalizedUsername,
        code: normalizedCode,
        newPassword,
      })

      setIsDone(true)
    } catch {
      setError('Could not reset the password. Check the code and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <main className="login-page">
        <section className="login-content">
          <HomeLogo className="brand-logo" src={logo} alt="UT" />

          <p className="reset-password-success">
            Your password has been reset. You can now log in.
          </p>

          <Link className="reset-password-success-link" to="/login">
            Go to log in
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="login-page">
      <section className="login-content">
        <HomeLogo className="brand-logo" src={logo} alt="UT" />

        <form className="login-form" onSubmit={handleSubmit}>
          <p className="forgot-password-hint">
            Enter the code we sent you and choose a new password.
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

          <div className="form-field">
            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
                setError('')
              }}
              placeholder="Recovery code"
              autoComplete="one-time-code"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="form-field">
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value)
                setError('')
              }}
              placeholder="New password"
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="form-field">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setError('')
              }}
              placeholder="Confirm new password"
              autoComplete="new-password"
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
            {isSubmitting ? 'Saving...' : 'Reset password'}
          </button>
        </form>

        <Link className="forgot-link" to="/forgot-password">
          Didn't get a code? Send again
        </Link>

        <Link className="registration-link" to="/login">
          Back to log in
        </Link>
      </section>
    </main>
  )
}

export default ResetPasswordPage
