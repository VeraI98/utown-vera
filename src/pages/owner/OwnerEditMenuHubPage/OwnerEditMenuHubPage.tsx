import { useNavigate } from 'react-router-dom'

import './OwnerEditMenuHubPage.css'

interface HubItem {
  label: string
  path: string
}

const HUB_ITEMS: HubItem[] = [
  { label: 'Add Dish', path: '/owner/menu/add' },
  { label: 'Dishes on hold', path: '/owner/menu/on-hold' },
  { label: 'Deleted', path: '/owner/menu/deleted' },
  { label: 'Dish Categories', path: '/owner/menu/categories' },
]

function OwnerEditMenuHubPage() {
  const navigate = useNavigate()

  return (
    <main className="owner-edit-menu-hub-page">
      <div className="owner-edit-menu-hub-page__content">
        <h1>Edit Menu</h1>

        <div className="owner-edit-menu-hub-page__list">
          {HUB_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className="owner-edit-menu-hub-page__row"
              onClick={() => navigate(item.path)}
            >
              <span>{item.label}</span>
              <span className="owner-edit-menu-hub-page__chevron">›</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

export default OwnerEditMenuHubPage
