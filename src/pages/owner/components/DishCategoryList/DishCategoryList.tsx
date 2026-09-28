import { useState } from 'react'

import type {
  DishCategoryResponse,
  DishResponse,
} from '../../../../types/restaurant'

import './DishCategoryList.css'

interface DishCategoryListProps {
  categories: DishCategoryResponse[]
  dishes: DishResponse[]
  toggleLabel: (dish: DishResponse) => string
  isToggleOn: (dish: DishResponse) => boolean
  onToggle: (dish: DishResponse) => void
  togglingId: number | null
  onEdit: (dish: DishResponse) => void
  emptyMessage: string
}

function formatPrice(price: number) {
  if (typeof price !== 'number') {
    return '-'
  }

  return price.toLocaleString('en-US')
}

function DishCategoryList({
  categories,
  dishes,
  toggleLabel,
  isToggleOn,
  onToggle,
  togglingId,
  onEdit,
  emptyMessage,
}: DishCategoryListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  )

  const sortedCategories = [...categories].sort((a, b) => a.sort - b.sort)

  const activeCategory =
    sortedCategories.find((category) => category.id === selectedCategoryId) ??
    sortedCategories[0]

  if (!activeCategory) {
    return <p className="dish-category-list__empty">{emptyMessage}</p>
  }

  return (
    <div className="dish-category-list">
      {sortedCategories.length > 0 && (
        <div className="dish-category-list__tabs">
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`dish-category-list__tab${category.id === activeCategory.id ? ' dish-category-list__tab--active' : ''}`}
              aria-pressed={category.id === activeCategory.id}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {[activeCategory].map((category) => (
        <section className="dish-category-list__section" key={category.id}>
          <h2>{category.name}</h2>

          {!dishes.some((dish) => dish.dishCategoryId === category.id) && (
            <p className="dish-category-list__empty">{emptyMessage}</p>
          )}

          <div className="dish-category-list__items">
            {dishes
              .filter((dish) => dish.dishCategoryId === category.id)
              .map((dish) => (
                <div className="dish-category-list__item" key={dish.id}>
                  <div className="dish-category-list__row">
                    <div className="dish-category-list__info">
                      <span className="dish-category-list__name">
                        {dish.title}
                      </span>

                      {dish.description && (
                        <span className="dish-category-list__description">
                          {dish.description}
                        </span>
                      )}

                      <span
                        className={`dish-category-list__price${
                          dish.isActive
                            ? ' dish-category-list__price--active'
                            : ''
                        }`}
                      >
                        {formatPrice(dish.price)} won
                      </span>
                    </div>

                    <div className="dish-category-list__thumb-wrap">
                      <div
                        className={`dish-category-list__thumb${
                          dish.isActive
                            ? ''
                            : ' dish-category-list__thumb--held'
                        }`}
                      >
                        {dish.imageUrl && <img src={dish.imageUrl} alt="" />}
                      </div>

                      <button
                        type="button"
                        className="dish-category-list__edit"
                        onClick={() => onEdit(dish)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="dish-category-list__toggle-row">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isToggleOn(dish)}
                      aria-label={toggleLabel(dish)}
                      className={`dish-category-list__switch${
                        isToggleOn(dish)
                          ? ' dish-category-list__switch--active'
                          : ''
                      }`}
                      disabled={togglingId === dish.id}
                      onClick={() => onToggle(dish)}
                    >
                      <span />
                    </button>

                    <span className="dish-category-list__toggle-label">
                      {toggleLabel(dish)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default DishCategoryList
