import { useState } from 'react'

interface AddCategoryModalProps {
  onSave: (name: string) => Promise<void>
  onCancel: () => void
}

function AddCategoryModal({
  onSave,
  onCancel,
}: AddCategoryModalProps) {
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Enter a category name')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await onSave(trimmedName)
    } catch {
      setError('Could not add the category')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="admin-categories-page__modal-overlay"
      onClick={onCancel}
    >
      <div
        className="admin-categories-page__modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Add category</h2>

        <div className="admin-categories-page__modal-field">
          <label htmlFor="category-name">Name</label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter category name"
          />
        </div>

        {error && (
          <p className="admin-categories-page__modal-error">{error}</p>
        )}

        <div className="admin-categories-page__modal-actions">
          <button
            type="button"
            className="admin-categories-page__modal-cancel-button"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-categories-page__modal-save-button"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddCategoryModal
