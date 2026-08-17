import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/food-menu/Back button.svg'
import bellIcon from '../../assets/food-menu/bell.svg'
import foodLogo from '../../assets/food-menu/food.svg'
import mapIcon from '../../assets/food-menu/map.svg'
import utLogo from '../../assets/food-menu/ut.svg'

import { getRestaurants } from '../../services/restaurantService'

import type { RestaurantResponse } from '../../types/restaurant'

import './FoodMorePage.css'

interface FoodMorePageProps {
  title: string
}

function getRestaurantImage(
  restaurant: RestaurantResponse,
): string | null {
  const imageUrl = restaurant.imageUrl

  if (
    !imageUrl ||
    !imageUrl.trim() ||
    imageUrl.trim().toLowerCase() === 'string'
  ) {
    return null
  }

  return imageUrl
}

function FoodMorePage({
  title,
}: FoodMorePageProps) {
  const navigate = useNavigate()

  const [restaurants, setRestaurants] =
    useState<RestaurantResponse[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    const loadRestaurants = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data = await getRestaurants(
          0,
          100,
        )

        if (!isMounted) {
          return
        }

        const activeRestaurants = (
          data.content ?? []
        ).filter(
          (restaurant) =>
            restaurant.isActive !== false,
        )

        setRestaurants(activeRestaurants)
      } catch (error) {
        console.error(
          'Failed to load restaurants:',
          error,
        )

        if (!isMounted) {
          return
        }

        setRestaurants([])
        setErrorMessage(
          'Failed to load restaurants.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadRestaurants()

    return () => {
      isMounted = false
    }
  }, [])

  const handleRestaurantClick = (
    restaurantId: number,
  ) => {
    navigate(
      `/food/restaurants/${restaurantId}`,
    )
  }

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
            <img
              src={backButtonIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <div
            className="food-more-logo"
            aria-label="UT Food"
          >
            <img
              src={utLogo}
              alt="UT"
            />

            <img
              src={foodLogo}
              alt="Food"
            />
          </div>

          <button
            className="food-more-header-button"
            type="button"
            onClick={() =>
              navigate('/notifications')
            }
            aria-label="Notifications"
          >
            <img
              src={bellIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="food-more-address">
          <img
            src={mapIcon}
            alt=""
            aria-hidden="true"
          />

          <span>
            Delivery restaurants
          </span>
        </div>

        <div className="food-more-content">
          <h1>{title}</h1>

          {isLoading && (
            <div
              className="food-more-state"
              role="status"
            >
              <div
                className="food-more-spinner"
                aria-hidden="true"
              />

              <p>
                Loading restaurants...
              </p>
            </div>
          )}

          {!isLoading &&
            errorMessage && (
              <div
                className="food-more-error"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

          {!isLoading &&
            !errorMessage &&
            restaurants.length === 0 && (
              <div className="food-more-state">
                <p>
                  No restaurants available.
                </p>
              </div>
            )}

          {!isLoading &&
            !errorMessage &&
            restaurants.length > 0 && (
              <div className="food-more-list">
                {restaurants.map(
                  (restaurant) => {
                    const imageUrl =
                      getRestaurantImage(
                        restaurant,
                      )

                    return (
                      <button
                        className="food-more-card"
                        type="button"
                        key={restaurant.id}
                        onClick={() =>
                          handleRestaurantClick(
                            restaurant.id,
                          )
                        }
                      >
                        <div className="food-more-card-image">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={
                                restaurant.title
                              }
                              loading="lazy"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                            >
                              🍽️
                            </span>
                          )}
                        </div>

                        <div className="food-more-card-info">
                          <div className="food-more-card-text">
                            <h2>
                              {
                                restaurant.title
                              }
                            </h2>

                            <p>
                              {restaurant.description ||
                                restaurant.category ||
                                'Restaurant'}
                            </p>
                          </div>

                          <div className="food-more-delivery-time">
                            <strong>
                              {restaurant.deliveryTime ||
                                '—'}
                            </strong>

                            {restaurant.deliveryTime && (
                              <span>
                                min
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  },
                )}
              </div>
            )}
        </div>
      </section>
    </main>
  )
}

export default FoodMorePage