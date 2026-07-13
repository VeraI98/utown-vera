import { Link, useNavigate } from 'react-router-dom'

import bellIcon from '../assets/icons main pages/bell-color.svg'
import favouritesIcon from '../assets/icons main pages/Favourites.svg'
import homeIcon from '../assets/icons main pages/Home.svg'
import localCuisineImage from '../assets/icons main pages/Local cuisine.svg'
import logo from '../assets/icons main pages/logo.svg'
import longRestaurantImage from '../assets/icons main pages/long restaurant name.svg'
import profileIcon from '../assets/icons main pages/Profile.svg'

const favouriteRestaurants = [
  {
    id: 1,
    title: 'Local Cuisine',
    subtitle: 'European, Asian',
    image: localCuisineImage,
  },
  {
    id: 2,
    title: 'Long name here...',
    subtitle: 'European, Asian',
    image: longRestaurantImage,
  },
  {
    id: 3,
    title: 'Local Cuisine',
    subtitle: 'European, Asian',
    image: localCuisineImage,
  },
  {
    id: 4,
    title: 'Long name here...',
    subtitle: 'European, Asian',
    image: longRestaurantImage,
  },
]

function ArrowLeftIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FavouritesPage() {
  const navigate = useNavigate()

  return (
    <main className="mobile-page favourites-page">
      <section className="favourites-screen">
        <header className="favourites-header">
          <div className="favourites-top-bar">
            <button
              className="favourites-back-button"
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>

            <img
              className="favourites-logo-image"
              src={logo}
              alt="UT"
            />

            <button
              className="favourites-notification-button"
              type="button"
              aria-label="Notifications"
            >
              <img src={bellIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="favourites-content">
          <h1 className="favourites-title">Your Favourites</h1>

          <section className="favourites-food-section">
            <div className="section-header">
              <h2>Food Delivery</h2>

              <Link className="section-more-link" to="/food">
                More
              </Link>
            </div>

            <div className="restaurant-list">
              {favouriteRestaurants.map((restaurant) => (
                <Link
                  className="restaurant-card"
                  to={`/restaurants/${restaurant.id}`}
                  key={restaurant.id}
                >
                  <img
                    className="restaurant-image"
                    src={restaurant.image}
                    alt={restaurant.title}
                  />

                  <div className="restaurant-body">
                    <h3>{restaurant.title}</h3>

                    <p>{restaurant.subtitle}</p>

                    <div className="restaurant-meta">
                      <span>♿</span>
                      <span>3,000 won · 45-55 min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          <Link className="bottom-nav-link" to="/">
            <img src={homeIcon} alt="" aria-hidden="true" />
            <span>Home</span>
          </Link>

          <Link className="bottom-nav-link active" to="/favourites">
            <img src={favouritesIcon} alt="" aria-hidden="true" />
            <span>Favourites</span>
          </Link>

          <Link className="bottom-nav-link" to="/profile">
            <img src={profileIcon} alt="" aria-hidden="true" />
            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default FavouritesPage