import { useEffect, useMemo, useState } from 'react'

import type { RestaurantProduct } from './restaurantData'

import { formatPrice } from './restaurantData'

import './ProductModal.css'

interface ProductModalProps {
  product: RestaurantProduct
  onClose: () => void
  onAddToOrder: (
    product: RestaurantProduct,
    quantity: number,
    elementIds: number[],
  ) => void
}

type SelectedOptions = Record<number, number[]>

const INVALID_IMAGE_VALUES = [
  'string',
  'null',
  'undefined',
  'file uploaded successfully',
]

function isValidImageUrl(imageUrl?: string | null): boolean {
  if (!imageUrl) {
    return false
  }

  const value = imageUrl.trim()

  if (!value) {
    return false
  }

  return !INVALID_IMAGE_VALUES.includes(value.toLowerCase())
}

function ProductModal({ product, onClose, onAddToOrder }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})

  const [imageError, setImageError] = useState(false)

  const options = useMemo(() => product.options ?? [], [product.options])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const increaseQuantity = () => {
    setQuantity((currentQuantity) => currentQuantity + 1)
  }

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))
  }

  const toggleElement = (optionId: number, elementId: number, max: number) => {
    setSelectedOptions((currentSelections) => {
      const current = currentSelections[optionId] ?? []

      const isSelected = current.includes(elementId)

      if (max === 1) {
        return {
          ...currentSelections,
          [optionId]: [elementId],
        }
      }

      if (isSelected) {
        return {
          ...currentSelections,
          [optionId]: current.filter((id) => id !== elementId),
        }
      }

      if (max > 0 && current.length >= max) {
        return currentSelections
      }

      return {
        ...currentSelections,
        [optionId]: [...current, elementId],
      }
    })
  }

  const isSelectionValid = useMemo(() => {
    return options.every((option) => {
      const selectedCount = selectedOptions[option.id]?.length ?? 0

      const minimum = option.isRequired ? Math.max(1, option.min) : option.min

      if (selectedCount < minimum) {
        return false
      }

      if (option.max > 0 && selectedCount > option.max) {
        return false
      }

      return true
    })
  }, [options, selectedOptions])

  const selectedElementIds = useMemo(
    () => Object.values(selectedOptions).flat(),
    [selectedOptions],
  )

  const optionsPrice = useMemo(() => {
    let total = 0

    options.forEach((option) => {
      const selected = selectedOptions[option.id] ?? []

      option.elements.forEach((element) => {
        if (selected.includes(element.id)) {
          total += element.price
        }
      })
    })

    return total
  }, [options, selectedOptions])

  const totalPrice = (product.price + optionsPrice) * quantity

  const handleAddToOrder = () => {
    if (!isSelectionValid) {
      return
    }

    onAddToOrder(product, quantity, selectedElementIds)
  }

  const hasImage = isValidImageUrl(product.image) && !imageError

  return (
    <div
      className="product-modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        aria-describedby="product-modal-description"
      >
        <div className="product-modal__image-wrapper">
          {hasImage ? (
            <img
              className="product-modal__image"
              src={product.image ?? undefined}
              alt={product.name}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="product-modal__image product-modal__image--placeholder"
              aria-label="No product image"
            >
              No image
            </div>
          )}

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

          <p id="product-modal-description">{product.description}</p>
        </div>

        {options.length > 0 ? (
          <div className="product-modal__options">
            {options.map((option) => {
              const selected = selectedOptions[option.id] ?? []

              const minimum = option.isRequired
                ? Math.max(1, option.min)
                : option.min

              const isSingleChoice = option.max === 1

              return (
                <div className="product-modal__option-group" key={option.id}>
                  <div className="product-modal__option-header">
                    <div>
                      <h3>{option.name}</h3>

                      <span>
                        {option.isRequired || minimum > 0
                          ? 'Mandatory item'
                          : 'Optional'}
                      </span>
                    </div>

                    <small>
                      {minimum > 0 ? `Min ${minimum}` : ''}

                      {option.max > 0
                        ? `${minimum > 0 ? ' / ' : ''}Max ${option.max}`
                        : ''}
                    </small>
                  </div>

                  {option.elements.map((element) => {
                    const checked = selected.includes(element.id)

                    const maxReached =
                      option.max > 1 &&
                      selected.length >= option.max &&
                      !checked

                    return (
                      <label
                        className={`product-modal__option ${
                          maxReached ? 'product-modal__option--disabled' : ''
                        }`}
                        key={element.id}
                      >
                        <input
                          type={isSingleChoice ? 'radio' : 'checkbox'}
                          name={`option-${option.id}`}
                          value={element.id}
                          checked={checked}
                          disabled={maxReached}
                          onChange={() =>
                            toggleElement(option.id, element.id, option.max)
                          }
                        />

                        <span>{element.name}</span>

                        <small>
                          {element.price > 0
                            ? `+ ${formatPrice(element.price)}`
                            : '+ 0 won'}
                        </small>
                      </label>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="product-modal__no-options">No additional options</div>
        )}

        <div className="product-modal__footer">
          <div className="product-modal__quantity">
            <button
              type="button"
              onClick={decreaseQuantity}
              aria-label="Decrease quantity"
              disabled={quantity === 1}
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
            disabled={!isSelectionValid}
          >
            <span>Add to order</span>

            <small>{formatPrice(totalPrice)}</small>
          </button>
        </div>
      </section>
    </div>
  )
}

export default ProductModal
