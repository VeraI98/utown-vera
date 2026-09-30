import ApiImage from '../../components/ApiImage/ApiImage'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useToast } from '../../components/Toast/useToast'
import {
  createDish,
  createDishOption,
  deactivateDish,
} from '../../services/adminDishService'
import { getCategoriesByRestaurant } from '../../services/categoryService'
import { uploadFile } from '../../services/fileService'
import type { DishCategoryResponse } from '../../types/restaurant'
import { logError } from '../../utils/logger'

import './AdminPositionAddPage.css'

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

function AdminPositionAddPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { establishmentId } = useParams()
  const restaurantId = Number(establishmentId)
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

  const [categories, setCategories] = useState<DishCategoryResponse[]>([])
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

          if (data.content[0]) {
            setCategoryId(String(data.content[0].id))
          }
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

      const dish = await createDish({
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        sort: sort ? Number(sort) : undefined,
        imageUrl,
        restaurantId,
        dishCategoryId: Number(categoryId),
      })

      const filledOptions = options.filter((option) => option.name.trim())

      if (filledOptions.length > 0) {
        try {
          await createDishOption(dish.id, {
            name: 'Options',
            elements: filledOptions.map((option) => ({
              name: option.name.trim(),
              price: option.price ? Number(option.price) : 0,
            })),
          })
        } catch (optionsError) {
          logError('Failed to save options:', optionsError)
        }
      }

      if (putOnHold) {
        try {
          await deactivateDish(dish.id)
        } catch (holdError) {
          logError('Failed to put dish on hold:', holdError)
        }
      }

      showToast('Позиция добавлена', 'success')
      navigate(`/admin/establishments/${restaurantId}/positions`)
    } catch (submitError) {
      logError('Failed to add position:', submitError)
      showToast('Не удалось добавить позицию. Попробуйте ещё раз', 'error')
      setError('Не удалось добавить позицию. Попробуйте ещё раз')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-position-add-page">
      <h1>Add Position</h1>

      <p className="admin-position-add-page__breadcrumb">
        <span
          className="admin-position-add-page__breadcrumb-link"
          onClick={() => navigate('/admin/establishments')}
        >
          Establishments
        </span>{' '}
        /{' '}
        <span
          className="admin-position-add-page__breadcrumb-link"
          onClick={() =>
            navigate(`/admin/establishments/${restaurantId}/positions`)
          }
        >
          Positions
        </span>{' '}
        / Add
      </p>

      <form className="admin-position-add-page__card" onSubmit={handleSubmit}>
        <div className="admin-position-add-page__photo">
          <button
            type="button"
            className="admin-position-add-page__photo-upload"
            onClick={handlePhotoClick}
          >
            {photoPreview ? (
              <ApiImage src={photoPreview} alt="" />
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

          <div className="admin-position-add-page__photo-fill" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="admin-position-add-page__photo-input"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="admin-position-add-page__field">
          <label>Position Name</label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter name"
          />
        </div>

        <div className="admin-position-add-page__field">
          <label>Description</label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="admin-position-add-page__field">
          <label>Price</label>

          <input
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price"
          />
        </div>

        <div className="admin-position-add-page__field">
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

        <div className="admin-position-add-page__field">
          <label>Priority</label>

          <input
            type="number"
            min="0"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          />
        </div>

        <div className="admin-position-add-page__field">
          <label className="admin-position-add-page__options-title">
            Options
          </label>

          {options.map((option, index) => (
            <div className="admin-position-add-page__option-row" key={index}>
              <input
                className="admin-position-add-page__option-name"
                type="text"
                value={option.name}
                onChange={(event) =>
                  handleOptionChange(index, 'name', event.target.value)
                }
                placeholder={`Option ${index + 1}`}
              />

              <input
                className="admin-position-add-page__option-price"
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

        <div className="admin-position-add-page__field">
          <div className="admin-position-add-page__hold-row">
            <div className="admin-position-add-page__hold-text">
              <label>Put on Hold</label>

              <p className="admin-position-add-page__hold-hint">
                The dish remains on the menu but is unavailable for order
              </p>
            </div>

            <button
              type="button"
              className={`admin-position-add-page__switch${
                putOnHold ? ' admin-position-add-page__switch--active' : ''
              }`}
              onClick={() => setPutOnHold((current) => !current)}
              aria-label="Put on hold"
            >
              <span />
            </button>
          </div>
        </div>

        {error && <p className="admin-position-add-page__error">{error}</p>}

        <div className="admin-position-add-page__actions">
          <button
            type="button"
            className="admin-position-add-page__cancel-button"
            onClick={() =>
              navigate(`/admin/establishments/${restaurantId}/positions`)
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-position-add-page__save-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminPositionAddPage
