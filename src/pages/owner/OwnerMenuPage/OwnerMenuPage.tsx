import axios from 'axios'
import { useEffect, useState } from 'react'

import { useAuth } from '../../../hooks/useAuth'

import {
  activateOwnerDish,
  deactivateOwnerDish,
  getOwnerDishes,
} from '../../../services/ownerDishService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import type { DishResponse } from '../../../types/restaurant'
import { logError } from '../../../utils/logger'

import './OwnerMenuPage.css'

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message
    }

    if (typeof responseData === 'string') {
      return responseData
    }
  }

  return 'Failed to load the menu.'
}

function formatPrice(price: number) {
  if (typeof price !== 'number') {
    return '-'
  }

  return price.toLocaleString('en-US')
}

function OwnerMenuPage() {
  const { user } = useAuth()

  const userId = user?.id

  const [restaurantId, setRestaurantId] = useState<number | null>(null)

  const [dishes, setDishes] = useState<DishResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [toggleError, setToggleError] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true

    const loadMenu = async () => {
      if (isMounted) {
        setIsLoading(true)
        setErrorMessage('')
      }

      try {
        const restaurants = await getOwnerRestaurants(userId)

        const restaurant = restaurants[0]

        if (!restaurant) {
          if (isMounted) {
            setErrorMessage('No restaurant found.')
          }
          return
        }

        if (isMounted) {
          setRestaurantId(restaurant.id)
        }

        const data = await getOwnerDishes(restaurant.id)

        if (!isMounted) {
          return
        }

        setDishes(data)
      } catch (error) {
        logError('OwnerMenuPage: failed to load menu', error)

        if (isMounted) {
          setDishes([])
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadMenu()

    return () => {
      isMounted = false
    }
  }, [userId, reloadKey])

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  const handleToggle = async (dish: DishResponse) => {
    if (togglingId) {
      return
    }

    setTogglingId(dish.id)
    setToggleError('')

    try {
      if (dish.isActive) {
        await deactivateOwnerDish(dish.id)
      } else {
        await activateOwnerDish(dish.id)
      }

      setReloadKey((current) => current + 1)
    } catch (error: unknown) {
      logError('OwnerMenuPage: failed to toggle dish', error)
      setToggleError(getErrorMessage(error))
    } finally {
      setTogglingId(null)
    }
  }

  const showEmptyState = !isLoading && !errorMessage && dishes.length === 0

  // Group by category so the list reads like an actual menu rather than a
  // flat table.
  const groupedByCategory = dishes.reduce<Record<string, DishResponse[]>>(
    (groups, dish) => {
      const key = dish.categoryName || 'Other'

      if (!groups[key]) {
        groups[key] = []
      }

      groups[key].push(dish)

      return groups
    },
    {},
  )

  return (
    <main className="owner-menu-page">
      <div className="owner-menu-page__content">
        <h1>Menu</h1>

        {isLoading && <p className="owner-menu-page__message">Loading...</p>}

        {!isLoading && errorMessage && (
          <p className="owner-menu-page__error" role="alert">
            {errorMessage}
            {restaurantId && (
              <button
                className="owner-menu-page__retry"
                type="button"
                onClick={handleRetry}
              >
                Retry
              </button>
            )}
          </p>
        )}

        {showEmptyState && (
          <p className="owner-menu-page__message">No dishes yet.</p>
        )}

        {toggleError && (
          <p className="owner-menu-page__error" role="alert">
            {toggleError}
          </p>
        )}

        {!isLoading && !errorMessage && dishes.length > 0 && (
          <div className="owner-menu-page__categories">
            {Object.entries(groupedByCategory).map(
              ([categoryName, categoryDishes]) => (
                <section
                  className="owner-menu-page__category"
                  key={categoryName}
                >
                  <h2>{categoryName}</h2>

                  <div className="owner-menu-page__dishes">
                    {categoryDishes.map((dish) => (
                      <div className="owner-menu-page__dish" key={dish.id}>
                        <div className="owner-menu-page__dish-info">
                          <span className="owner-menu-page__dish-name">
                            {dish.title}
                          </span>
                          <span className="owner-menu-page__dish-price">
                            {formatPrice(dish.price)}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`owner-menu-page__switch${
                            dish.isActive
                              ? ' owner-menu-page__switch--active'
                              : ''
                          }`}
                          disabled={togglingId === dish.id}
                          aria-label={
                            dish.isActive
                              ? `Hide ${dish.title} from the menu`
                              : `Show ${dish.title} on the menu`
                          }
                          onClick={() => void handleToggle(dish)}
                        >
                          <span />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ),
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default OwnerMenuPage
