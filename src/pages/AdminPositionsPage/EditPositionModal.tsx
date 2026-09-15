import { useState } from 'react'

import type { DishCategoryResponse, DishResponse } from '../../types/restaurant'
import { logError } from '../../utils/logger'

interface EditPositionModalProps {
  dish: DishResponse
  categories: DishCategoryResponse[]
  onSave: (input: {
    title: string
    description: string
    price: number
    dishCategoryId: number
  }) => Promise<void>
  onCancel: () => void
}

function EditPositionModal({
  dish,
  categories,
  onSave,
  onCancel,
}: EditPositionModalProps) {
  const [title, setTitle] = useState(dish.title)
  const [description, setDescription] = useState(dish.description || '')
  const [price, setPrice] = useState(String(dish.price))
  const [categoryId, setCategoryId] = useState(String(dish.dishCategoryId))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const trimmedTitle = title.trim()
    const parsedPrice = Number(price)

    if (!trimmedTitle) {
      setError('Enter a position name')
      return
    }

    if (!price || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Enter a valid price')
      return
    }

    if (!categoryId) {
      setError('Select a category')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await onSave({
        title: trimmedTitle,
        description: description.trim(),
        price: parsedPrice,
        dishCategoryId: Number(categoryId),
      })
    } catch (saveError) {
      logError('EditPositionModal: failed to save position changes', saveError)

      setError('Could not save the changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="admin-positions-page__modal-overlay" onClick={onCancel}>
      <div
        className="admin-positions-page__modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Edit position</h2>

        <div className="admin-positions-page__modal-field">
          <label htmlFor="edit-position-title">Name</label>

          <input
            id="edit-position-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="admin-positions-page__modal-field">
          <label htmlFor="edit-position-description">Description</label>

          <textarea
            id="edit-position-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="admin-positions-page__modal-field">
          <label htmlFor="edit-position-price">Price</label>

          <input
            id="edit-position-price"
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>

        <div className="admin-positions-page__modal-field">
          <label htmlFor="edit-position-category">Category</label>

          <select
            id="edit-position-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="admin-positions-page__modal-error">{error}</p>}

        <div className="admin-positions-page__modal-actions">
          <button
            type="button"
            className="admin-positions-page__modal-cancel-button"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="admin-positions-page__modal-save-button"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditPositionModal
