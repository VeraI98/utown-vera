import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import backButtonBlackIcon from '../assets/icon account/Back Button black.svg'
import logoGradient from '../assets/icon account/logo gradient.svg'

import favoritesIcon from '../assets/icons main pages/Favorites.svg'
import homeIcon from '../assets/icons main pages/Home.svg'
import profileIcon from '../assets/icons main pages/Profile.svg'

function AccountPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match.')
      return
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

          <img className="account-logo-gradient" src={logoGradient} alt="UT" />
        </header>

        <div className="account-form-content">
          <h1 className="account-form-title">Password</h1>

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-form-group" htmlFor="new-account-password">
              <span>New Password</span>
              <input
                id="new-account-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="Name"
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
                placeholder="Phone Number"
              />
            </label>

            {error && (
              <p className="account-form-error" role="alert">
                {error}
              </p>
            )}

            <button className="account-save-button" type="submit">
              Save
            </button>
          </form>
        </div>

        <nav className="bottom-nav account-bottom-nav" aria-label="Main navigation">
          <a className="bottom-nav-link" href="/">
            <img src={homeIcon} alt="" aria-hidden="true" />
            <span>Home</span>
          </a>

          <a className="bottom-nav-link" href="/favorites">
            <img src={favoritesIcon} alt="" aria-hidden="true" />
            <span>Favorites</span>
          </a>

          <a className="bottom-nav-link active" href="/profile">
            <img src={profileIcon} alt="" aria-hidden="true" />
            <span>Profile</span>
          </a>
        </nav>
      </section>
    </main>
  )
}

export default AccountPasswordPage