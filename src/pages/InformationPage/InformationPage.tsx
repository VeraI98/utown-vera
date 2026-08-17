import { Link, useNavigate } from 'react-router-dom'

import backButton from '../../assets/icon info/Back Button.svg'
import logoWhite from '../../assets/icon info/logo white.svg'
import bell from '../../assets/icon info/bell.svg'
import arrowAddress from '../../assets/icon info/arrow-address.svg'

import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import './InformationPage.css'

function InformationPage() {
  const navigate = useNavigate()

  return (
    <main className="mobile-page information-page">
      <section className="information-screen">
        <header className="information-header">
          <button
            className="information-header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img
              src={backButton}
              alt=""
              aria-hidden="true"
            />
          </button>

          <img
            className="information-logo"
            src={logoWhite}
            alt="UTOWN"
          />

          <button
            className="information-header-button"
            type="button"
            onClick={() =>
              navigate('/notifications')
            }
            aria-label="Notifications"
          >
            <img
              src={bell}
              alt=""
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="information-content">
          <h1 className="information-title">
            Information
          </h1>

          <nav
            className="information-menu"
            aria-label="Information menu"
          >
            <Link
              className="information-menu-item"
              to="/information/privacy-policy"
            >
              <span>Privacy Policy</span>

              <img
                src={arrowAddress}
                alt=""
                aria-hidden="true"
              />
            </Link>

            <Link
              className="information-menu-item"
              to="/information/terms-of-use"
            >
              <span>Terms of Use</span>

              <img
                src={arrowAddress}
                alt=""
                aria-hidden="true"
              />
            </Link>

            <Link
              className="information-menu-item"
              to="/information/disclaimer"
            >
              <span>Disclaimer</span>

              <img
                src={arrowAddress}
                alt=""
                aria-hidden="true"
              />
            </Link>
          </nav>
        </div>

        <nav
          className="bottom-nav information-bottom-nav"
          aria-label="Main navigation"
        >
          <Link
            className="bottom-nav-link"
            to="/"
          >
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Home</span>
          </Link>

          <Link
            className="bottom-nav-link"
            to="/favorites"
          >
            <img
              src={favoritesIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Favorites</span>
          </Link>

          <Link
            className="bottom-nav-link active"
            to="/profile"
          >
            <img
              src={profileIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default InformationPage