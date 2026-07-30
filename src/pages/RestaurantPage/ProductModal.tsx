import { useState } from 'react'

import type { RestaurantProduct } from './restaurantData'
import { formatPrice } from './restaurantData'

import './ProductModal.css'

interface ProductModalProps {
  product: RestaurantProduct
  onClose: () => void
  onAddToOrder: (
    product: RestaurantProduct,
    quantity: number,
  ) => void
}

function ProductModal({
  product,
  onClose,
  onAddToOrder,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] =
    useState('no-options')

  const increaseQuantity = () => {
    setQuantity((currentQuantity) => currentQuantity + 1)
  }

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1),
    )
  }

  const handleAddToOrder = () => {
    onAddToOrder(product, quantity)
  }

  return (
    <div
      className="product-modal__overlay"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="product-modal__image-wrapper">
          <img
            className="product-modal__image"
            src={product.image}
            alt={product.name}
          />

          <button
            className="product-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Close product"
          >
            ×
          </button>
        </div>

        <div className="product-modal__information">
          <h2 id="product-modal-title">{product.name}</h2>

          <span className="product-modal__price">
            {formatPrice(product.price)}
          </span>

          <p>{product.description}</p>
        </div>

        <div className="product-modal__options">
          <h3>Select option</h3>
          <span>Mandatory item</span>

          <label className="product-modal__option">
            <input
              type="radio"
              name="portion"
              value="no-options"
              checked={selectedOption === 'no-options'}
              onChange={(event) =>
                setSelectedOption(event.target.value)
              }
            />

            <span>No options</span>
            <small>+ 0 won</small>
          </label>

          <label className="product-modal__option">
            <input
              type="radio"
              name="portion"
              value="large"
              checked={selectedOption === 'large'}
              onChange={(event) =>
                setSelectedOption(event.target.value)
              }
            />

            <span>Large portion</span>
            <small>+ 1,000 won</small>
          </label>

          <label className="product-modal__option">
            <input
              type="radio"
              name="portion"
              value="small"
              checked={selectedOption === 'small'}
              onChange={(event) =>
                setSelectedOption(event.target.value)
              }
            />

            <span>Small portion</span>
            <small>+ 500 won</small>
          </label>
        </div>

        <div className="product-modal__footer">
          <div className="product-modal__quantity">
            <button
              type="button"
              onClick={decreaseQuantity}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={increaseQuantity}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className="product-modal__add-button"
            type="button"
            onClick={handleAddToOrder}
          >
            Add to order
          </button>
        </div>
      </section>
    </div>
  )
}

export default ProductModal