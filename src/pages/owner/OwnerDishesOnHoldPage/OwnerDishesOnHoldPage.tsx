import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import { getCategoriesByRestaurant } from '../../../services/categoryService'

import {
  activateOwnerDish,
  getOwnerDishes,
} from '../../../services/ownerDishService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import type {
  DishCategoryResponse,
  DishResponse,
} from '../../../types/restaurant'
import { logError } from '../../../utils/logger'

import DishCategoryList from '../components/DishCategoryList/DishCategoryList'

import './OwnerDishesOnHoldPage.css'

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

  return 'Failed to load dishes.'
}

function OwnerDishesOnHoldPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id

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

    const load = async () => {
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

        const [dishesData, categoriesData] = await Promise.all([
          getOwnerDishes(restaurant.id),
          getCategoriesByRestaurant(restaurant.id),
        ])

        if (!isMounted) {
          return
        }

        setDishes(
          dishesData.filter((dish) => !dish.isDeleted && !dish.isActive),
        )
        setCategories(categoriesData.content)
      } catch (error) {
        logError('OwnerDishesOnHoldPage: failed to load dishes', error)

        if (isMounted) {
          setDishes([])
          setCategories([])
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [userId, reloadKey])

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  const handleRemoveFromHold = async (dish: DishResponse) => {
    if (togglingId) {
      return
    }

    setTogglingId(dish.id)
    setToggleError('')

    try {
      await activateOwnerDish(dish.id)

      setDishes((current) => current.filter((item) => item.id !== dish.id))
    } catch (error) {
      logError('OwnerDishesOnHoldPage: failed to remove from hold', error)
      setToggleError(getErrorMessage(error))
    } finally {
      setTogglingId(null)
    }
  }

  const showEmptyState = !isLoading && !errorMessage && dishes.length === 0

  return (
    <main className="owner-dishes-on-hold-page">
      <div className="owner-dishes-on-hold-page__content">
        <h1>Dishes on hold</h1>

        {isLoading && (
          <p className="owner-dishes-on-hold-page__message">Loading...</p>
        )}

        {!isLoading && errorMessage && (
          <p className="owner-dishes-on-hold-page__error" role="alert">
            {errorMessage}
            <button
              className="owner-dishes-on-hold-page__retry"
              type="button"
              onClick={handleRetry}
            >
              Retry
            </button>
          </p>
        )}

        {showEmptyState && (
          <p className="owner-dishes-on-hold-page__message">
            No dishes on hold.
          </p>
        )}

        {toggleError && (
          <p className="owner-dishes-on-hold-page__error" role="alert">
            {toggleError}
          </p>
        )}

        {!isLoading && !errorMessage && dishes.length > 0 && (
          <DishCategoryList
            categories={categories}
            dishes={dishes}
            toggleLabel={() => 'Remove from hold'}
            isToggleOn={() => true}
            onToggle={(dish) => void handleRemoveFromHold(dish)}
            togglingId={togglingId}
            onEdit={(dish) => navigate(`/owner/menu/${dish.id}/edit`)}
            emptyMessage="No dishes on hold."
          />
        )}
      </div>
    </main>
  )
}

export default OwnerDishesOnHoldPage
