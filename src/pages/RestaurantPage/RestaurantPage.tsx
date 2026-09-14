import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import backButtonIcon from '../../assets/restaurant page/Back button.svg'
import backgroundImage from '../../assets/restaurant page/Background.svg'
import bellIcon from '../../assets/restaurant page/bell.svg'
import categoriesDrinksImage from '../../assets/food-common/pan-asian.webp'
import categoriesPizzaImage from '../../assets/food-common/pizza.webp'
import categoriesSaladsImage from '../../assets/food-common/salads.webp'
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

import {
  addItemToCart,
  checkMyCartExists,
  clearMyCart,
  getMyCart,
} from '../../services/cartService'

import {
  addRestaurantToFavorites,
  getFavoriteRestaurants,
  removeRestaurantFromFavorites,
} from '../../services/favoriteRestaurantService'

import {
  getMyRestaurantRatings,
  type RatingResponse,
} from '../../services/ratingService'

import {
  getRestaurantById,
  getRestaurantDishes,
} from '../../services/restaurantService'

import type { CartResponse } from '../../types/cart'

import type { DishResponse, RestaurantResponse } from '../../types/restaurant'

import CartConflictModal from './CartConflictModal'
import ProductModal from './ProductModal'
import RestaurantProductCard from './RestaurantProductCard'

import { formatPrice, type RestaurantProduct } from './restaurantData'

import './RestaurantPage.css'

interface ProductGroup {
  id: string
  title: string
  products: RestaurantProduct[]
  image: string
}

const INVALID_IMAGE_VALUES = [
  'string',
  'null',
  'undefined',
  'file uploaded successfully',
]

function isValidImageUrl(imageUrl?: string | null): imageUrl is string {
  if (!imageUrl) {
    return false
  }

  const value = imageUrl.trim()

  if (!value) {
    return false
  }

  return !INVALID_IMAGE_VALUES.includes(value.toLowerCase())
}

function getCategoryImage(
  categoryName: string,
  dishImageUrl: string | null,
): string {
  const normalizedName = categoryName.toLowerCase()

  if (normalizedName.includes('pizza')) {
    return categoriesPizzaImage
  }

  if (normalizedName.includes('salad')) {
    return categoriesSaladsImage
  }

  if (
    normalizedName.includes('drink') ||
    normalizedName.includes('beverage') ||
    normalizedName.includes('juice')
  ) {
    return categoriesDrinksImage
  }

  if (isValidImageUrl(dishImageUrl)) {
    return dishImageUrl
  }

  return ''
}

function createSectionId(categoryName: string, categoryId: number): string {
  const normalizedName = categoryName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `category-${categoryId}-${normalizedName || 'other'}`
}

function mapDishToProduct(dish: DishResponse): RestaurantProduct {
  return {
    id: dish.id,
    name: dish.title,
    description: dish.description,
    price: dish.price,
    image: isValidImageUrl(dish.imageUrl) ? dish.imageUrl : null,
    options: dish.options,
  }
}

function getOperatingHours(restaurant: RestaurantResponse | null): string {
  if (!restaurant?.operatingModes?.length) {
    return 'Opening hours unavailable'
  }

  const jsDay = new Date().getDay()

  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay

  const todayMode = restaurant.operatingModes.find(
    (mode) => mode.dayOfWeek === todayDayOfWeek,
  )

  if (!todayMode) {
    return 'Opening hours unavailable'
  }

  if (todayMode.dayOff) {
    return 'Closed'
  }

  if (!todayMode.start || !todayMode.end) {
    return 'Opening hours unavailable'
  }

  return `${todayMode.start}–${todayMode.end}`
}

