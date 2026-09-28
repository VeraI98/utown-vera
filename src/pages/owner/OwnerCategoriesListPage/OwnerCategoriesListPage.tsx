import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import { getCategoriesByRestaurant } from '../../../services/categoryService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import type { DishCategoryResponse } from '../../../types/restaurant'
import { getErrorMessage } from '../../../utils/getErrorMessage'
import { logError } from '../../../utils/logger'

import './OwnerCategoriesListPage.css'

function OwnerCategoriesListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id

  const [categories, setCategories] = useState<DishCategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true

    const loadCategories = async () => {
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

        const data = await getCategoriesByRestaurant(restaurant.id)

        if (!isMounted) {
          return
        }

        setCategories(
          [...data.content].sort((first, second) => first.sort - second.sort),
        )
      } catch (error) {
        logError('OwnerCategoriesListPage: failed to load categories', error)

        if (isMounted) {
          setCategories([])
          setErrorMessage(getErrorMessage(error, 'Failed to load categories.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [userId, reloadKey])

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  const showEmptyState = !isLoading && !errorMessage && categories.length === 0

  return (
    <main className="owner-categories-list-page">
      <div className="owner-categories-list-page__content">
        <h1>Categories</h1>

        {isLoading && (
          <p className="owner-categories-list-page__message">Loading...</p>
        )}

        {!isLoading && errorMessage && (
          <p className="owner-categories-list-page__error" role="alert">
            {errorMessage}
            <button
              className="owner-categories-list-page__retry"
              type="button"
              onClick={handleRetry}
            >
              Retry
            </button>
          </p>
        )}

        {showEmptyState && (
          <p className="owner-categories-list-page__message">
            No categories yet.
          </p>
        )}

        {!isLoading && !errorMessage && categories.length > 0 && (
          <div className="owner-categories-list-page__list">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="owner-categories-list-page__row"
                onClick={() => navigate(`../${category.id}/edit`)}
              >
                <span>{category.name}</span>
                <span className="owner-categories-list-page__edit">Edit</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default OwnerCategoriesListPage
