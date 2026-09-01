import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import './AdminLayout.css'
import logo from '../../assets/admin-pages/Logo.png'
import avatarIcon from '../../assets/admin-pages/Avatar.png'
import addIcon from '../../assets/admin-pages/master.png'
import settingsIcon from '../../assets/admin-pages/Icon-GearSix.png'

const ADD_MENU_ITEMS = [
  'Client',
  'Rider',
  'Establishment',
  'Service',
  'Job Vacancy',
]

function AdminLayout() {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const [isUsersOpen, setIsUsersOpen] = useState(true)
  const [isAppOpen, setIsAppOpen] = useState(true)

  return (
    <div className="admin-layout">
      <header className="admin-layout__header">
        <div className="admin-layout__logo-box">
          <img
            src={logo}
            alt="UTOWN"
            className="admin-layout__logo"
          />
        </div>

        <div className="admin-layout__header-gradient">
          <button
            className="admin-layout__admin-button"
            type="button"
          >
            <img
              src={avatarIcon}
              alt=""
              aria-hidden="true"
              className="admin-layout__admin-avatar"
            />
            Admin
          </button>
        </div>
      </header>

      <div className="admin-layout__body">
        <aside className="admin-layout__sidebar">
          <nav className="admin-layout__nav">
            <button
              type="button"
              className="admin-layout__sidebar-group-title"
              onClick={() => setIsUsersOpen((current) => !current)}
            >
              <span
                aria-hidden="true"
                className={
                  isUsersOpen
                    ? 'admin-layout__caret'
                    : 'admin-layout__caret admin-layout__caret--closed'
                }
              >
                ▾
              </span>
              Users
            </button>

            {isUsersOpen && (
              <ul>
                <li>
                  <NavLink
                    to="/admin/clients"
                    className={({ isActive }) =>
                      isActive
                        ? 'admin-layout__sidebar-link admin-layout__sidebar-link--active'
                        : 'admin-layout__sidebar-link'
                    }
                  >
                    Clients
                  </NavLink>
                </li>

                <li className="admin-layout__sidebar-link">
                  Riders
                </li>

                <li className="admin-layout__sidebar-link">
                  Establishments
                </li>

                <li className="admin-layout__sidebar-link">
                  Orders
                </li>
              </ul>
            )}

            <div className="admin-layout__sidebar-divider" />

            <button
              type="button"
              className="admin-layout__sidebar-group-title"
              onClick={() => setIsAppOpen((current) => !current)}
            >
              <span
                aria-hidden="true"
                className={
                  isAppOpen
                    ? 'admin-layout__caret'
                    : 'admin-layout__caret admin-layout__caret--closed'
                }
              >
                ▾
              </span>
              App
            </button>

            {isAppOpen && (
              <ul>
                <li className="admin-layout__sidebar-link">
                  Services
                </li>

                <li className="admin-layout__sidebar-link">
                  Vacancies
                </li>
              </ul>
            )}
          </nav>

          <div className="admin-layout__sidebar-footer">
            <div className="admin-layout__add-wrapper">
              <button
                className="admin-layout__add-button"
                type="button"
                onClick={() =>
                  setIsAddMenuOpen((current) => !current)
                }
              >
                <img
                  src={addIcon}
                  alt=""
                  aria-hidden="true"
                />
                Add
              </button>

              {isAddMenuOpen && (
                <div className="admin-layout__add-menu">
                  <p className="admin-layout__add-menu-title">
                    Add...
                  </p>

                  {ADD_MENU_ITEMS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="admin-layout__add-menu-item"
                      onClick={() => setIsAddMenuOpen(false)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-layout__sidebar-divider" />

            <div className="admin-layout__settings-row">
              <button
                className="admin-layout__settings-button"
                type="button"
                aria-label="Settings"
              >
                <img
                  src={settingsIcon}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </aside>

        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout