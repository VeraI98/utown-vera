import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import { getCategoriesByRestaurant } from '../../../services/categoryService'

import { getOwnerDishes } from '../../../services/ownerDishService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import type {
  DishCategoryResponse,
  DishResponse,
} from '../../../types/restaurant'
import { getErrorMessage } from '../../../utils/getErrorMessage'
import { logError } from '../../../utils/logger'

import DishCategoryList from '../components/DishCategoryList/DishCategoryList'

import './OwnerDeletedDishesPage.css'

function OwnerDeletedDishesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id

  const [categories, setCategories] = useState<DishCategoryResponse[]>([])
  const [dishes, setDishes] = useState<DishResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

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
          getOwnerDishes(restaurant.id, 'deleted'),
          getCategoriesByRestaurant(restaurant.id),
        ])

        if (!isMounted) {
          return
        }

        setDishes(dishesData.filter((dish) => dish.isDeleted))
        setCategories(categoriesData.content)
      } catch (error) {
        logError('OwnerDeletedDishesPage: failed to load dishes', error)

        if (isMounted) {
          setDishes([])
          setCategories([])
          setErrorMessage(getErrorMessage(error, 'Failed to load dishes.'))
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

  const showEmptyState = !isLoading && !errorMessage && dishes.length === 0

  return (
    <main className="owner-deleted-dishes-page">
      <div className="owner-deleted-dishes-page__content">
        <h1>Deleted</h1>

        {isLoading && (
          <p className="owner-deleted-dishes-page__message">Loading...</p>
        )}

        {!isLoading && errorMessage && (
          <p className="owner-deleted-dishes-page__error" role="alert">
            {errorMessage}
            <button
              className="owner-deleted-dishes-page__retry"
              type="button"
              onClick={handleRetry}
            >
              Retry
            </button>
          </p>
        )}

        {showEmptyState && (
          <p className="owner-deleted-dishes-page__message">
            No deleted dishes.
          </p>
        )}

        {!isLoading && !errorMessage && dishes.length > 0 && (
          <>
            <p className="owner-deleted-dishes-page__hint">
              Restoring a deleted dish isn't available yet.
            </p>

            <DishCategoryList
              categories={categories}
              dishes={dishes}
              toggleLabel={() => 'Restore (coming soon)'}
              isToggleOn={() => false}
              onToggle={() => {}}
              togglingId={-1}
              onEdit={(dish) => navigate(`/owner/menu/${dish.id}/edit`)}
              emptyMessage="No deleted dishes."
            />
          </>
        )}
      </div>
    </main>
  )
}

export default OwnerDeletedDishesPage
