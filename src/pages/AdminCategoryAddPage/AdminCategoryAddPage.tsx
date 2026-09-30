import ApiImage from '../../components/ApiImage/ApiImage'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './AdminCategoryAddPage.css'
import { useToast } from '../../components/Toast/useToast'
import { createCategory } from '../../services/categoryService'
import { uploadFile } from '../../services/fileService'

function AdminCategoryAddPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { establishmentId } = useParams()
  const restaurantId = Number(establishmentId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [sort, setSort] = useState('1')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  function validate(): string | null {
    if (!name.trim()) {
      return 'Введите название категории'
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

      await createCategory({
        name: name.trim(),
        sort: sort ? Number(sort) : undefined,
        imageUrl,
        restaurantId,
      })

      showToast('Категория добавлена', 'success')
      navigate(`/admin/establishments/${restaurantId}/categories`)
    } catch {
      showToast('Не удалось добавить категорию. Попробуйте ещё раз', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-category-add-page">
      <h1>Add Category</h1>
      <p className="admin-category-add-page__breadcrumb">
        <span
          className="admin-category-add-page__breadcrumb-link"
          onClick={() => navigate('/admin/establishments')}
        >
          Establishments
        </span>{' '}
        /{' '}
        <span
          className="admin-category-add-page__breadcrumb-link"
          onClick={() =>
            navigate(`/admin/establishments/${restaurantId}/positions`)
          }
        >
          Positions
        </span>{' '}
        / Add Category
      </p>

      <form className="admin-category-add-page__card" onSubmit={handleSubmit}>
        <div className="admin-category-add-page__photo">
          <button
            type="button"
            className="admin-category-add-page__photo-upload"
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
          <div className="admin-category-add-page__photo-fill" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="admin-category-add-page__photo-input"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="admin-category-add-page__field">
          <label>Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
          />
        </div>

        <div className="admin-category-add-page__field">
          <label>Priority</label>
          <input
            type="number"
            min="0"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          />
        </div>

        {error && <p className="admin-category-add-page__error">{error}</p>}

        <div className="admin-category-add-page__actions">
          <button
            type="button"
            className="admin-category-add-page__cancel-button"
            onClick={() =>
              navigate(`/admin/establishments/${restaurantId}/categories`)
            }
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-category-add-page__save-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminCategoryAddPage
