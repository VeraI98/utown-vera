import "./RestaurantProductCard.css";

import type { RestaurantProduct } from "./restaurantData";
import { formatPrice } from "./restaurantData";

interface RestaurantProductCardProps {
  product: RestaurantProduct;
  isSelected?: boolean;
  onClick: (product: RestaurantProduct) => void;
}

function RestaurantProductCard({
  product,
  isSelected = false,
  onClick,
}: RestaurantProductCardProps) {
  return (
    <button
      type="button"
      className={`restaurant-product-card ${
        isSelected ? "restaurant-product-card--selected" : ""
      }`}
      onClick={() => onClick(product)}
    >
      <div className="restaurant-product-card__content">
        <h3 className="restaurant-product-card__name">{product.name}</h3>

        <p className="restaurant-product-card__description">
          {product.description}
        </p>

        <span className="restaurant-product-card__price">
          {formatPrice(product.price)}
        </span>
      </div>

      <img
        className="restaurant-product-card__image"
        src={product.image}
        alt={product.name}
      />
    </button>
  );
}

export default RestaurantProductCard;