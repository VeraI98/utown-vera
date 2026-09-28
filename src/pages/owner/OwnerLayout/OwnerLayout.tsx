import HomeLogo from '../../../components/HomeLogo/HomeLogo'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import arrowIcon from '../../../assets/restaurateur/Arrow.svg'
import backIcon from '../../../assets/restaurateur/Back Icon.svg'
import headerLogo from '../../../assets/restaurateur/Header Text Container.svg'
import menuIcon from '../../../assets/restaurateur/menu.svg'

import './OwnerLayout.css'

interface OwnerMenuItem {
  label: string
  path?: string
}

const OWNER_MENU_ITEMS: OwnerMenuItem[] = [
  {
    label: 'Order table',
    path: 'orders',
  },
  {
    label: 'Notifications',
    path: 'notifications',
  },
  {
    label: 'Statistics',
    path: 'statistics',
  },
  {
    label: 'Menu',
    path: 'menu',
  },
  {
    label: 'Establishment',
    path: 'restaurant/edit',
  },
  {
    label: 'Working hours',
    path: 'working-hours',
  },
]

export default function OwnerLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isOwnerHome =
    location.pathname === '/owner' || location.pathname === '/owner/'

  const handleMenuNavigation = (path: string) => {
    setIsMenuOpen(false)

    navigate(`/owner/${path}`)
  }

  return (
    <main className="owner-layout">
      <section className="owner-layout__screen">
        <header className="owner-layout__header">
          {isOwnerHome ? (
            <button
              type="button"
              className="owner-layout__header-button"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <img src={menuIcon} alt="" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="owner-layout__header-button"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <img src={backIcon} alt="" aria-hidden="true" />
            </button>
          )}

          <HomeLogo
            className="owner-layout__logo"
            src={headerLogo}
            alt="UT Business"
          />

          <div className="owner-layout__placeholder" aria-hidden="true" />
        </header>

        <Outlet />

        {isMenuOpen && (
          <div className="owner-layout-drawer">
            <button
              type="button"
              className="owner-layout-drawer__overlay"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
            />

            <aside className="owner-layout-drawer__panel">
              <div className="owner-layout-drawer__header">
                <HomeLogo
                  className="owner-layout-drawer__logo"
                  src={headerLogo}
                  alt="UT Business"
                />
              </div>

              <nav className="owner-layout-drawer__navigation">
                {OWNER_MENU_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={!item.path}
                    onClick={() => item.path && handleMenuNavigation(item.path)}
                  >
                    <span>{item.label}</span>

                    <img src={arrowIcon} alt="" aria-hidden="true" />
                  </button>
                ))}
              </nav>
            </aside>

            <button
              type="button"
              className="owner-layout-drawer__close"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
            >
              ×
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
