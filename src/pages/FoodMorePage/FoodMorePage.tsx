import { useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/food-menu/Back button.svg'
import bellIcon from '../../assets/food-menu/bell.svg'
import foodLogo from '../../assets/food-menu/food.svg'
import mapIcon from '../../assets/food-menu/map.svg'
import utLogo from '../../assets/food-menu/ut.svg'

import './FoodMorePage.css'

interface FoodMorePageProps {
  title: string
}

const establishments = [
  {
    id: 1,
    title: 'Local Cuisine',
    description: 'Turkish cuisine with soul',
    deliveryTime: '45–55',
  },
  {
    id: 2,
    title: 'Marmaris',
    description: 'The long name will be cut off...',
    deliveryTime: '45–55',
  },
  {
    id: 3,
    title: 'The long name of the establishment...',
    description: 'Turkish cuisine with soul',
    deliveryTime: '45–55',
  },
  {
    id: 4,
    title: 'Local Cuisine',
    description: 'Turkish cuisine with soul',
    deliveryTime: '45–55',
  },
  {
    id: 5,
    title: 'Marmaris',
    description: 'The long name will be cut off...',
    deliveryTime: '45–55',
  },
  {
    id: 6,
    title: 'Local Cuisine',
    description: 'Turkish cuisine with soul',
    deliveryTime: '45–55',
  },
  {
    id: 7,
    title: 'The long name of the establishment...',
    description: 'Turkish cuisine with soul',
    deliveryTime: '45–55',
  },
]

function FoodMorePage({ title }: FoodMorePageProps) {
  const navigate = useNavigate()

  return (
    <main className="mobile-page food-more-page">
      <section className="food-more-screen">
        <header className="food-more-header">
          <button
            className="food-more-header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={backButtonIcon} alt="" aria-hidden="true" />
          </button>

          <div className="food-more-logo">
            <img src={utLogo} alt="UT" />
            <img src={foodLogo} alt="Food" />
          </div>

          <button
            className="food-more-header-button"
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <img src={bellIcon} alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="food-more-address">
          <img src={mapIcon} alt="" aria-hidden="true" />

          <span>House, street Seobuk-gu Byeonhyeong-ro 569</span>
        </div>

        <div className="food-more-content">
          <h1>{title}</h1>

          <div className="food-more-list">
            {establishments.map((establishment) => (
              <button
                className="food-more-card"
                type="button"
                key={establishment.id}
              >
                <div
                  className="food-more-card-image"
                  aria-hidden="true"
                />

                <div className="food-more-card-info">
                  <div className="food-more-card-text">
                    <h2>{establishment.title}</h2>
                    <p>{establishment.description}</p>
                  </div>

                  <div className="food-more-delivery-time">
                    <strong>{establishment.deliveryTime}</strong>
                    <span>min</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default FoodMorePage