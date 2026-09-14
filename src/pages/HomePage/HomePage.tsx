import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

import { getMyOrders } from '../../services/orderService'
import { getActiveRestaurants } from '../../services/restaurantService'

import adOneImage from '../../assets/icons main pages/Ad 1.svg'
import adTwoImage from '../../assets/icons main pages/Ad 2.svg'
import bellIcon from '../../assets/icons main pages/bell.svg'
import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import foodDeliveryIcon from '../../assets/icons main pages/Food delivery icon.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import jobsIcon from '../../assets/icons main pages/Jobs icon.svg'
import localCuisineImage from '../../assets/icons main pages/Local cuisine.svg'
import logo from '../../assets/icons main pages/logo.svg'
import mobileConnectionIcon from '../../assets/icons main pages/Mobile connection icon.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'
import servicesIcon from '../../assets/icons main pages/Services icon.svg'

import type { RestaurantResponse } from '../../types/restaurant'

import './HomePage.css'

const ads = [
  {
    id: 1,
    image: adOneImage,
    alt: 'Mobile connection advertisement',
  },
  {
    id: 2,
    image: adTwoImage,
    alt: 'Fruit discount advertisement',
  },
  {
    id: 3,
    image: adOneImage,
    alt: 'Mobile connection advertisement',
  },
  {
    id: 4,
    image: adTwoImage,
    alt: 'Fruit discount advertisement',
  },
  {
    id: 5,
    image: adOneImage,
    alt: 'Mobile connection advertisement',
  },
  {
    id: 6,
    image: adTwoImage,
    alt: 'Fruit discount advertisement',
  },
  {
    id: 7,
    image: adOneImage,
    alt: 'Mobile connection advertisement',
  },
]

const ACTIVE_ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
]

const INVALID_IMAGE_VALUES = [
  'string',
  'null',
  'undefined',
  'file uploaded successfully',
]

function isValidImageUrl(imageUrl?: string | null): boolean {
  if (!imageUrl) {
    return false
  }

  const value = imageUrl.trim()

  if (!value) {
    return false
  }

  return !INVALID_IMAGE_VALUES.includes(value.toLowerCase())
}

function getRestaurantImage(restaurant: RestaurantResponse): string {
  if (isValidImageUrl(restaurant.imageUrl)) {
    return restaurant.imageUrl as string
  }

  return localCuisineImage
}

function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || Number.isNaN(price)) {
    return '0'
  }

  return price.toLocaleString('en-US')
}

