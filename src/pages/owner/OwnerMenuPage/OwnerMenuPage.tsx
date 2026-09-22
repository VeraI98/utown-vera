import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import { getCategoriesByRestaurant } from '../../../services/categoryService'

import {
  activateOwnerDish,
  deactivateOwnerDish,
  getOwnerDishes,
} from '../../../services/ownerDishService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import type {
  DishCategoryResponse,
  DishResponse,
} from '../../../types/restaurant'
import { getErrorMessage } from '../../../utils/getErrorMessage'
import { logError } from '../../../utils/logger'

import DishCategoryList from '../components/DishCategoryList/DishCategoryList'

import './OwnerMenuPage.css'

function OwnerMenuPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id

  const [restaurantId, setRestaurantId] = useState<number | null>(null)

  const [categories, setCategories] = useState<DishCategoryResponse[]>([])
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

        const [dishesData, categoriesData] = await Promise.all([
          getOwnerDishes(restaurant.id),
          getCategoriesByRestaurant(restaurant.id),
        ])

        if (!isMounted) {
          return
        }

        setDishes(dishesData.filter((dish) => !dish.isDeleted))
        setCategories(categoriesData.content)
      } catch (error) {
        logError('OwnerMenuPage: failed to load menu', error)

        if (isMounted) {
          setDishes([])
          setCategories([])
          setErrorMessage(getErrorMessage(error, 'Failed to load the menu.'))
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
      setToggleError(getErrorMessage(error, 'Failed to load the menu.'))
    } finally {
      setTogglingId(null)
    }
  }

  const showEmptyState = !isLoading && !errorMessage && dishes.length === 0

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
          <DishCategoryList
            categories={categories}
            dishes={dishes}
            toggleLabel={(dish) =>
              dish.isActive ? 'Put on hold' : 'Remove from hold'
            }
            isToggleOn={(dish) => !dish.isActive}
            onToggle={(dish) => void handleToggle(dish)}
            togglingId={togglingId}
            onEdit={(dish) => navigate(`${dish.id}/edit`)}
            emptyMessage="No dishes yet."
          />
        )}
      </div>

      <div className="owner-menu-page__footer">
        <button
          type="button"
          className="owner-menu-page__edit-menu"
          onClick={() => navigate('edit')}
        >
          Edit Menu
        </button>
      </div>
    </main>
  )
}

export default OwnerMenuPage
