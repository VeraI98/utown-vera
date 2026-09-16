import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './OwnerDeliveryAreasPage.css'

const AREAS = [
  'Area 1',
  'Area 2',
  'Area 3',
  'Area 4',
  'Area 5',
  'Area 6',
  'Area 7',
]

export default function OwnerDeliveryAreasPage() {
  const navigate = useNavigate()

  const [selectedArea, setSelectedArea] = useState(
    () => sessionStorage.getItem('ownerEditRestaurantArea') ?? '',
  )

  const handleSave = () => {
    if (!selectedArea) {
      return
    }

    sessionStorage.setItem('ownerEditRestaurantArea', selectedArea)

    navigate('/owner/restaurant/edit', {
      replace: true,
    })
  }

  return (
    <main className="owner-delivery-areas-page">
      <section className="owner-delivery-areas-content">
        <h1>Select delivery areas</h1>

        <div className="owner-delivery-areas-list">
          {AREAS.map((area) => (
            <label key={area} className="owner-delivery-areas-option">
              <input
                type="radio"
                name="delivery-area"
                value={area}
                checked={selectedArea === area}
                onChange={() => setSelectedArea(area)}
              />

              <span className="owner-delivery-areas-radio" />

              <span className="owner-delivery-areas-name">{area}</span>
            </label>
          ))}
        </div>
      </section>

      <footer className="owner-delivery-areas-footer">
        <button
          type="button"
          className="owner-delivery-areas-save"
          disabled={!selectedArea}
          onClick={handleSave}
        >
          Save
        </button>
      </footer>
    </main>
  )
}
