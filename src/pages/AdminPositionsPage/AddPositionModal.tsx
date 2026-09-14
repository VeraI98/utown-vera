import { useState } from 'react'

import type { DishCategoryResponse } from '../../types/restaurant'

interface AddPositionModalProps {
  categories: DishCategoryResponse[]
  onSave: (input: {
    title: string
    description: string
    price: number
    dishCategoryId: number
  }) => Promise<void>
  onCancel: () => void
}

function AddPositionModal({
  categories,
  onSave,
  onCancel,
}: AddPositionModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState(
    categories[0] ? String(categories[0].id) : '',
  )
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
    } catch {
      setError('Could not add the position')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="admin-positions-page__modal-overlay"
      onClick={onCancel}
    >
      <div
        className="admin-positions-page__modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Add position</h2>

        <div className="admin-positions-page__modal-field">
          <label htmlFor="position-title">Name</label>
          <input
            id="position-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter name"
          />
        </div>

        <div className="admin-positions-page__modal-field">
          <label htmlFor="position-description">Description</label>
          <textarea
            id="position-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="admin-positions-page__modal-field">
          <label htmlFor="position-price">Price</label>
          <input
            id="position-price"
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0"
          />
        </div>

        <div className="admin-positions-page__modal-field">
          <label htmlFor="position-category">Category</label>
          <select
            id="position-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.length === 0 && (
              <option value="">No categories yet</option>
            )}

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="admin-positions-page__modal-error">{error}</p>
        )}

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
            disabled={isSaving || categories.length === 0}
            onClick={handleSave}
          >
            {isSaving ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddPositionModal
