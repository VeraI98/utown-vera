import { Link, useNavigate } from 'react-router-dom'

import backButton from '../../assets/icon info/Back Button.svg'
import logoWhite from '../../assets/icon info/logo white.svg'
import bell from '../../assets/icon info/bell.svg'
import arrowAddress from '../../assets/icon info/arrow-address.svg'

import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import './ContactSupportPage.css'

function ContactSupportPage() {
  const navigate = useNavigate()

  const handleTelegramClick = () => {
    window.open('https://t.me/', '_blank', 'noopener,noreferrer')
  }

  const handlePhoneClick = () => {
    window.location.href = 'tel:+820000000000'
  }

  return (
    <main className="mobile-page support-page">
      <section className="support-screen">
        <header className="support-header">
          <button
            className="support-header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={backButton} alt="" aria-hidden="true" />
          </button>

          <img
            className="support-logo"
            src={logoWhite}
            alt="UTOWN"
          />

          <button
            className="support-header-button"
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <img src={bell} alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="support-content">
          <h1 className="support-title">Contact Support</h1>

          <nav className="support-menu" aria-label="Contact support">
            <button
              className="support-menu-item"
              type="button"
              onClick={handleTelegramClick}
            >
              <span>Message on Telegram</span>
              <img src={arrowAddress} alt="" aria-hidden="true" />
            </button>

            <button
              className="support-menu-item"
              type="button"
              onClick={handlePhoneClick}
            >
              <span>Call Mobile Phone</span>
              <img src={arrowAddress} alt="" aria-hidden="true" />
            </button>
          </nav>
        </div>

        <nav
          className="bottom-nav support-bottom-nav"
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

export default ContactSupportPage