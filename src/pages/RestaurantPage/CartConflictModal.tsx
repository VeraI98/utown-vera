import './CartConflictModal.css'

interface CartConflictModalProps {
  isLoading: boolean
  onCancel: () => void
  onReplace: () => void
}

function CartConflictModal({
  isLoading,
  onCancel,
  onReplace,
}: CartConflictModalProps) {
  return (
    <div
      className="cart-conflict-modal__overlay"
      role="presentation"
      onClick={onCancel}
    >
      <section
        className="cart-conflict-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-conflict-modal-title"
        aria-describedby="cart-conflict-modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="cart-conflict-modal-title">
          Start a new cart?
        </h2>

        <p id="cart-conflict-modal-description">
          Your cart contains items from another restaurant.
          Starting a new cart will remove those items.
        </p>

        <div className="cart-conflict-modal__actions">
          <button
            className="cart-conflict-modal__button cart-conflict-modal__button--cancel"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            className="cart-conflict-modal__button cart-conflict-modal__button--replace"
            type="button"
            onClick={onReplace}
            disabled={isLoading}
          >
            {isLoading ? 'Replacing...' : 'Replace cart'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default CartConflictModal