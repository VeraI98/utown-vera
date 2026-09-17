import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Spinner from '../../components/Spinner/Spinner'
import { useToast } from '../../components/Toast/useToast'
import {
  activateDish,
  createDishOption,
  deactivateDish,
  deleteDishOption,
  updateDish,
  updateDishOption,
} from '../../services/adminDishService'
import { getCategoriesByRestaurant } from '../../services/categoryService'
import { getDishById } from '../../services/dishService'
import { uploadFile } from '../../services/fileService'
import type { DishCategoryResponse } from '../../types/restaurant'
import { logError } from '../../utils/logger'

import './AdminPositionEditPage.css'

const OPTION_ROWS = 7

interface OptionRow {
  name: string
  price: string
}

function buildEmptyOptions(): OptionRow[] {
  return Array.from({ length: OPTION_ROWS }, () => ({
    name: '',
    price: '',
  }))
}

function AdminPositionEditPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { establishmentId, positionId } = useParams()
  const restaurantId = Number(establishmentId)
  const dishId = Number(positionId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('1')
  const [options, setOptions] = useState<OptionRow[]>(buildEmptyOptions())
  const [putOnHold, setPutOnHold] = useState(false)
  const [existingOptionId, setExistingOptionId] = useState<number | null>(null)

  const [categories, setCategories] = useState<DishCategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      if (!restaurantId) {
        return
      }

      try {
        const data = await getCategoriesByRestaurant(restaurantId)

        if (isMounted) {
          setCategories(data.content)
        }
      } catch (categoriesError) {
        logError('Failed to load categories:', categoriesError)
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [restaurantId])

  useEffect(() => {
    let isMounted = true

    const loadDish = async () => {
      if (!dishId) {
        return
      }

      setIsLoading(true)
      setLoadError('')

      try {
        const dish = await getDishById(dishId)

        if (!isMounted) {
          return
        }

        setTitle(dish.title || '')
        setDescription(dish.description || '')
        setPrice(String(dish.price ?? ''))
        setCategoryId(String(dish.dishCategoryId))
        setSort(String(dish.sort ?? 1))
        setPhotoPreview(dish.imageUrl || null)
        setPutOnHold(!dish.isActive)

        const firstOption = dish.options?.[0]

        if (firstOption) {
          setExistingOptionId(firstOption.id)

          const filledOptions = firstOption.elements.map((element) => ({
            name: element.name,
            price: String(element.price ?? ''),
          }))

          setOptions(
            buildEmptyOptions().map(
              (empty, index) => filledOptions[index] ?? empty,
            ),
          )
        }
      } catch (requestError) {
        logError('Failed to load position:', requestError)

        if (isMounted) {
          setLoadError('Could not load the position')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDish()

    return () => {
      isMounted = false
    }
  }, [dishId])

  function handlePhotoClick() {
    fileInputRef.current?.click()
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleOptionChange(
    index: number,
    field: 'name' | 'price',
    value: string,
  ) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option,
      ),
    )
  }

  function validate(): string | null {
    if (!title.trim()) {
      return 'Введите название позиции'
    }

    const parsedPrice = Number(price)

    if (!price || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return 'Введите корректную цену'
    }

    if (!categoryId) {
      return 'Выберите категорию'
    }

    return null
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      let imageUrl: string | undefined

      if (photoFile) {
        imageUrl = await uploadFile(photoFile)
      }

      await updateDish(dishId, {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        sort: sort ? Number(sort) : undefined,
        imageUrl,
        dishCategoryId: Number(categoryId),
      })

      const filledOptions = options.filter((option) => option.name.trim())

      try {
        if (filledOptions.length > 0) {
          if (existingOptionId) {
            await updateDishOption(dishId, existingOptionId, {
              name: 'Options',
              elements: filledOptions.map((option) => ({
                name: option.name.trim(),
                price: option.price ? Number(option.price) : 0,
              })),
            })
          } else {
            await createDishOption(dishId, {
              name: 'Options',
              elements: filledOptions.map((option) => ({
                name: option.name.trim(),
                price: option.price ? Number(option.price) : 0,
              })),
            })
          }
        } else if (existingOptionId) {
          await deleteDishOption(dishId, existingOptionId)
        }
      } catch (optionsError) {
        logError('Failed to save options:', optionsError)
      }

      try {
        if (putOnHold) {
          await deactivateDish(dishId)
        } else {
          await activateDish(dishId)
        }
      } catch (holdError) {
        logError('Failed to update hold status:', holdError)
      }

      showToast('Изменения сохранены', 'success')
      navigate(`/admin/establishments/${restaurantId}/positions`)
    } catch (submitError) {
      logError('Failed to save position changes:', submitError)
      showToast('Не удалось сохранить изменения. Попробуйте ещё раз', 'error')
      setError('Не удалось сохранить изменения. Попробуйте ещё раз')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-position-edit-page">
        <h1>Edit Position</h1>
        <Spinner />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="admin-position-edit-page">
        <h1>Edit Position</h1>
        <p className="admin-position-edit-page__error">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="admin-position-edit-page">
      <h1>Edit Position</h1>

      <p className="admin-position-edit-page__breadcrumb">
        <span
          className="admin-position-edit-page__breadcrumb-link"
          onClick={() => navigate('/admin/establishments')}
        >
          Establishments
        </span>{' '}
        /{' '}
        <span
          className="admin-position-edit-page__breadcrumb-link"
          onClick={() =>
            navigate(`/admin/establishments/${restaurantId}/positions`)
          }
        >
          Positions
        </span>{' '}
        / {title || 'Position Name'} / Edit
      </p>

      <form className="admin-position-edit-page__card" onSubmit={handleSubmit}>
        <div className="admin-position-edit-page__photo">
          <button
            type="button"
            className="admin-position-edit-page__photo-upload"
            onClick={handlePhotoClick}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M12 15V4m0 0L7 9m5-5l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <div className="admin-position-edit-page__photo-fill" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="admin-position-edit-page__photo-input"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="admin-position-edit-page__field">
          <label>Position Name</label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="admin-position-edit-page__field">
          <label>Description</label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="admin-position-edit-page__field">
          <label>Price</label>

          <input
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>

        <div className="admin-position-edit-page__field">
          <label>Category</label>

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.length === 0 && (
              <option value="">Select category</option>
            )}

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-position-edit-page__field">
          <label>Priority</label>

          <input
            type="number"
            min="0"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          />
        </div>

        <div className="admin-position-edit-page__field">
          <label className="admin-position-edit-page__options-title">
            Options
          </label>

          {options.map((option, index) => (
            <div className="admin-position-edit-page__option-row" key={index}>
              <input
                className="admin-position-edit-page__option-name"
                type="text"
                value={option.name}
                onChange={(event) =>
                  handleOptionChange(index, 'name', event.target.value)
                }
                placeholder={`Option ${index + 1}`}
              />

              <input
                className="admin-position-edit-page__option-price"
                type="number"
                min="0"
                value={option.price}
                onChange={(event) =>
                  handleOptionChange(index, 'price', event.target.value)
                }
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="admin-position-edit-page__field">
          <div className="admin-position-edit-page__hold-row">
            <div className="admin-position-edit-page__hold-text">
              <label>Put on Hold</label>

              <p className="admin-position-edit-page__hold-hint">
                The dish remains on the menu but is unavailable for order.
              </p>
            </div>

            <button
              type="button"
              className={`admin-position-edit-page__switch${
                putOnHold ? ' admin-position-edit-page__switch--active' : ''
              }`}
              onClick={() => setPutOnHold((current) => !current)}
              aria-label="Put on hold"
            >
              <span />
            </button>
          </div>
        </div>

        {error && <p className="admin-position-edit-page__error">{error}</p>}

        <div className="admin-position-edit-page__actions">
          <button
            type="button"
            className="admin-position-edit-page__cancel-button"
            onClick={() =>
              navigate(`/admin/establishments/${restaurantId}/positions`)
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-position-edit-page__save-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminPositionEditPage
