import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import backButtonIcon from '../../assets/restaurant page/Back button.svg'
import backgroundImage from '../../assets/restaurant page/Background.svg'
import bellIcon from '../../assets/restaurant page/bell.svg'
import categoriesDrinksImage from '../../assets/restaurant page/categories drinks.svg'
import categoriesPizzaImage from '../../assets/restaurant page/categories pizza.svg'
import categoriesSaladsImage from '../../assets/restaurant page/categories salads.svg'
import clockIcon from '../../assets/restaurant page/Clock icon.svg'
import ellipsisIcon from '../../assets/restaurant page/ellipsis.svg'
import foodLogo from '../../assets/restaurant page/food.svg'
import infoIcon from '../../assets/restaurant page/Info icon.svg'
import likeOffIcon from '../../assets/restaurant page/Property 1=Like off.svg'
import likeOnIcon from '../../assets/restaurant page/Property 1=Like on.svg'
import ratingIcon from '../../assets/restaurant page/rating.svg'
import searchIcon from '../../assets/restaurant page/search.svg'
import deliveryIcon from '../../assets/restaurant page/time delivery.svg'
import utLogo from '../../assets/restaurant page/ut.svg'

import ProductModal from './ProductModal'
import RestaurantProductCard from './RestaurantProductCard'
import {
  drinkProducts,
  formatPrice,
  pizzaProducts,
  saladProducts,
  type RestaurantProduct,
} from './restaurantData'

import './RestaurantPage.css'

interface OrderItem {
  product: RestaurantProduct
  quantity: number
}

const categories = [
  {
    id: 'pizza',
    title: 'Pizza',
    subtitle: '12 items',
    image: categoriesPizzaImage,
  },
  {
    id: 'salads',
    title: 'Salads',
    subtitle: '5 items',
    image: categoriesSaladsImage,
  },
  {
    id: 'drinks',
    title: 'Drinks',
    subtitle: '8 items',
    image: categoriesDrinksImage,
  },
]

function RestaurantPage() {
  const navigate = useNavigate()

  const [selectedProduct, setSelectedProduct] =
    useState<RestaurantProduct | null>(null)

  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  const [isFavorite, setIsFavorite] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleProductClick = (product: RestaurantProduct) => {
    setSelectedProduct(product)
  }

  const handleCloseProductModal = () => {
    setSelectedProduct(null)
  }

  const handleAddToOrder = (
    product: RestaurantProduct,
    quantity: number,
  ) => {
    setOrderItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          product,
          quantity,
        },
      ]
    })

    setSelectedProduct(null)
  }

  const handleCategoryClick = (categoryId: string) => {
    document.getElementById(categoryId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleOpenOrder = () => {
    navigate('/food/order', {
      state: {
        orderItems,
      },
    })
  }

  const isProductOrdered = (productId: number) =>
    orderItems.some((item) => item.product.id === productId)

  const orderTotal = orderItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0,
  )

  const totalQuantity = orderItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  return (
    <main className="restaurant-page">
      <header className="restaurant-page__header">
        <button
          className="restaurant-page__header-button"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <img
            src={backButtonIcon}
            alt=""
            aria-hidden="true"
          />
        </button>

        <div
          className="restaurant-page__logo"
          aria-label="UT Food"
        >
          <img src={utLogo} alt="UT" />
          <img src={foodLogo} alt="Food" />
        </div>

        <button
          className="restaurant-page__header-button"
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <img
            src={bellIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </header>

      <section className="restaurant-page__hero">
        <img
          className="restaurant-page__hero-image"
          src={backgroundImage}
          alt="Pizzalio restaurant"
        />

        <div className="restaurant-page__hero-actions">
          <div className="restaurant-page__badge">
            <img
              src={ratingIcon}
              alt=""
              aria-hidden="true"
            />

            <span>
              <strong>4.2</strong>
              <small>300+</small>
            </span>
          </div>

          <div className="restaurant-page__badge">
            <img
              src={deliveryIcon}
              alt=""
              aria-hidden="true"
            />

            <span>
              <strong>45–55</strong>
              <small>min</small>
            </span>
          </div>

          <div className="restaurant-page__menu-wrapper">
            <button
              className="restaurant-page__square-button"
              type="button"
              onClick={() =>
                setIsMenuOpen((currentValue) => !currentValue)
              }
              aria-label="Open restaurant menu"
              aria-expanded={isMenuOpen}
            >
              <img
                src={ellipsisIcon}
                alt=""
                aria-hidden="true"
              />
            </button>

            {isMenuOpen && (
              <div className="restaurant-page__popup-menu">
                <button type="button">Call</button>

                <button type="button">Share</button>

                <button
                  className="restaurant-page__report-button"
                  type="button"
                >
                  Report
                </button>
              </div>
            )}
          </div>

          <button
            className="restaurant-page__square-button"
            type="button"
            onClick={() =>
              setIsFavorite((currentValue) => !currentValue)
            }
            aria-label={
              isFavorite
                ? 'Remove restaurant from favorites'
                : 'Add restaurant to favorites'
            }
            aria-pressed={isFavorite}
          >
            <img
              src={isFavorite ? likeOnIcon : likeOffIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      <section className="restaurant-page__information">
        <h1>Pizzalio</h1>

        <p className="restaurant-page__description">
          Pizza, pasta and fries
        </p>

        <div className="restaurant-page__information-row">
          <img
            src={infoIcon}
            alt=""
            aria-hidden="true"
          />

          <span>Min. order: 15,000 won</span>
        </div>

        <div className="restaurant-page__information-row">
          <img
            src={clockIcon}
            alt=""
            aria-hidden="true"
          />

          <span>10:00–22:00</span>
        </div>
      </section>

      <button
        className="restaurant-page__search"
        type="button"
        onClick={() => navigate('/food/search')}
      >
        <img
          src={searchIcon}
          alt=""
          aria-hidden="true"
        />

        <span>Search Pizzalio</span>
      </button>

      <section className="restaurant-page__categories">
        <h2>Categories</h2>

        <div className="restaurant-page__category-list">
          {categories.map((category) => (
            <button
              className="restaurant-page__category-card"
              type="button"
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
            >
              <img
                src={category.image}
                alt={category.title}
              />

              <strong>{category.title}</strong>
              <span>{category.subtitle}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="restaurant-page__products">
        <div
          className="restaurant-page__section"
          id="pizza"
        >
          <h2 className="restaurant-page__section-title">
            Pizza
          </h2>

          <div className="restaurant-page__product-list">
            {pizzaProducts.map((product) => (
              <RestaurantProductCard
                key={product.id}
                product={product}
                isSelected={isProductOrdered(product.id)}
                onClick={handleProductClick}
              />
            ))}
          </div>
        </div>

        <div
          className="restaurant-page__section"
          id="salads"
        >
          <h2 className="restaurant-page__section-title">
            Salads
          </h2>

          <div className="restaurant-page__product-list">
            {saladProducts.map((product) => (
              <RestaurantProductCard
                key={product.id}
                product={product}
                isSelected={isProductOrdered(product.id)}
                onClick={handleProductClick}
              />
            ))}
          </div>
        </div>

        <div
          className="restaurant-page__section"
          id="drinks"
        >
          <h2 className="restaurant-page__section-title">
            Something else
          </h2>

          <div className="restaurant-page__product-list">
            {drinkProducts.map((product) => (
              <RestaurantProductCard
                key={product.id}
                product={product}
                isSelected={isProductOrdered(product.id)}
                onClick={handleProductClick}
              />
            ))}
          </div>
        </div>
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseProductModal}
          onAddToOrder={handleAddToOrder}
        />
      )}

      {orderItems.length > 0 && (
        <button
          className="restaurant-page__order-button"
          type="button"
          onClick={handleOpenOrder}
          aria-label={`View order with ${totalQuantity} items`}
        >
          <span className="restaurant-page__order-count">
            {totalQuantity}
          </span>

          <span className="restaurant-page__order-label">
            View order
          </span>

          <span className="restaurant-page__order-price">
            {formatPrice(orderTotal)}
          </span>
        </button>
      )}
    </main>
  )
}

export default RestaurantPage