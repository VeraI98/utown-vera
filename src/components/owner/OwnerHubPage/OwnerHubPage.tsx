import { useNavigate } from 'react-router-dom'

import './OwnerHubPage.css'

export interface OwnerHubItem {
  label: string
  path: string
}

interface OwnerHubPageProps {
  title: string
  items: OwnerHubItem[]
}

// Shared layout for owner "hub" screens that just list a few links to
// sub-pages (e.g. Edit Menu, Categories). OwnerCategoriesHubPage and
// OwnerEditMenuHubPage used to be two near-identical copies of this same
// markup/CSS — merged into one reusable component, configured per route.
function OwnerHubPage({ title, items }: OwnerHubPageProps) {
  const navigate = useNavigate()

  return (
    <main className="owner-hub-page">
      <div className="owner-hub-page__content">
        <h1>{title}</h1>

        <div className="owner-hub-page__list">
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              className="owner-hub-page__row"
              onClick={() => navigate(item.path)}
            >
              <span>{item.label}</span>
              <span className="owner-hub-page__chevron">›</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

export default OwnerHubPage
