import {
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import './OwnerDeliveryCityPage.css'

const CITIES = [
  'City 1',
  'City 2',
  'City 3',
  'City 4',
  'City 5',
  'City 6',
  'City 7',
]

export default function OwnerDeliveryCityPage() {
  const navigate = useNavigate()

  const [
    selectedCity,
    setSelectedCity,
  ] = useState(
    () =>
      sessionStorage.getItem(
        'ownerEditRestaurantCity',
      ) ?? '',
  )

  const handleNext = () => {
    if (!selectedCity) {
      return
    }

    sessionStorage.setItem(
      'ownerEditRestaurantCity',
      selectedCity,
    )

    navigate(
      '/owner/restaurant/edit/areas',
    )
  }

  return (
    <main className="owner-delivery-city-page">
      <section className="owner-delivery-city-content">
        <h1>
          Select delivery city
        </h1>

        <div className="owner-delivery-city-list">
          {CITIES.map((city) => (
            <label
              key={city}
              className="owner-delivery-city-option"
            >
              <input
                type="radio"
                name="delivery-city"
                value={city}
                checked={
                  selectedCity === city
                }
                onChange={() =>
                  setSelectedCity(city)
                }
              />

              <span className="owner-delivery-city-radio" />

              <span className="owner-delivery-city-name">
                {city}
              </span>
            </label>
          ))}
        </div>
      </section>

      <footer className="owner-delivery-city-footer">
        <button
          type="button"
          className="owner-delivery-city-next"
          disabled={!selectedCity}
          onClick={handleNext}
        >
          Next
        </button>
      </footer>
    </main>
  )
}