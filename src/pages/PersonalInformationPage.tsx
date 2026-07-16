import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import arrowAddressIcon from '../assets/icon account/arrow-address.svg'
import backButtonBlackIcon from '../assets/icon account/Back Button black.svg'
import logoGradient from '../assets/icon account/logo gradient.svg'

import favouritesIcon from '../assets/icons main pages/Favourites.svg'
import homeIcon from '../assets/icons main pages/Home.svg'
import profileIcon from '../assets/icons main pages/Profile.svg'

function PersonalInformationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [name, setName] = useState(user?.fullName || '')
  const [phoneNumber, setPhoneNumber] = useState(user?.username || '')
  const [address, setAddress] = useState(user?.defaultAddress || '')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
          <h1 className="account-form-title">Personal Information</h1>

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-form-group" htmlFor="account-name">
              <span>Your Name</span>
              <input
                id="account-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
              />
            </label>

            <label className="account-form-group" htmlFor="account-phone">
              <span>Your Phone Number</span>
              <input
                id="account-phone"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="Phone Number"
              />
            </label>

            <label className="account-form-group" htmlFor="account-address">
              <span>Your Address (for delivery)</span>

              <div className="account-address-field">
                <input
                  id="account-address"
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Address"
                />

                <img src={arrowAddressIcon} alt="" aria-hidden="true" />
              </div>
            </label>

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

          <a className="bottom-nav-link" href="/favourites">
            <img src={favouritesIcon} alt="" aria-hidden="true" />
            <span>Favourites</span>
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

export default PersonalInformationPage