import { Link, useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/food-menu/Back button.svg'
import bellIcon from '../../assets/food-menu/bell.svg'
import coffeeImage from '../../assets/food-menu/coffee.svg'
import cuisineAreaImage from '../../assets/food-menu/Cuisine in the area.svg'
import foodLogo from '../../assets/food-menu/food.svg'
import iceCreamImage from '../../assets/food-menu/ice cream.jpg'
import longRestaurantImage from '../../assets/food-menu/Long name of the restaurant....svg'
import mapIcon from '../../assets/food-menu/map.svg'
import panAsianImage from '../../assets/food-menu/Pan Asian.svg'
import pizzaImage from '../../assets/food-menu/pizza.svg'
import redWhiteImage from '../../assets/food-menu/red white.svg'
import saladsImage from '../../assets/food-menu/salads.svg'
import searchIcon from '../../assets/food-menu/search.svg'
import utLogo from '../../assets/food-menu/ut.svg'

import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import './FoodPage.css'

const categories = [
  {
    id: 1,
    title: 'Pizza',
    subtitle: '12 establishments',
    image: pizzaImage,
  },
  {
    id: 2,
    title: 'Salads',
    subtitle: '4 establishments',
    image: saladsImage,
  },
  {
    id: 3,
    title: 'Pan-Asian',
    subtitle: '2 establishments',
    image: panAsianImage,
  },
  {
    id: 4,
    title: 'Ice cream',
    subtitle: '6 establishments',
    image: iceCreamImage,
  },
]

const restaurants = [
  {
    id: 1,
    title: 'Cuisine in the area',
    subtitle: 'European, Asian',
    image: cuisineAreaImage,
  },
  {
    id: 2,
    title: 'Long name of the restaurant...',
    subtitle: 'European, Asian',
    image: longRestaurantImage,
  },
  {
    id: 3,
    title: 'Red White',
    subtitle: 'European, Asian',
    image: redWhiteImage,
  },
]

interface RestaurantSectionProps {
  title: string
  moreTo: string
  restaurants: typeof restaurants
}

function RestaurantSection({
  title,
  moreTo,
  restaurants: restaurantItems,
}: RestaurantSectionProps) {
  return (
    <section className="food-section">
      <div className="food-section-header">
        <h2>{title}</h2>

        <Link className="food-more-button" to={moreTo}>
          More
        </Link>
      </div>

      <div className="food-horizontal-list food-restaurant-list">
        {restaurantItems.map((restaurant) => (
          <button
            className="food-restaurant-card"
            type="button"
            key={`${title}-${restaurant.id}`}
          >
            <img
              className="food-restaurant-image"
              src={restaurant.image}
              alt={restaurant.title}
            />

            <div className="food-restaurant-body">
              <h3>{restaurant.title}</h3>

              <p>{restaurant.subtitle}</p>

              <div className="food-restaurant-meta">
                <span aria-hidden="true">♿</span>
                <span>3,000 won · 45–55 min</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function FoodPage() {
  const navigate = useNavigate()

  return (
    <main className="mobile-page food-page">
      <section className="food-screen">
        <header className="food-header">
          <button
            className="food-header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img
              src={backButtonIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <div className="food-logo" aria-label="UT Food">
            <img src={utLogo} alt="UT" />
            <img src={foodLogo} alt="Food" />
          </div>

          <button
            className="food-header-button"
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <img
              src={bellIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="food-content">
          <button className="food-address" type="button">
            <img
              src={mapIcon}
              alt=""
              aria-hidden="true"
            />

            <span>
              House, street Seobuk-gu Byeonhyeong-ro 569
            </span>

            <span aria-hidden="true">⌄</span>
          </button>

          <label className="food-search">
            <img
              src={searchIcon}
              alt=""
              aria-hidden="true"
            />

            <input
              type="search"
              placeholder="Search for cafes, restaurants and dishes"
              aria-label="Search for cafes, restaurants and dishes"
            />
          </label>

          <section className="food-banner">
            <img
              src={coffeeImage}
              alt="Coffee promotion"
            />

            <div className="food-banner-text">
              <strong>Delicious coffee</strong>

              <span>
                Short promotional text -20% on everything
              </span>
            </div>
          </section>

          <div
            className="food-banner-dots"
            aria-hidden="true"
          >
            <span />
            <span />
            <span className="active" />
            <span />
            <span />
          </div>

          <section className="food-section">
            <div className="food-section-header">
              <h2>Categories</h2>
            </div>

            <div className="food-horizontal-list food-category-list">
              {categories.map((category) => (
                <button
                  className="food-category-card"
                  type="button"
                  key={category.id}
                >
                  <img
                    src={category.image}
                    alt={category.title}
                  />

                  <strong>{category.title}</strong>

                  <span>{category.subtitle}</span>
                </button>
              ))}
            </div>
          </section>

          <RestaurantSection
            title="Establishments"
            moreTo="/food/establishments"
            restaurants={restaurants}
          />

          <RestaurantSection
            title="Fastest delivery"
            moreTo="/food/fastest-delivery"
            restaurants={restaurants}
          />

          <RestaurantSection
            title="Fastest delivery"
            moreTo="/food/fastest-delivery"
            restaurants={restaurants}
          />
        </div>

        <nav
          className="bottom-nav"
          aria-label="Main navigation"
        >
          <Link className="bottom-nav-link active" to="/">
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
            />
            <span>Home</span>
          </Link>

          <Link
            className="bottom-nav-link"
            to="/favorites"
          >
            <img
              src={favoritesIcon}
              alt=""
              aria-hidden="true"
            />
            <span>Favorites</span>
          </Link>

          <Link
            className="bottom-nav-link"
            to="/profile"
          >
            <img
              src={profileIcon}
              alt=""
              aria-hidden="true"
            />
            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default FoodPage