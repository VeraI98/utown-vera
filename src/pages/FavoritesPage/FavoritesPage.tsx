import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import localCuisineImage from '../../assets/food-common/local-cuisine.webp'
import bellIcon from '../../assets/icons main pages/bell-color.svg'
import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import logo from '../../assets/icons main pages/logo.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import {
  getFavoriteRestaurants,
  removeRestaurantFromFavorites,
  type FavoriteRestaurantResponse,
} from '../../services/favoriteRestaurantService'
import { logError } from '../../utils/logger'

import './FavoritesPage.css'

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

function HeartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21s-7.2-4.35-9.6-8.65C.65 9.2 2.05 5.2 5.8 4.25c2.2-.55 4.15.35 5.2 1.8 1.05-1.45 3-2.35 5.2-1.8 3.75.95 5.15 4.95 3.4 8.1C19.2 16.65 12 21 12 21Z" />
    </svg>
  )
}

function getRestaurantImage(favorite: FavoriteRestaurantResponse): string {
  const imageUrl = favorite.restaurant?.imageUrl

  if (
    imageUrl &&
    imageUrl.trim() &&
    imageUrl.trim().toLowerCase() !== 'string'
  ) {
    return imageUrl
  }

  return localCuisineImage
}

function getRestaurantSubtitle(favorite: FavoriteRestaurantResponse): string {
  const category = favorite.restaurant?.category

  if (category && category.trim()) {
    return category
  }

  return 'Restaurant'
}

function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || Number.isNaN(price)) {
    return '0'
  }

  return price.toLocaleString('en-US')
}

function FavoritesPage() {
  const navigate = useNavigate()

  const [favorites, setFavorites] = useState<FavoriteRestaurantResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [removingRestaurantId, setRemovingRestaurantId] = useState<
    number | null
  >(null)

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      try {
        const data = await getFavoriteRestaurants()

        if (!isMounted) {
          return
        }

        setFavorites(data ?? [])
        setErrorMessage('')
      } catch (error) {
        logError('FavoritesPage: failed to load favorites', error)

        if (!isMounted) {
          return
        }

        setFavorites([])
        setErrorMessage('Failed to load favorites.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadFavorites()

    return () => {
      isMounted = false
    }
  }, [])

  const handleRemoveFavorite = async (restaurantId: number) => {
    if (removingRestaurantId !== null) {
      return
    }

    setRemovingRestaurantId(restaurantId)
    setErrorMessage('')

    try {
      await removeRestaurantFromFavorites(restaurantId)

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (favorite) =>
            favorite.restaurantId !== restaurantId &&
            favorite.restaurant?.id !== restaurantId,
        ),
      )
    } catch (error) {
      logError(
        'FavoritesPage: failed to remove restaurant from favorites',
        error,
      )

      setErrorMessage('Failed to remove restaurant from favorites.')
    } finally {
      setRemovingRestaurantId(null)
    }
  }

  return (
    <main className="mobile-page favorites-page">
      <section className="favorites-screen">
        <header className="favorites-header">
          <div className="favorites-top-bar">
            <button
              className="favorites-back-button"
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>

            <img className="favorites-logo-image" src={logo} alt="UT" />

            <button
              className="favorites-notification-button"
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <img src={bellIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="favorites-content">
          <h1 className="favorites-title">Your Favorites</h1>

          <section className="favorites-food-section">
            <div className="favorites-section-header">
              <h2>Food Delivery</h2>

              <Link className="favorites-section-more-link" to="/food">
                More
              </Link>
            </div>

            {isLoading && (
              <div className="favorites-state">
                <div className="favorites-spinner" aria-hidden="true" />
                <p>Loading favorites...</p>
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="favorites-error" role="alert">
                {errorMessage}
              </div>
            )}

            {!isLoading && !errorMessage && favorites.length === 0 && (
              <div className="favorites-empty">
                <p>You don't have any favorite restaurants yet.</p>

                <Link to="/food" className="favorites-empty-link">
                  Find restaurants
                </Link>
              </div>
            )}

            {!isLoading && favorites.length > 0 && (
              <div className="favorites-restaurant-list">
                {favorites.map((favorite) => {
                  const restaurant = favorite.restaurant

                  if (!restaurant) {
                    return null
                  }

                  const restaurantId = restaurant.id ?? favorite.restaurantId

                  const isRemoving = removingRestaurantId === restaurantId

                  return (
                    <article
                      className="favorites-restaurant-card"
                      key={favorite.id}
                    >
                      <Link
                        className="favorites-restaurant-main"
                        to={`/food/restaurants/${restaurantId}`}
                      >
                        <img
                          className="favorites-restaurant-image"
                          src={getRestaurantImage(favorite)}
                          alt={restaurant.title}
                          onError={(event) => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src = localCuisineImage
                          }}
                        />

                        <div className="favorites-restaurant-body">
                          <h3>{restaurant.title}</h3>

                          <p>{getRestaurantSubtitle(favorite)}</p>

                          <div className="favorites-restaurant-meta">
                            <span>
                              Min. order:{' '}
                              {formatPrice(restaurant.minOrderAmount)} won
                            </span>

                            {restaurant.deliveryTime && (
                              <span>· {restaurant.deliveryTime}</span>
                            )}
                          </div>
                        </div>
                      </Link>

                      <button
                        className="favorites-remove-button"
                        type="button"
                        onClick={() => void handleRemoveFavorite(restaurantId)}
                        disabled={isRemoving}
                        aria-label={`Remove ${restaurant.title} from favorites`}
                      >
                        {isRemoving ? (
                          <span className="favorites-remove-spinner" />
                        ) : (
                          <HeartIcon />
                        )}
                      </button>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          <Link className="bottom-nav-link" to="/">
            <img src={homeIcon} alt="" aria-hidden="true" />
            <span>Home</span>
          </Link>

          <Link className="bottom-nav-link active" to="/favorites">
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

export default FavoritesPage
