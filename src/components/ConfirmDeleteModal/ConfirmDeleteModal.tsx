import './ConfirmDeleteModal.css'

interface ConfirmDeleteModalProps {
  title: string
  isDeleting: boolean
  error: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  pendingLabel?: string
}

function ConfirmDeleteModal({
  title,
  isDeleting,
  error,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  pendingLabel = 'Deleting...',
}: ConfirmDeleteModalProps) {
  return (
    <div className="confirm-delete-modal__overlay" onClick={onCancel}>
      <div
        className="confirm-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="confirm-delete-modal__title">{title}</h2>

        {error && <p className="confirm-delete-modal__error">{error}</p>}

        <button
          className="confirm-delete-modal__delete-button"
          type="button"
          disabled={isDeleting}
          onClick={onConfirm}
        >
          {isDeleting ? pendingLabel : confirmLabel}
        </button>

        <button
          className="confirm-delete-modal__cancel-button"
          type="button"
          disabled={isDeleting}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
