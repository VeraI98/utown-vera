import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import bellIcon from '../assets/icons main pages/bell-color.svg'
import favouritesIcon from '../assets/icons main pages/Favourites.svg'
import homeIcon from '../assets/icons main pages/Home.svg'
import logo from '../assets/icons main pages/logo.svg'
import profileIcon from '../assets/icons main pages/Profile.svg'

import connectionIcon from '../assets/icons profile/Connection Icon.svg'
import foodIcon from '../assets/icons profile/Food Icon.svg'
import jobsIcon from '../assets/icons profile/Jobs Icon.svg'
import logoutIcon from '../assets/icons profile/logout.svg'
import servicesIcon from '../assets/icons profile/Services Icon.svg'
import smsTrackingIcon from '../assets/icons profile/sms-tracking.svg'
import starIcon from '../assets/icons profile/star.svg'
import settingIcon from '../assets/icons profile/setting-2.svg'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
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
          <h1 className="profile-greeting">Hello, User!</h1>

          <section
            className="profile-service-row"
            aria-label="Profile quick actions"
          >
            <Link className="profile-service-card profile-food" to="/food">
              <img src={foodIcon} alt="" aria-hidden="true" />
              <span>Food</span>
            </Link>

            <Link
              className="profile-service-card profile-connection"
              to="/mobile-connection"
            >
              <img src={connectionIcon} alt="" aria-hidden="true" />
              <span>Connection</span>
            </Link>

            <Link
              className="profile-service-card profile-services"
              to="/services"
            >
              <img src={servicesIcon} alt="" aria-hidden="true" />
              <span>Services</span>
            </Link>

            <Link className="profile-service-card profile-jobs" to="/jobs">
              <img src={jobsIcon} alt="" aria-hidden="true" />
              <span>Jobs</span>
            </Link>
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

            <Link className="profile-menu-link" to="/favourites">
              <img src={starIcon} alt="" aria-hidden="true" />
              <span>Favourites</span>
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

          <Link className="bottom-nav-link" to="/favourites">
            <img src={favouritesIcon} alt="" aria-hidden="true" />
            <span>Favourites</span>
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