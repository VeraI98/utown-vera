import ApiImage from '../../components/ApiImage/ApiImage'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import backButtonIcon from '../../assets/food-menu/Back button.svg'
import bellIcon from '../../assets/food-menu/bell.svg'
import foodLogo from '../../assets/food-menu/food.svg'
import utLogo from '../../assets/food-menu/ut.svg'
import { getCategoryById } from '../../services/categoryService'
import { getDishesByCategory } from '../../services/dishService'
import type { DishResponse } from '../../types/restaurant'
import { logError } from '../../utils/logger'

import './FoodCategoryPage.css'

interface DishImageProps {
  src?: string | null
  alt: string
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('en-US')} won`
}

function isValidImageUrl(imageUrl?: string | null): boolean {
  if (!imageUrl) {
    return false
  }

  const value = imageUrl.trim()

  if (!value) {
    return false
  }

  const invalidValues = [
    'string',
    'null',
    'undefined',
    'file uploaded successfully',
  ]

  return !invalidValues.includes(value.toLowerCase())
}

function DishImage({ src, alt }: DishImageProps) {
  const [hasError, setHasError] = useState(false)
  const canShowImage = isValidImageUrl(src) && !hasError

  if (!canShowImage) {
    return (
      <div
        className="food-category-dish-placeholder"
        aria-label="Dish image unavailable"
      >
        🍽️
      </div>
    )
  }

  return (
    <ApiImage
      className="food-category-dish-image"
      src={src ?? undefined}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}

function FoodCategoryPage() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const numericCategoryId = Number(categoryId)

  const isValidCategoryId =
    Number.isInteger(numericCategoryId) && numericCategoryId > 0

  const [dishes, setDishes] = useState<DishResponse[]>([])
  const [categoryName, setCategoryName] = useState('Category')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isValidCategoryId) {
      return
    }

    let isMounted = true

    const loadData = async () => {
      try {
        const [categoryResult, dishesResult] = await Promise.allSettled([
          getCategoryById(numericCategoryId),
          getDishesByCategory(numericCategoryId, 0, 100),
        ])

        if (!isMounted) {
          return
        }

        if (categoryResult.status === 'fulfilled') {
          setCategoryName(categoryResult.value.name || 'Category')
        }

        if (dishesResult.status === 'rejected') {
          throw dishesResult.reason
        }

        const activeDishes = (dishesResult.value.content ?? []).filter(
          (dish) => dish.isActive !== false && dish.isDeleted !== true,
        )

        setDishes(activeDishes)
        setErrorMessage('')

        if (activeDishes.length > 0 && activeDishes[0].categoryName) {
          setCategoryName(activeDishes[0].categoryName)
        }
      } catch (error) {
        logError('FoodCategoryPage: failed to load category dishes', error)

        if (!isMounted) {
          return
        }

        setDishes([])
        setErrorMessage(
          getErrorMessage(error, 'Failed to load dishes.', {
            404: 'Category not found.',
          }),
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [isValidCategoryId, numericCategoryId])

  const handleDishClick = (dish: DishResponse) => {
    navigate(`/food/restaurants/${dish.restaurantId}`)
  }

  if (!isValidCategoryId) {
    return (
      <main className="food-category-page">
        <section className="food-category-screen">
          <div className="food-category-error-page">
            <h1>Invalid category</h1>

            <button
              type="button"
              onClick={() =>
                navigate('/food', {
                  replace: true,
                })
              }
            >
              Return to Food
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="food-category-page">
      <section className="food-category-screen">
        <header className="food-category-header">
          <button
            className="food-category-header-button"
            type="button"
            onClick={() => navigate('/food')}
            aria-label="Go back"
          >
            <img src={backButtonIcon} alt="" aria-hidden="true" />
          </button>

          <Link to="/" className="food-category-logo" aria-label="Go to home">
            <img src={utLogo} alt="UT" />
            <img src={foodLogo} alt="Food" />
          </Link>

          <button
            className="food-category-header-button"
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <img src={bellIcon} alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="food-category-content">
          <h1>{categoryName}</h1>

          {errorMessage && (
            <div className="food-category-error" role="alert">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="food-category-loading" role="status">
              <div className="food-category-spinner" aria-hidden="true" />
              <p>Loading dishes...</p>
            </div>
          ) : dishes.length > 0 ? (
            <div className="food-category-dishes-list">
              {dishes.map((dish) => (
                <button
                  className="food-category-dish"
                  type="button"
                  key={dish.id}
                  onClick={() => handleDishClick(dish)}
                >
                  <div className="food-category-dish-image-wrapper">
                    <DishImage src={dish.imageUrl} alt={dish.title} />
                  </div>

                  <div className="food-category-dish-info">
                    <div className="food-category-dish-top">
                      <h2>{dish.title}</h2>
                      <strong>{formatPrice(dish.price)}</strong>
                    </div>

                    {dish.description && (
                      <p className="food-category-dish-description">
                        {dish.description}
                      </p>
                    )}

                    <p className="food-category-dish-restaurant">
                      {dish.restaurantName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            !errorMessage && (
              <div className="food-category-empty">
                <p>No dishes available in this category.</p>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  )
}

export default FoodCategoryPage
