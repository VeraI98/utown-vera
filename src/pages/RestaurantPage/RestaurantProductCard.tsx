import { useState } from 'react'

import './RestaurantProductCard.css'

import {
  formatPrice,
  type RestaurantProduct,
} from './restaurantData'

interface RestaurantProductCardProps {
  product: RestaurantProduct
  isSelected?: boolean
  onClick: (product: RestaurantProduct) => void
}

function RestaurantProductCard({
  product,
  isSelected = false,
  onClick,
}: RestaurantProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const hasImage =
    Boolean(product.image?.trim()) && !imageError

  return (
    <button
      type="button"
      className={`restaurant-product-card ${
        isSelected
          ? 'restaurant-product-card--selected'
          : ''
      }`}
      onClick={() => onClick(product)}
    >
      <div className="restaurant-product-card__content">
        <strong className="restaurant-product-card__name">
          {product.name}
        </strong>

        <p className="restaurant-product-card__description">
          {product.description}
        </p>

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