import { useState } from 'react'

import './RestaurantProductCard.css'

import { formatPrice, type RestaurantProduct } from './restaurantData'

interface RestaurantProductCardProps {
  product: RestaurantProduct
  isSelected?: boolean
  onClick: (product: RestaurantProduct) => void
}

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

function RestaurantProductCard({
  product,
  isSelected = false,
  onClick,
}: RestaurantProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const hasImage = isValidImageUrl(product.image) && !imageError

  return (
    <button
      type="button"
      className={`restaurant-product-card ${
        isSelected ? 'restaurant-product-card--selected' : ''
      }`}
      onClick={() => onClick(product)}
      aria-pressed={isSelected}
    >
      <div className="restaurant-product-card__content">
        <strong className="restaurant-product-card__name">
          {product.name}
        </strong>

        {product.description && (
          <p className="restaurant-product-card__description">
            {product.description}
          </p>
        )}

        <span className="restaurant-product-card__price">
          {formatPrice(product.price)}
        </span>
      </div>

      {hasImage ? (
        <img
          className="restaurant-product-card__image"
          src={product.image ?? undefined}
          alt={product.name}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="restaurant-product-card__image restaurant-product-card__image--placeholder"
          aria-label="No image available"
        >
          No image
        </div>
      )}
    </button>
  )
}

export default RestaurantProductCard
