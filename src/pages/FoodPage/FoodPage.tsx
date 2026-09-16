import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import coffeeImage from '../../assets/food-common/coffee.webp'
import panAsianImage from '../../assets/food-common/pan-asian.webp'
import pizzaImage from '../../assets/food-common/pizza.webp'
import saladsImage from '../../assets/food-common/salads.webp'
import backButtonIcon from '../../assets/food-menu/Back button.svg'
import bellIcon from '../../assets/food-menu/bell.svg'
import foodLogo from '../../assets/food-menu/food.svg'
import iceCreamImage from '../../assets/food-menu/ice cream.jpg'
import mapIcon from '../../assets/food-menu/map.svg'
import searchIcon from '../../assets/food-menu/search.svg'
import utLogo from '../../assets/food-menu/ut.svg'
import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import { getCategories } from '../../services/categoryService'
import { getActiveRestaurants } from '../../services/restaurantService'
import type {
  DishCategoryResponse,
  RestaurantResponse,
} from '../../types/restaurant'
import { logError } from '../../utils/logger'

import './FoodPage.css'

interface RestaurantSectionProps {
  title: string
  moreTo: string
  restaurants: RestaurantResponse[]
  onRestaurantClick: (restaurantId: number) => void
}

const FALLBACK_CATEGORY_IMAGES = [
  pizzaImage,
  saladsImage,
  panAsianImage,
  iceCreamImage,
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

function getCategoryFallbackImage(index: number): string {
  return FALLBACK_CATEGORY_IMAGES[index % FALLBACK_CATEGORY_IMAGES.length]
}

function getRestaurantImage(restaurant: RestaurantResponse): string {
  if (isValidImageUrl(restaurant.imageUrl)) {
    return restaurant.imageUrl as string
  }

  return pizzaImage
}

function getRestaurantCategory(restaurant: RestaurantResponse): string {
  if (restaurant.category && restaurant.category.trim() !== '') {
    return restaurant.category
  }

  return 'Restaurant'
}

function getRestaurantDeliveryTime(restaurant: RestaurantResponse): string {
  if (restaurant.deliveryTime && restaurant.deliveryTime.trim() !== '') {
    return restaurant.deliveryTime
  }

  return 'Delivery time unavailable'
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0'
  }

  return new Intl.NumberFormat('en-US').format(value)
}

function RestaurantSection({
  title,
  moreTo,
  restaurants,
  onRestaurantClick,
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
        {restaurants.map((restaurant) => (
          <button
            className="food-restaurant-card"
            type="button"
            key={`${title}-${restaurant.id}`}
            onClick={() => onRestaurantClick(restaurant.id)}
            aria-label={`Open ${restaurant.title}`}
          >
            <img
              className="food-restaurant-image"
              src={getRestaurantImage(restaurant)}
              alt={restaurant.title}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = pizzaImage
              }}
            />

            <div className="food-restaurant-body">
              <h3>{restaurant.title}</h3>

              <p>{getRestaurantCategory(restaurant)}</p>

              <div className="food-restaurant-meta">
                <span aria-hidden="true">♿</span>

                <span>
                  {formatPrice(restaurant.minOrderAmount)} won ·{' '}
                  {getRestaurantDeliveryTime(restaurant)}
                </span>
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

  const [categories, setCategories] = useState<DishCategoryResponse[]>([])
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFoodPage = async () => {
      try {
        const [categoriesResponse, restaurantsResponse] = await Promise.all([
          getCategories(0, 100),
          getActiveRestaurants(),
        ])

        if (!isMounted) {
          return
        }

        const categoryItems = categoriesResponse.content ?? []

        setCategories(
          categoryItems.filter((category) => category.isActive !== false),
        )

        setRestaurants(
          restaurantsResponse.filter(
            (restaurant) => restaurant.isActive !== false,
          ),
        )

        setErrorMessage('')
      } catch (error) {
        logError('FoodPage: failed to load restaurants and categories', error)

        if (!isMounted) {
          return
        }

        setCategories([])
        setRestaurants([])
        setErrorMessage('Failed to load restaurants and categories.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadFoodPage()

    return () => {
      isMounted = false
    }
  }, [])

  const fastestRestaurants = useMemo(() => {
    if (restaurants.length === 0) {
      return []
    }

    return [...restaurants].sort((firstRestaurant, secondRestaurant) => {
      const firstTime =
        Number.parseInt(firstRestaurant.deliveryTime, 10) ||
        Number.MAX_SAFE_INTEGER

      const secondTime =
        Number.parseInt(secondRestaurant.deliveryTime, 10) ||
        Number.MAX_SAFE_INTEGER

      return firstTime - secondTime
    })
  }, [restaurants])

  const handleRestaurantClick = (restaurantId: number) => {
    navigate(`/food/restaurants/${restaurantId}`)
  }

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/food/category/${categoryId}`)
  }

  return (
    <main className="food-page">
      <section className="food-screen">
        <header className="food-header">
          <button
            className="food-header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={backButtonIcon} alt="" aria-hidden="true" />
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
            <img src={bellIcon} alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="food-content">
          <div className="food-address" aria-label="Delivery area">
            <img src={mapIcon} alt="" aria-hidden="true" />
            <span>Delivery area</span>
          </div>

          <button
            className="food-search"
            type="button"
            onClick={() => navigate('/food/search')}
            aria-label="Open food search"
          >
            <img src={searchIcon} alt="" aria-hidden="true" />
            <span>Search for cafes, restaurants and dishes</span>
          </button>

          <section className="food-banner">
            <img src={coffeeImage} alt="Coffee promotion" />

            <div className="food-banner-text">
              <strong>Delicious coffee</strong>
              <span>Short promotional text -20% on everything</span>
            </div>
          </section>

          <div className="food-banner-dots" aria-hidden="true">
            <span />
            <span />
            <span className="active" />
            <span />
            <span />
          </div>

          {errorMessage && (
            <p className="food-error" role="alert">
              {errorMessage}
            </p>
          )}

          <section className="food-section">
            <div className="food-section-header">
              <h2>Categories</h2>
            </div>

            {isLoading ? (
              <div className="food-loading" role="status">
                <div className="food-loading-spinner" aria-hidden="true" />
                <p>Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <p className="food-empty">No categories available.</p>
            ) : (
              <div className="food-horizontal-list food-category-list">
                {categories.map((category, index) => {
                  const imageSource = isValidImageUrl(category.imageUrl)
                    ? category.imageUrl
                    : getCategoryFallbackImage(index)

                  return (
                    <button
                      className="food-category-card"
                      type="button"
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      aria-label={`Open ${category.name}`}
                    >
                      <img
                        src={imageSource ?? getCategoryFallbackImage(index)}
                        alt={category.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src =
                            getCategoryFallbackImage(index)
                        }}
                      />

                      <strong>{category.name}</strong>
                      <span>{category.restaurantName || 'Food category'}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {!isLoading && restaurants.length > 0 && (
            <>
              <RestaurantSection
                title="Establishments"
                moreTo="/food/establishments"
                restaurants={restaurants}
                onRestaurantClick={handleRestaurantClick}
              />

              <RestaurantSection
                title="Fastest delivery"
                moreTo="/food/fastest-delivery"
                restaurants={fastestRestaurants}
                onRestaurantClick={handleRestaurantClick}
              />
            </>
          )}

          {!isLoading && restaurants.length === 0 && !errorMessage && (
            <p className="food-empty">No restaurants available.</p>
          )}
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

export default FoodPage
