import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import {
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from '../../../services/categoryService'
import { uploadFile } from '../../../services/fileService'
import { getOwnerRestaurants } from '../../../services/ownerRestaurantService'
import { logError } from '../../../utils/logger'

import './OwnerCategoryFormPage.css'

const DEFAULT_DELETE_ERROR =
  'The category cannot be deleted while it has active items'

function getErrorMessage(error: unknown, fallback: string): string {
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

  return fallback
}

function OwnerCategoryFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { categoryId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userId = user?.id
  const isEditMode = Boolean(categoryId)

  const [restaurantId, setRestaurantId] = useState<number | null>(null)

  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [sort, setSort] = useState('1')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState('')

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true

    const load = async () => {
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

        if (categoryId) {
          const category = await getCategoryById(Number(categoryId))

          if (!isMounted) {
            return
          }

          setName(category.name)
          setSort(String(category.sort))
          setExistingImageUrl(category.imageUrl)
        }
      } catch (error) {
        logError('OwnerCategoryFormPage: failed to load', error)

        if (isMounted) {
          setErrorMessage(getErrorMessage(error, 'Failed to load category.'))
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
  }, [userId, categoryId])

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

  const isSaveDisabled = isSaving || !name.trim() || !sort.trim()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isSaveDisabled) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      let imageUrl = existingImageUrl ?? undefined

      if (imageFile) {
        imageUrl = await uploadFile(imageFile)
      }

      const parsedSort = Number(sort.trim())

      if (isEditMode && categoryId) {
        await updateCategory(Number(categoryId), {
          name: name.trim(),
          sort: parsedSort,
          imageUrl,
        })
      } else {
        if (!restaurantId) {
          setErrorMessage('No restaurant found.')
          return
        }

        await createCategory({
          name: name.trim(),
          sort: parsedSort,
          imageUrl,
          restaurantId,
        })
      }

      navigate(-1)
    } catch (error) {
      logError('OwnerCategoryFormPage: failed to save category', error)

      setErrorMessage(getErrorMessage(error, 'Failed to save category.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteBlockedMessage('')
    setIsDeleteConfirmOpen(true)
  }

  const handleCancelDelete = () => {
    if (isDeleting) {
      return
    }

    setIsDeleteConfirmOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!categoryId || isDeleting) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteCategory(Number(categoryId))

      navigate(-1)
    } catch (error) {
      logError('OwnerCategoryFormPage: failed to delete category', error)

      setIsDeleteConfirmOpen(false)
      setDeleteBlockedMessage(getErrorMessage(error, DEFAULT_DELETE_ERROR))
    } finally {
      setIsDeleting(false)
    }
  }

  const previewSrc = imagePreview ?? existingImageUrl ?? null

  if (isLoading) {
    return (
      <main className="owner-category-form-page">
        <p className="owner-category-form-page__message">Loading...</p>
      </main>
    )
  }

  return (
    <main className="owner-category-form-page">
      <form
        className="owner-category-form-page__content"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <h1>{isEditMode ? 'Edit category' : 'Add new category'}</h1>

        {errorMessage && (
          <p className="owner-category-form-page__error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="owner-category-form-page__field">
          <label>Category name</label>
          <input
            type="text"
            value={name}
            placeholder="Category name"
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="owner-category-form-page__field">
          <label>Category image</label>

          <button
            type="button"
            className="owner-category-form-page__upload"
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
            className="owner-category-form-page__file-input"
            onChange={handleImageChange}
          />
        </div>

        <div className="owner-category-form-page__field">
          <label>Priority</label>
          <input
            type="number"
            min="1"
            value={sort}
            placeholder="1"
            onChange={(event) => setSort(event.target.value)}
          />
        </div>

        <div className="owner-category-form-page__actions">
          <button
            type="submit"
            className="owner-category-form-page__save"
            disabled={isSaveDisabled}
          >
            {isSaving
              ? 'Saving...'
              : isEditMode
                ? 'Save changes'
                : 'Add new category'}
          </button>

          {isEditMode && (
            <button
              type="button"
              className="owner-category-form-page__delete"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {isDeleteConfirmOpen && (
        <div className="owner-category-form-page__modal-overlay">
          <button
            type="button"
            className="owner-category-form-page__modal-backdrop"
            aria-label="Close"
            disabled={isDeleting}
            onClick={handleCancelDelete}
          />

          <div className="owner-category-form-page__modal">
            <p className="owner-category-form-page__modal-title">
              Delete category?
            </p>

            <button
              type="button"
              className="owner-category-form-page__modal-delete"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>

            <button
              type="button"
              className="owner-category-form-page__modal-cancel"
              disabled={isDeleting}
              onClick={handleCancelDelete}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {deleteBlockedMessage && (
        <div className="owner-category-form-page__modal-overlay">
          <button
            type="button"
            className="owner-category-form-page__modal-backdrop"
            aria-label="Close"
            onClick={() => setDeleteBlockedMessage('')}
          />

          <div className="owner-category-form-page__modal">
            <p className="owner-category-form-page__modal-title">Deleting</p>

            <p className="owner-category-form-page__modal-text">
              {deleteBlockedMessage}
            </p>

            <button
              type="button"
              className="owner-category-form-page__modal-cancel"
              onClick={() => setDeleteBlockedMessage('')}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default OwnerCategoryFormPage
