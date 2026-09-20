import { useNavigate } from 'react-router-dom'

import './OwnerCategoriesHubPage.css'

interface HubItem {
  label: string
  path: string
}

const HUB_ITEMS: HubItem[] = [
  { label: 'Add new category', path: '/owner/menu/categories/add' },
  { label: 'Edit categories', path: '/owner/menu/categories/list' },
]

function OwnerCategoriesHubPage() {
  const navigate = useNavigate()

  return (
    <main className="owner-categories-hub-page">
      <div className="owner-categories-hub-page__content">
        <h1>Categories of dishes</h1>

        <div className="owner-categories-hub-page__list">
          {HUB_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className="owner-categories-hub-page__row"
              onClick={() => navigate(item.path)}
            >
              <span>{item.label}</span>
              <span className="owner-categories-hub-page__chevron">›</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

export default OwnerCategoriesHubPage