function RestaurantPage() {
  const navigate = useNavigate()

  const { restaurantId } = useParams<{
    restaurantId: string
  }>()

  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null)

  const [dishes, setDishes] = useState<DishResponse[]>([])

  const [cart, setCart] = useState<CartResponse | null>(null)

  const [selectedProduct, setSelectedProduct] =
    useState<RestaurantProduct | null>(null)

  const [isFavorite, setIsFavorite] = useState(false)

  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

  const [favoriteError, setFavoriteError] = useState('')

  const [myRating, setMyRating] = useState<RatingResponse | null>(null)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [pageError, setPageError] = useState('')

  const [cartError, setCartError] = useState('')

  const [pendingCartItem, setPendingCartItem] = useState<{
    product: RestaurantProduct
    quantity: number
    elementIds: number[]
  } | null>(null)

  const parsedRestaurantId = Number(restaurantId)

  const hasValidRestaurantId =
    Boolean(restaurantId) &&
    !Number.isNaN(parsedRestaurantId) &&
    parsedRestaurantId > 0

  useEffect(() => {
    let isActive = true

    if (!hasValidRestaurantId) {
      return () => {
        isActive = false
      }
    }

    Promise.all([
      getRestaurantById(parsedRestaurantId),
      getRestaurantDishes(parsedRestaurantId),
    ])
      .then(([restaurantData, dishesData]) => {
        if (!isActive) {
          return
        }

        setRestaurant(restaurantData)

        setDishes(
          dishesData.content.filter((dish) => dish.isActive && !dish.isDeleted),
        )
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setPageError('Failed to load restaurant.')
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [hasValidRestaurantId, parsedRestaurantId])

  useEffect(() => {
    let isActive = true

    if (!hasValidRestaurantId) {
      return () => {
        isActive = false
      }
    }

    getFavoriteRestaurants()
      .then((favorites) => {
        if (!isActive) {
          return
        }

        const restaurantIsFavorite = favorites.some(
          (favorite) =>
            favorite.restaurantId === parsedRestaurantId ||
            favorite.restaurant?.id === parsedRestaurantId,
        )

        setIsFavorite(restaurantIsFavorite)

        setFavoriteError('')
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setIsFavorite(false)
      })

    return () => {
      isActive = false
    }
  }, [hasValidRestaurantId, parsedRestaurantId])

  useEffect(() => {
    let isActive = true

    if (!hasValidRestaurantId) {
      return () => {
        isActive = false
      }
    }

    getMyRestaurantRatings(0, 100)
      .then((myRatingsData) => {
        if (!isActive) {
          return
        }

        const currentRestaurantRating =
          (myRatingsData.content ?? []).find(
            (rating) => rating.restaurantId === parsedRestaurantId,
          ) ?? null

        setMyRating(currentRestaurantRating)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setMyRating(null)
      })

    return () => {
      isActive = false
    }
  }, [hasValidRestaurantId, parsedRestaurantId])

  useEffect(() => {
    let isActive = true

    checkMyCartExists()
      .then((exists) => {
        if (!exists) {
          return null
        }

        return getMyCart()
      })
      .then((currentCart) => {
        if (!isActive) {
          return
        }

        setCart(currentCart)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setCart(null)
      })

    return () => {
      isActive = false
    }
  }, [])

  const productGroups = useMemo<ProductGroup[]>(() => {
    const groups = new Map<number, ProductGroup>()

    dishes.forEach((dish) => {
      const existingGroup = groups.get(dish.dishCategoryId)

      const product = mapDishToProduct(dish)

      if (existingGroup) {
        existingGroup.products.push(product)

        return
      }

      groups.set(dish.dishCategoryId, {
        id: createSectionId(dish.categoryName, dish.dishCategoryId),
        title: dish.categoryName || 'Other',
        products: [product],
        image: getCategoryImage(dish.categoryName, dish.imageUrl),
      })
    })

    return Array.from(groups.values())
  }, [dishes])

  const averageRating = restaurant?.ratings ?? 0

  const ratingCount = restaurant?.totalRatings ?? 0

  const cartRestaurantId = cart?.items[0]?.restaurantId

  const cartBelongsToCurrentRestaurant =
    Boolean(cart?.items.length) && cartRestaurantId === restaurant?.id

  const totalQuantity = cartBelongsToCurrentRestaurant
    ? (cart?.totalDish ?? 0)
    : 0

  const orderTotal = cartBelongsToCurrentRestaurant ? (cart?.totalSum ?? 0) : 0

  const handleProductClick = (product: RestaurantProduct) => {
    setSelectedProduct(product)

    setCartError('')
  }

  const handleCloseProductModal = () => {
    if (isAddingToCart) {
      return
    }

    setSelectedProduct(null)

    setCartError('')
  }

  const addProductToCart = async (
    product: RestaurantProduct,
    quantity: number,
    elementIds: number[],
  ) => {
    const updatedCart = await addItemToCart({
      dishId: product.id,
      count: quantity,
      elements: elementIds,
    })

    setCart(updatedCart)

    setSelectedProduct(null)
  }

  const handleAddToOrder = async (
    product: RestaurantProduct,
    quantity: number,
    elementIds: number[],
  ) => {
    if (isAddingToCart || !restaurant) {
      return
    }

    const currentCartRestaurantId = cart?.items[0]?.restaurantId

    const hasDifferentRestaurant =
      Boolean(cart?.items.length) &&
      Boolean(currentCartRestaurantId) &&
      currentCartRestaurantId !== restaurant.id

    if (hasDifferentRestaurant) {
      setPendingCartItem({
        product,
        quantity,
        elementIds,
      })

      setSelectedProduct(null)

      setCartError('')

      return
    }

    try {
      setIsAddingToCart(true)

      setCartError('')

      await addProductToCart(product, quantity, elementIds)
    } catch {
      setCartError('Failed to add the item to your cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleCancelCartReplacement = () => {
    if (isAddingToCart) {
      return
    }

    setPendingCartItem(null)
  }

  const handleReplaceCart = async () => {
    if (!pendingCartItem || isAddingToCart) {
      return
    }

    try {
      setIsAddingToCart(true)

      setCartError('')

      await clearMyCart()

      await addProductToCart(
        pendingCartItem.product,
        pendingCartItem.quantity,
        pendingCartItem.elementIds,
      )

      setPendingCartItem(null)
    } catch {
      setCartError('Failed to start a new cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleFavoriteClick = async () => {
    if (!hasValidRestaurantId || isFavoriteLoading) {
      return
    }

    const previousValue = isFavorite

    setIsFavorite(!previousValue)

    setIsFavoriteLoading(true)

    setFavoriteError('')

    try {
      if (previousValue) {
        await removeRestaurantFromFavorites(parsedRestaurantId)
      } else {
        await addRestaurantToFavorites(parsedRestaurantId)
      }
    } catch {
      setIsFavorite(previousValue)

      setFavoriteError(
        previousValue
          ? 'Failed to remove restaurant from favorites.'
          : 'Failed to add restaurant to favorites.',
      )
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    document.getElementById(categoryId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleOpenOrder = () => {
    navigate('/food/order')
  }

  const isProductOrdered = (productId: number) => {
    if (!cartBelongsToCurrentRestaurant) {
      return false
    }

    return cart?.items.some((item) => item.dishId === productId) ?? false
  }

  if (!hasValidRestaurantId) {
    return (
      <main className="restaurant-page">
        <header className="restaurant-page__header">
          <button
            className="restaurant-page__header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={backButtonIcon} alt="" aria-hidden="true" />
          </button>

          <div className="restaurant-page__logo" aria-label="UT Food">
            <img src={utLogo} alt="UT" />

            <img src={foodLogo} alt="Food" />
          </div>

          <div className="restaurant-page__header-button" />
        </header>

        <p role="alert" className="restaurant-page__state-message">
          Invalid restaurant ID.
        </p>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="restaurant-page">
        <p className="restaurant-page__state-message">Loading restaurant...</p>
      </main>
    )
  }

  if (pageError || !restaurant) {
    return (
      <main className="restaurant-page">
        <header className="restaurant-page__header">
          <button
            className="restaurant-page__header-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <img src={backButtonIcon} alt="" aria-hidden="true" />
          </button>

          <div className="restaurant-page__logo" aria-label="UT Food">
            <img src={utLogo} alt="UT" />

            <img src={foodLogo} alt="Food" />
          </div>

          <div className="restaurant-page__header-button" />
        </header>

        <p className="restaurant-page__state-message" role="alert">
          {pageError || 'Restaurant not found.'}
        </p>
      </main>
    )
  }

  const heroImage = isValidImageUrl(restaurant.imageUrl)
    ? restaurant.imageUrl
    : backgroundImage

  const minimumOrderAmount = restaurant.minOrderAmount

  return (
    <main className="restaurant-page">
      <header className="restaurant-page__header">
        <button
          className="restaurant-page__header-button"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <img src={backButtonIcon} alt="" aria-hidden="true" />
        </button>

        <div className="restaurant-page__logo" aria-label="UT Food">
          <img src={utLogo} alt="UT" />

          <img src={foodLogo} alt="Food" />
        </div>

        <button
          className="restaurant-page__header-button"
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <img src={bellIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <section className="restaurant-page__hero">
        <img
          className="restaurant-page__hero-image"
          src={heroImage}
          alt={`${restaurant.title} restaurant`}
          onError={(event) => {
            event.currentTarget.src = backgroundImage
          }}
        />

        <div className="restaurant-page__hero-actions">
          <div className="restaurant-page__badge">
            <img src={ratingIcon} alt="" aria-hidden="true" />

            <span>
              <strong>{averageRating.toFixed(1)}</strong>

              <small>{ratingCount} ratings</small>
            </span>
          </div>

          <div className="restaurant-page__badge">
            <img src={deliveryIcon} alt="" aria-hidden="true" />

            <span>
              <strong>{restaurant.deliveryTime || '—'}</strong>

              <small>min</small>
            </span>
          </div>

          <div className="restaurant-page__menu-wrapper">
            <button
              className="restaurant-page__square-button"
              type="button"
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
              aria-label="Open restaurant menu"
              aria-expanded={isMenuOpen}
            >
              <img src={ellipsisIcon} alt="" aria-hidden="true" />
            </button>

            {isMenuOpen && (
              <div className="restaurant-page__popup-menu">
                <button type="button" disabled>
                  Call
                </button>

                <button type="button" disabled>
                  Share
                </button>

                <button
                  className="restaurant-page__report-button"
                  type="button"
                  disabled
                >
                  Report
                </button>
              </div>
            )}
          </div>

          <button
            className={`restaurant-page__square-button ${
              isFavoriteLoading ? 'restaurant-page__favorite-loading' : ''
            }`}
            type="button"
            onClick={() => void handleFavoriteClick()}
            disabled={isFavoriteLoading}
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

      {favoriteError && (
        <p className="restaurant-page__favorite-error" role="alert">
          {favoriteError}
        </p>
      )}

      <section className="restaurant-page__information">
        <h1>{restaurant.title}</h1>

        {restaurant.description && (
          <p className="restaurant-page__description">
            {restaurant.description}
          </p>
        )}

        <div className="restaurant-page__information-row">
          <img src={infoIcon} alt="" aria-hidden="true" />

          <span>Min. order: {formatPrice(minimumOrderAmount)}</span>
        </div>

        <div className="restaurant-page__information-row">
          <img src={clockIcon} alt="" aria-hidden="true" />

          <span>{getOperatingHours(restaurant)}</span>
        </div>
      </section>

      <section className="restaurant-page__rating-info">
        <div className="restaurant-page__rating-info-main">
          <div className="restaurant-page__rating-info-icon">★</div>

          <div className="restaurant-page__rating-info-text">
            <strong>{averageRating.toFixed(1)}</strong>

            <span>
              {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
            </span>
          </div>
        </div>

        {myRating && (
          <div className="restaurant-page__my-rating">
            <span>Your rating</span>

            <strong>{myRating.grade}/5</strong>
          </div>
        )}
      </section>

      <button
        className="restaurant-page__search"
        type="button"
        onClick={() => navigate('/food/search')}
      >
        <img src={searchIcon} alt="" aria-hidden="true" />

        <span>Search {restaurant.title}</span>
      </button>

      {productGroups.length > 0 && (
        <section className="restaurant-page__categories">
          <h2>Categories</h2>

          <div className="restaurant-page__category-list">
            {productGroups.map((group) => (
              <button
                className="restaurant-page__category-card"
                type="button"
                key={group.id}
                onClick={() => handleCategoryClick(group.id)}
              >
                {group.image ? (
                  <img
                    src={group.image}
                    alt={group.title}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div
                    className="restaurant-page__category-image-placeholder"
                    aria-hidden="true"
                  >
                    No image
                  </div>
                )}

                <strong>{group.title}</strong>

                <span>
                  {group.products.length}{' '}
                  {group.products.length === 1 ? 'item' : 'items'}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="restaurant-page__products">
        {productGroups.map((group) => (
          <div
            className="restaurant-page__section"
            id={group.id}
            key={group.id}
          >
            <h2 className="restaurant-page__section-title">{group.title}</h2>

            <div className="restaurant-page__product-list">
              {group.products.map((product) => (
                <RestaurantProductCard
                  key={product.id}
                  product={product}
                  isSelected={isProductOrdered(product.id)}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          </div>
        ))}

        {productGroups.length === 0 && (
          <p className="restaurant-page__state-message">No dishes available.</p>
        )}
      </section>

      {cartError && (
        <p className="restaurant-page__cart-error" role="alert">
          {cartError}
        </p>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseProductModal}
          onAddToOrder={handleAddToOrder}
        />
      )}

      {pendingCartItem && (
        <CartConflictModal
          isLoading={isAddingToCart}
          onCancel={handleCancelCartReplacement}
          onReplace={() => void handleReplaceCart()}
        />
      )}

      {totalQuantity > 0 && (
        <button
          className="restaurant-page__order-button"
          type="button"
          onClick={handleOpenOrder}
          aria-label={`View order with ${totalQuantity} items`}
        >
          <span className="restaurant-page__order-count">{totalQuantity}</span>

          <span className="restaurant-page__order-label">View order</span>

          <span className="restaurant-page__order-price">
            {formatPrice(orderTotal)}
          </span>
        </button>
      )}
    </main>
  )
}

export default RestaurantPage
