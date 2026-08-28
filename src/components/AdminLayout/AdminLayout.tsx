import { Outlet } from 'react-router-dom'

import './AdminLayout.css'

function AdminLayout() {
  return (
    <div className="admin-layout">
      <header className="admin-layout__header">
        <div className="admin-layout__logo">UTOWN</div>

        <input
          className="admin-layout__search"
          type="text"
          placeholder="Search"
        />

        <button className="admin-layout__admin-button" type="button">
          Admin
        </button>
      </header>


      <div className="admin-layout__body">
        <aside className="admin-layout__sidebar">
          <nav>
            <p className="admin-layout__sidebar-group-title">Users</p>
            <ul>
              <li>Clients</li>
              <li>Riders</li>
              <li>Establishments</li>
              <li>Orders</li>
            </ul>

            <p className="admin-layout__sidebar-group-title">App</p>
            <ul>
              <li>Services</li>
              <li>Vacancies</li>
            </ul>
          </nav>
        </aside>

        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout