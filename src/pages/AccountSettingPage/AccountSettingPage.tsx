import HomeLogo from '../../components/HomeLogo/HomeLogo'
import { Link, useNavigate } from 'react-router-dom'

import arrowIcon from '../../assets/icon account/arrow.svg'
import avatarIcon from '../../assets/icon account/Avatar pic.svg'
import backButtonIcon from '../../assets/icon account/Back Button.svg'
import logoWhite from '../../assets/icon account/logo white.svg'
import bellIcon from '../../assets/icons main pages/bell-color.svg'
import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import { useAuth } from '../../hooks/useAuth'
import { deleteProfile } from '../../services/authService'
import { logError } from '../../utils/logger'

import './AccountSettingPage.css'

function AccountSettingPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleDeleteAccount = async () => {
    const password = window.prompt(
      'Enter your password to delete your account:',
    )

    if (!password) {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.',
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteProfile({
        password,
      })

      logout()

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      logError('AccountSettingPage: failed to delete account', error)

      window.alert(
        'Failed to delete account. Please check your password and try again.',
      )
    }
  }

  return (
    <main className="mobile-page account-page">
      <section className="account-settings-screen">
        <header className="account-header">
          <button
            className="account-header-button account-back-button"
            type="button"
            onClick={() => navigate('/profile')}
            aria-label="Go back to profile"
          >
            <img src={backButtonIcon} alt="" aria-hidden="true" />
          </button>

          <HomeLogo className="account-logo-white" src={logoWhite} alt="UT" />

          <button
            className="account-header-button account-notification-button"
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <img src={bellIcon} alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="account-settings-content">
          <h1 className="account-settings-title">Account Settings</h1>

          <section className="account-user-card">
            <img
              className="account-avatar"
              src={avatarIcon}
              alt=""
              aria-hidden="true"
            />

            <p className="account-user-name">
              {user?.fullName || user?.username || 'Name'}
            </p>
          </section>

          <nav className="account-menu" aria-label="Account settings">
            <Link
              className="account-menu-link"
              to="/account/personal-information"
            >
              <span>Edit Personal Information</span>
              <img src={arrowIcon} alt="" aria-hidden="true" />
            </Link>

            <Link className="account-menu-link" to="/account/password">
              <span>Password</span>
              <img src={arrowIcon} alt="" aria-hidden="true" />
            </Link>
          </nav>

          <button
            className="delete-account-button"
            type="button"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
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

export default AccountSettingPage
