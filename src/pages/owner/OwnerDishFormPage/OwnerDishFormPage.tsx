import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import { getCategoriesByRestaurant } from '../../../services/categoryService'
import { getDishById } from '../../../services/dishService'
import { uploadFile } from '../../../services/fileService'

import {
  activateOwnerDish,
  createOwnerDish,
  deactivateOwnerDish,
  deleteOwnerDish,
  updateOwnerDish,
} from '../../../services/ownerDishService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import type {
  DishCategoryResponse,
  DishOption,
} from '../../../types/restaurant'
import { getErrorMessage } from '../../../utils/getErrorMessage'
import { logError } from '../../../utils/logger'

import './OwnerDishFormPage.css'

function OwnerDishFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { dishId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userId = user?.id
  const isEditMode = Boolean(dishId)

  const [restaurantId, setRestaurantId] = useState<number | null>(null)
  const [restaurantName, setRestaurantName] = useState('')
  const [options, setOptions] = useState<DishOption[]>([])
  const [categories, setCategories] = useState<DishCategoryResponse[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('')
  const [isOnHold, setIsOnHold] = useState(false)

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true

    const load = async () => {
      try {
        const restaurants = await getOwnerRestaurants(userId)
        const dish = dishId ? await getDishById(Number(dishId)) : null
        const restaurant = dish
          ? restaurants.find((item) => item.id === dish.restaurantId)
          : restaurants[0]

        if (!restaurant) {
          if (isMounted) {
            setErrorMessage('No restaurant found.')
          }
          return
        }

        if (isMounted) {
          setRestaurantId(restaurant.id)
          setRestaurantName(restaurant.title)
        }

        const categoriesData = await getCategoriesByRestaurant(restaurant.id)

        if (!isMounted) {
          return
        }

        setCategories(
          [...categoriesData.content].sort(
            (first, second) => first.sort - second.sort,
          ),
        )

        if (dish) {
          if (!isMounted) {
            return
          }

          setTitle(dish.title)
          setOptions(dish.options ?? [])
          setDescription(dish.description ?? '')
          setExistingImageUrl(dish.imageUrl)
          setPrice(String(dish.price))
          setCategoryId(String(dish.dishCategoryId))
          setSort(String(dish.sort))
          setIsOnHold(!dish.isActive)
        }
      } catch (error) {
        logError('OwnerDishFormPage: failed to load', error)

        if (isMounted) {
          setErrorMessage(getErrorMessage(error, 'Failed to load dish.'))
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
  }, [userId, dishId])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const parsedPrice = Number(price)
  const isPriceValid =
    price.trim() !== '' && Number.isFinite(parsedPrice) && parsedPrice >= 0

  const isSaveDisabled =
    isSaving || !title.trim() || !categoryId || !isPriceValid

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isSaveDisabled || !restaurantId) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      let imageUrl = existingImageUrl ?? undefined

      if (imageFile) {
        imageUrl = await uploadFile(imageFile)
      }

      const parsedSort = sort.trim() ? Number(sort.trim()) : undefined

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        price: parsedPrice,
        sort: parsedSort,
        imageUrl,
        dishCategoryId: Number(categoryId),
      }

      const dish =
        isEditMode && dishId
          ? await updateOwnerDish(Number(dishId), payload)
          : await createOwnerDish({ ...payload, restaurantId })

      if (isOnHold && dish.isActive) {
        await deactivateOwnerDish(dish.id)
      } else if (!isOnHold && !dish.isActive) {
        await activateOwnerDish(dish.id)
      }

      navigate('/owner/menu')
    } catch (error) {
      logError('OwnerDishFormPage: failed to save dish', error)

      setErrorMessage(getErrorMessage(error, 'Failed to save dish.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!dishId) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      await deleteOwnerDish(Number(dishId))

      navigate('/owner/menu')
    } catch (error) {
      logError('OwnerDishFormPage: failed to delete dish', error)

      setErrorMessage(getErrorMessage(error, 'Failed to delete dish.'))
      setIsSaving(false)
    }
  }

  const previewSrc = imagePreview ?? existingImageUrl ?? null

  if (isLoading) {
    return (
      <main className="owner-dish-form-page">
        <p className="owner-dish-form-page__message">Loading...</p>
      </main>
    )
  }

  return (
    <main className="owner-dish-form-page">
      <form
        className="owner-dish-form-page__content"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <h1>{isEditMode ? 'Edit dish' : 'Add dish'}</h1>

        {errorMessage && (
          <p className="owner-dish-form-page__error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="owner-dish-form-page__field">
          <label>Name</label>
          <input
            type="text"
            value={title}
            placeholder="Dish name"
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="owner-dish-form-page__field">
          <label>Description</label>
          <textarea
            value={description}
            placeholder="Write the dish composition."
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="owner-dish-form-page__field">
          <label>Product image</label>

          <button
            type="button"
            className="owner-dish-form-page__upload"
            onClick={handleImageClick}
          >
            {previewSrc ? (
              <img src={previewSrc} alt="" />
            ) : (
              <span>Upload image</span>
            )}

            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M12 15V4m0 0L7 9m5-5l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="owner-dish-form-page__file-input"
            onChange={handleImageChange}
          />
        </div>

        <div className="owner-dish-form-page__field">
          <label>Price</label>
          <input
            type="number"
            min="0"
            value={price}
            placeholder="Dish price"
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>

        <section
          className="owner-dish-form-page__field"
          aria-labelledby="dish-options-label"
        >
          <h2
            id="dish-options-label"
            className="owner-dish-form-page__field-title"
          >
            Options
          </h2>
          {Array.from(
            {
              length: Math.max(
                4,
                options.flatMap((option) => option.elements).length,
              ),
            },
            (_, index) => {
              const element = options.flatMap((option) => option.elements)[
                index
              ]
              return (
                <div
                  className="owner-dish-form-page__option-row"
                  key={element?.id ?? index}
                >
                  <div className="owner-dish-form-page__option-name">
                    <span
                      className="owner-dish-form-page__option-dot"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={element?.name ?? ''}
                      placeholder="Add option"
                      readOnly
                      aria-label={`Option ${index + 1} name`}
                    />
                  </div>
                  <input
                    type="text"
                    value={
                      element ? `+${element.price.toLocaleString('en-US')}` : ''
                    }
                    placeholder="Price"
                    readOnly
                    aria-label={`Option ${index + 1} price`}
                  />
                </div>
              )
            },
          )}
          <p className="owner-dish-form-page__note">
            Contact an administrator to add or edit options.
          </p>
        </section>

        <div className="owner-dish-form-page__field">
          <label>Category</label>

          <div className="owner-dish-form-page__category-row">
            <span
              className="owner-dish-form-page__option-dot"
              aria-hidden="true"
            />
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">Input text</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {!categoryId && (
            <p className="owner-dish-form-page__hint">Select category</p>
          )}
        </div>

        <div className="owner-dish-form-page__field">
          <label htmlFor="dish-establishment">Establishment</label>
          <select
            id="dish-establishment"
            value={restaurantId ?? ''}
            disabled
            aria-describedby="dish-establishment-note"
          >
            <option value={restaurantId ?? ''}>{restaurantName}</option>
          </select>
          <p
            id="dish-establishment-note"
            className="owner-dish-form-page__note"
          >
            {isEditMode
              ? 'This dish belongs to this establishment and cannot be moved.'
              : 'The dish will be added to this establishment.'}
          </p>
        </div>

        <div className="owner-dish-form-page__field">
          <label>Priority</label>
          <input
            type="number"
            min="1"
            value={sort}
            placeholder="4"
            onChange={(event) => setSort(event.target.value)}
          />
        </div>

        <div className="owner-dish-form-page__hold-row">
          <div className="owner-dish-form-page__hold-text">
            <span className="owner-dish-form-page__hold-title">
              Put on hold
            </span>
            <span className="owner-dish-form-page__hold-description">
              The dish remains on the menu but is not available for order
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isOnHold}
            aria-label="Put on hold"
            className={`owner-dish-form-page__switch${
              isOnHold ? ' owner-dish-form-page__switch--active' : ''
            }`}
            onClick={() => setIsOnHold((current) => !current)}
          >
            <span />
          </button>
        </div>

        <div className="owner-dish-form-page__actions">
          <button
            type="submit"
            className="owner-dish-form-page__save"
            disabled={isSaveDisabled}
          >
            {isSaving
              ? 'Saving...'
              : isEditMode
                ? 'Save changes'
                : 'Add to menu'}
          </button>

          {isEditMode && (
            <button
              type="button"
              className="owner-dish-form-page__delete"
              disabled={isSaving}
              onClick={() => void handleDelete()}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </main>
  )
}

export default OwnerDishFormPage
