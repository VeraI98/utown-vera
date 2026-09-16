import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

import bellIcon from '../../assets/icons main pages/bell-color.svg'
import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import logo from '../../assets/icons main pages/logo.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import connectionIcon from '../../assets/icons profile/Connection Icon.svg'
import foodIcon from '../../assets/icons profile/Food Icon.svg'
import jobsIcon from '../../assets/icons profile/Jobs Icon.svg'
import logoutIcon from '../../assets/icons profile/logout.svg'
import servicesIcon from '../../assets/icons profile/Services Icon.svg'
import smsTrackingIcon from '../../assets/icons profile/sms-tracking.svg'
import starIcon from '../../assets/icons profile/star.svg'
import settingIcon from '../../assets/icons profile/setting-2.svg'

import './ProfilePage.css'

function ProfilePage() {
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()

    navigate('/login', {
      replace: true,
    })
  }

  return (
    <main className="mobile-page profile-page">
      <section className="profile-screen">
        <header className="profile-header">
          <div className="profile-top-bar">
            <img className="profile-logo-image" src={logo} alt="UT" />

            <button
              className="profile-notification-button"
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <img src={bellIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="profile-content">
          <h1 className="profile-greeting">
            Hello, {user.fullName || user.username || 'User'}!
          </h1>

          <section
            className="profile-service-row"
            aria-label="Profile quick actions"
          >
            <Link className="profile-service-card profile-food" to="/food">
              <img src={foodIcon} alt="" aria-hidden="true" />

              <span>Food</span>
            </Link>

            <button
              className="profile-service-card profile-connection"
              type="button"
              aria-label="Connection is not available yet"
            >
              <img src={connectionIcon} alt="" aria-hidden="true" />

              <span>Connection</span>
            </button>

            <button
              className="profile-service-card profile-services"
              type="button"
              aria-label="Services are not available yet"
            >
              <img src={servicesIcon} alt="" aria-hidden="true" />

              <span>Services</span>
            </button>

            <button
              className="profile-service-card profile-jobs"
              type="button"
              aria-label="Jobs are not available yet"
            >
              <img src={jobsIcon} alt="" aria-hidden="true" />

              <span>Jobs</span>
            </button>
          </section>

          <nav className="profile-menu" aria-label="Profile menu">
            <Link className="profile-menu-link" to="/account">
              <img src={smsTrackingIcon} alt="" aria-hidden="true" />

              <span>Account</span>
            </Link>

            <Link className="profile-menu-link" to="/information">
              <img src={settingIcon} alt="" aria-hidden="true" />

              <span>Information</span>
            </Link>

            <Link className="profile-menu-link" to="/favorites">
              <img src={starIcon} alt="" aria-hidden="true" />

              <span>Favorites</span>
            </Link>

            <Link className="profile-menu-link" to="/contact-support">
              <img src={smsTrackingIcon} alt="" aria-hidden="true" />

              <span>Contact Support</span>
            </Link>

            <button
              className="profile-menu-link profile-logout-button"
              type="button"
              onClick={handleLogout}
            >
              <img src={logoutIcon} alt="" aria-hidden="true" />

              <span>Log Out</span>
            </button>
          </nav>
        </div>

        <nav
          className="bottom-nav profile-bottom-nav"
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

export default ProfilePage