function HomePage() {
  const navigate = useNavigate()

  const { user } = useAuth()

  const isClient = user?.roles.includes('CLIENT') ?? false

  const [activeOrdersCount, setActiveOrdersCount] = useState(0)

  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([])

  const [isRestaurantsLoading, setIsRestaurantsLoading] = useState(true)

  const [restaurantsError, setRestaurantsError] = useState('')

  useEffect(() => {
    if (!user || !isClient) {
      return
    }

    let isMounted = true

    const loadActiveOrders = async () => {
      try {
        const orders = await getMyOrders()

        if (!isMounted) {
          return
        }

        const activeOrders = orders.filter((order) => {
          const status = order.status?.trim().toUpperCase() ?? ''

          return ACTIVE_ORDER_STATUSES.includes(status)
        })

        setActiveOrdersCount(activeOrders.length)
      } catch {
        if (isMounted) {
          setActiveOrdersCount(0)
        }
      }
    }

    void loadActiveOrders()

    return () => {
      isMounted = false
    }
  }, [user, isClient])

  useEffect(() => {
    let isMounted = true

    const loadRestaurants = async () => {
      try {
        const data = await getActiveRestaurants()

        if (!isMounted) {
          return
        }

        setRestaurants(
          data
            .filter((restaurant) => restaurant.isActive !== false)
            .slice(0, 4),
        )

        setRestaurantsError('')
      } catch {
        if (!isMounted) {
          return
        }

        setRestaurants([])

        setRestaurantsError('Failed to load restaurants.')
      } finally {
        if (isMounted) {
          setIsRestaurantsLoading(false)
        }
      }
    }

    void loadRestaurants()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleActiveOrdersCount = isClient ? activeOrdersCount : 0

  return (
    <main className="home-page">
      <section className="home-screen">
        <header className="home-header">
          <div className="home-top-bar">
            <img className="home-logo-image" src={logo} alt="UT" />

            <button
              className="home-notification-button"
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <img src={bellIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="home-content">
          <section className="home-greeting-section">
            <h1>Hello, {user?.fullName || user?.username || 'User'}!</h1>

            <div className="home-info-grid">
              <article className="weather-card">
                <p className="weather-city">City name</p>

                <div className="weather-main">
                  <span>+12°</span>

                  <span className="weather-sun">☼</span>
                </div>

                <div className="weather-details">
                  <span>Sunny</span>

                  <span>↓ +10°</span>

                  <span>↑ +17°</span>
                </div>
              </article>

              <button
                className="active-orders-card"
                type="button"
                onClick={() => navigate('/food/orders')}
              >
                <span className="active-orders-icon">🛒</span>

                <span>Your active orders</span>

                {visibleActiveOrdersCount > 0 && (
                  <strong className="active-orders-count">
                    {visibleActiveOrdersCount}
                  </strong>
                )}
              </button>
            </div>
          </section>

          <section className="home-service-grid" aria-label="Main services">
            <Link className="service-card service-food" to="/food">
              <img src={foodDeliveryIcon} alt="" aria-hidden="true" />

              <span>Food delivery</span>
            </Link>

            <Link
              className="service-card service-mobile"
              to="/mobile-connection"
            >
              <img src={mobileConnectionIcon} alt="" aria-hidden="true" />

              <span>Mobile connection</span>
            </Link>

            <Link className="service-card service-services" to="/services">
              <img src={servicesIcon} alt="" aria-hidden="true" />

              <span>Services</span>
            </Link>

            <Link className="service-card service-jobs" to="/jobs">
              <img src={jobsIcon} alt="" aria-hidden="true" />

              <span>Jobs</span>
            </Link>
          </section>

          <section className="home-ad-section" aria-label="Advertisements">
            <div className="home-ad-list">
              {ads.map((ad, index) => (
                <article
                  className={
                    index === 1
                      ? 'home-ad-card home-ad-card-shadow'
                      : 'home-ad-card'
                  }
                  key={ad.id}
                >
                  <img src={ad.image} alt={ad.alt} />
                </article>
              ))}
            </div>
          </section>

          <section className="food-section">
            <div className="section-header">
              <h2>Food delivery</h2>

              <Link className="section-more-link" to="/food">
                More
              </Link>
            </div>

            {isRestaurantsLoading && (
              <p className="home-restaurants-empty" role="status">
                Loading restaurants...
              </p>
            )}

            {!isRestaurantsLoading && restaurantsError && (
              <p className="home-restaurants-empty" role="alert">
                {restaurantsError}
              </p>
            )}

            {!isRestaurantsLoading &&
              !restaurantsError &&
              restaurants.length > 0 && (
                <div className="restaurant-list">
                  {restaurants.map((restaurant) => (
                    <Link
                      className="restaurant-card"
                      to={`/food/restaurants/${restaurant.id}`}
                      key={restaurant.id}
                    >
                      <img
                        className="restaurant-image"
                        src={getRestaurantImage(restaurant)}
                        alt={restaurant.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null

                          event.currentTarget.src = localCuisineImage
                        }}
                      />

                      <div className="restaurant-body">
                        <h3>{restaurant.title}</h3>

                        <p>{restaurant.category || 'Restaurant'}</p>

                        <div className="restaurant-meta">
                          <span>♿</span>

                          <span>
                            {formatPrice(restaurant.minOrderAmount)} won
                            {restaurant.deliveryTime
                              ? ` · ${restaurant.deliveryTime}`
                              : ''}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

            {!isRestaurantsLoading &&
              !restaurantsError &&
              restaurants.length === 0 && (
                <p className="home-restaurants-empty">
                  No restaurants available.
                </p>
              )}
          </section>
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          <Link className="bottom-nav-link active" to="/">
            <img src={homeIcon} alt="" aria-hidden="true" />

            <span>Home</span>
          </Link>

          <Link className="bottom-nav-link" to="/favorites">
            <img src={favoritesIcon} alt="" aria-hidden="true" />

            <span>Favorites</span>
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

export default HomePage
