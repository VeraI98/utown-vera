import './ConfirmDeleteModal.css'

interface ConfirmDeleteModalProps {
  title: string
  isDeleting: boolean
  error: string
  onConfirm: () => void
  onCancel: () => void
  /** Defaults to "Delete" / "Deleting..." so existing delete-only callers
   * don't need to change. Pass these to reuse the modal for a different
   * action (e.g. Block/Unblock). */
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
