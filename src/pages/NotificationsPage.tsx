import { Link, useNavigate } from 'react-router-dom'

import backButton from '../assets/icon bell/Back Button black.svg'
import logoGradient from '../assets/icon bell/logo gradient.svg'

import favouritesIcon from '../assets/icons main pages/Favourites.svg'
import homeIcon from '../assets/icons main pages/Home.svg'
import profileIcon from '../assets/icons main pages/Profile.svg'

function NotificationsPage() {
  const navigate = useNavigate()

  return (
    <main className="mobile-page notifications-page">
      <section className="notifications-screen">
        <header className="notifications-header">
          <button
            className="notifications-back-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={backButton} alt="" aria-hidden="true" />
          </button>

          <img
            className="notifications-logo"
            src={logoGradient}
            alt="UTOWN"
          />
        </header>

        <div className="notifications-content">
          <h1 className="notifications-title">Notifications</h1>

          <section className="notifications-group">
            <p className="notifications-date">Yesterday</p>

            <article className="notification-item">
              <div className="notification-message">
                Message notification about an ongoing event at this moment.
              </div>

              <time className="notification-time">12:30</time>
            </article>

            <article className="notification-item">
              <div className="notification-message">
                <strong>UT-eda:</strong>
                <br />
                The courier has picked up your order and is on the way to you.
              </div>

              <time className="notification-time">14:30</time>
            </article>
          </section>

          <section className="notifications-group">
            <p className="notifications-date">Today</p>

            <article className="notification-item">
              <div className="notification-message">
                Message notification about an ongoing event at this moment.
              </div>

              <time className="notification-time">12:30</time>
            </article>

            <article className="notification-item">
              <div className="notification-message">
                <strong>UT-eda:</strong>
                <br />
                The courier has picked up your order and is on the way to you.
              </div>

              <time className="notification-time">14:30</time>
            </article>
          </section>
        </div>

        <nav
          className="bottom-nav notifications-bottom-nav"
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

          <Link className="bottom-nav-link" to="/profile">
            <img src={profileIcon} alt="" aria-hidden="true" />
            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default NotificationsPage