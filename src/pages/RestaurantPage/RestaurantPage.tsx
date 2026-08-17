import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

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
  calculateAverageRating,
  getMyRestaurantRating,
  getRestaurantRatings,
  type RatingResponse,
} from '../../services/ratingService'

import {
  getRestaurantById,
  getRestaurantDishes,
} from '../../services/restaurantService'

import type { CartResponse } from '../../types/cart'
import type {
  DishResponse,
  RestaurantResponse,
} from '../../types/restaurant'

import CartConflictModal from './CartConflictModal'
import ProductModal from './ProductModal'
import RestaurantProductCard from './RestaurantProductCard'

import {
  formatPrice,
  type RestaurantProduct,
} from './restaurantData'

import './RestaurantPage.css'

interface ProductGroup {
  id: string
  title: string
  products: RestaurantProduct[]
  image: string
}

const getMinOrderAmount = (amount: number) => {
  if (amount > 0 && amount < 1000) {
    return amount * 1000
  }

  return amount
}

const getCategoryImage = (
  categoryName: string,
  dishImageUrl: string | null,
) => {
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

  if (dishImageUrl?.trim()) {
    return dishImageUrl
  }

  return ''
}

const getProductCategory = (
  categoryName: string,
): RestaurantProduct['category'] => {
  const normalizedName = categoryName.toLowerCase()

  if (normalizedName.includes('salad')) {
    return 'salads'
  }

  if (
    normalizedName.includes('drink') ||
    normalizedName.includes('beverage') ||
    normalizedName.includes('juice')
  ) {
    return 'drinks'
  }

  return 'pizza'
}

const createSectionId = (
  categoryName: string,
  categoryId: number,
) => {
  const normalizedName = categoryName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `category-${categoryId}-${normalizedName || 'other'}`
}

const mapDishToProduct = (
  dish: DishResponse,
): RestaurantProduct => ({
  id: dish.id,
  name: dish.title,
  description: dish.description,
  price: dish.price,
  category: getProductCategory(dish.categoryName),
  image: dish.imageUrl,
  options: dish.options,
})

const getOperatingHours = (
  restaurant: RestaurantResponse | null,
) => {
  if (!restaurant?.operatingModes?.length) {
    return 'Opening hours unavailable'
  }

  const workingDay =
    restaurant.operatingModes.find(
      (mode) => !mode.dayOff,
    )

  if (!workingDay) {
    return 'Closed'
  }

  return `${workingDay.start}–${workingDay.end}`
}

function RestaurantPage() {
  const navigate = useNavigate()

  const { restaurantId } = useParams<{
    restaurantId: string
  }>()

  const [restaurant, setRestaurant] =
    useState<RestaurantResponse | null>(null)

  const [dishes, setDishes] =
    useState<DishResponse[]>([])

  const [cart, setCart] =
    useState<CartResponse | null>(null)

  const [selectedProduct, setSelectedProduct] =
    useState<RestaurantProduct | null>(null)

  const [isFavorite, setIsFavorite] =
    useState(false)

  const [
    isFavoriteLoading,
    setIsFavoriteLoading,
  ] = useState(false)

  const [
    favoriteError,
    setFavoriteError,
  ] = useState('')

  const [ratings, setRatings] =
    useState<RatingResponse[]>([])

  const [myRating, setMyRating] =
    useState<RatingResponse | null>(null)

  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isAddingToCart, setIsAddingToCart] =
    useState(false)

  const [pageError, setPageError] =
    useState('')

  const [cartError, setCartError] =
    useState('')

  const [
    pendingCartItem,
    setPendingCartItem,
  ] = useState<{
    product: RestaurantProduct
    quantity: number
    elementIds: number[]
  } | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      const id = Number(restaurantId)

      if (
        !restaurantId ||
        Number.isNaN(id) ||
        id <= 0
      ) {
        setPageError('Invalid restaurant ID.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setPageError('')

        const [
          restaurantData,
          dishesData,
        ] = await Promise.all([
          getRestaurantById(id),
          getRestaurantDishes(id),
        ])

        setRestaurant(restaurantData)

        setDishes(
          dishesData.content.filter(
            (dish) =>
              dish.isActive &&
              !dish.isDeleted,
          ),
        )
      } catch (error) {
        console.error(
          'Failed to load restaurant:',
          error,
        )

        setPageError(
          'Failed to load restaurant.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadPage()
  }, [restaurantId])

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      const id = Number(restaurantId)

      if (
        !restaurantId ||
        Number.isNaN(id) ||
        id <= 0
      ) {
        return
      }

      try {
        const favorites =
          await getFavoriteRestaurants()

        const restaurantIsFavorite =
          favorites.some(
            (favorite) =>
              favorite.restaurantId === id ||
              favorite.restaurant?.id === id,
          )

        setIsFavorite(restaurantIsFavorite)
        setFavoriteError('')
      } catch (error) {
        console.error(
          'Failed to load favorite status:',
          error,
        )

        setIsFavorite(false)
      }
    }

    void loadFavoriteStatus()
  }, [restaurantId])

  useEffect(() => {
    const loadRatings = async () => {
      const id = Number(restaurantId)

      if (
        !restaurantId ||
        Number.isNaN(id) ||
        id <= 0
      ) {
        return
      }

      const [
        ratingsResult,
        myRatingResult,
      ] = await Promise.allSettled([
        getRestaurantRatings(id, 0, 100),
        getMyRestaurantRating(id),
      ])

      if (
        ratingsResult.status ===
        'fulfilled'
      ) {
        setRatings(
          ratingsResult.value.content ?? [],
        )
      } else {
        console.error(
          'Failed to load restaurant ratings:',
          ratingsResult.reason,
        )

        setRatings([])
      }

      if (
        myRatingResult.status ===
        'fulfilled'
      ) {
        setMyRating(myRatingResult.value)
      } else {
        console.error(
          'Failed to load user rating:',
          myRatingResult.reason,
        )

        setMyRating(null)
      }
    }

    void loadRatings()
  }, [restaurantId])

  useEffect(() => {
    const loadCart = async () => {
      try {
        const exists =
          await checkMyCartExists()

        if (!exists) {
          setCart(null)
          return
        }

        const currentCart =
          await getMyCart()

        setCart(currentCart)
      } catch (error) {
        console.error(
          'Failed to load cart:',
          error,
        )

        setCart(null)
      }
    }

    void loadCart()
  }, [])

  const productGroups =
    useMemo<ProductGroup[]>(() => {
      const groups = new Map<
        number,
        ProductGroup
      >()

      dishes.forEach((dish) => {
        const existingGroup =
          groups.get(dish.dishCategoryId)

        const product =
          mapDishToProduct(dish)

        if (existingGroup) {
          existingGroup.products.push(product)
          return
        }

        groups.set(
          dish.dishCategoryId,
          {
            id: createSectionId(
              dish.categoryName,
              dish.dishCategoryId,
            ),
            title:
              dish.categoryName ||
              'Other',
            products: [product],
            image: getCategoryImage(
              dish.categoryName,
              dish.imageUrl,
            ),
          },
        )
      })

      return Array.from(groups.values())
    }, [dishes])

  const averageRating = useMemo(() => {
    if (ratings.length > 0) {
      return calculateAverageRating(ratings)
    }

    return restaurant?.ratings ?? 0
  }, [ratings, restaurant])

  const ratingCount =
    ratings.length > 0
      ? ratings.length
      : restaurant?.totalRatings ?? 0

  const handleProductClick = (
    product: RestaurantProduct,
  ) => {
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

    const cartRestaurantId =
      cart?.items[0]?.restaurantId

    const hasDifferentRestaurant =
      Boolean(cart?.items.length) &&
      Boolean(cartRestaurantId) &&
      cartRestaurantId !== restaurant.id

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

      await addProductToCart(
        product,
        quantity,
        elementIds,
      )
    } catch (error) {
      console.error(
        'Failed to add item to cart:',
        error,
      )

      setCartError(
        'Failed to add the item to your cart. Please try again.',
      )
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
    if (
      !pendingCartItem ||
      isAddingToCart
    ) {
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
    } catch (error) {
      console.error(
        'Failed to replace cart:',
        error,
      )

      setCartError(
        'Failed to start a new cart. Please try again.',
      )
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleFavoriteClick = async () => {
    const id = Number(restaurantId)

    if (
      !restaurantId ||
      Number.isNaN(id) ||
      id <= 0 ||
      isFavoriteLoading
    ) {
      return
    }

    const previousValue = isFavorite

    setIsFavorite(!previousValue)
    setIsFavoriteLoading(true)
    setFavoriteError('')

    try {
      if (previousValue) {
        await removeRestaurantFromFavorites(id)
      } else {
        await addRestaurantToFavorites(id)
      }
    } catch (error) {
      console.error(
        'Failed to update favorite:',
        error,
      )

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

  const handleCategoryClick = (
    categoryId: string,
  ) => {
    document
      .getElementById(categoryId)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }

  const handleOpenOrder = () => {
    navigate('/food/order')
  }

  const isProductOrdered = (
    productId: number,
  ) => {
    if (!cartBelongsToCurrentRestaurant) {
      return false
    }

    return (
      cart?.items.some(
        (item) =>
          item.dishId === productId,
      ) ?? false
    )
  }

  const cartRestaurantId =
    cart?.items[0]?.restaurantId

  const cartBelongsToCurrentRestaurant =
    Boolean(cart?.items.length) &&
    cartRestaurantId === restaurant?.id

  const totalQuantity =
    cartBelongsToCurrentRestaurant
      ? cart?.totalDish ?? 0
      : 0

  const orderTotal =
    cartBelongsToCurrentRestaurant
      ? cart?.totalSum ?? 0
      : 0

  if (isLoading) {
    return (
      <main className="restaurant-page">
        <p
          style={{
            padding: '40px 16px',
            textAlign: 'center',
          }}
        >
          Loading restaurant...
        </p>
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
            <img
              src={foodLogo}
              alt="Food"
            />
          </div>

          <div className="restaurant-page__header-button" />
        </header>

        <p
          role="alert"
          style={{
            padding: '40px 16px',
            textAlign: 'center',
          }}
        >
          {pageError ||
            'Restaurant not found.'}
        </p>
      </main>
    )
  }

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
          <img
            src={foodLogo}
            alt="Food"
          />
        </div>

        <button
          className="restaurant-page__header-button"
          type="button"
          onClick={() =>
            navigate('/notifications')
          }
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
          src={
            restaurant.imageUrl ||
            backgroundImage
          }
          alt={`${restaurant.title} restaurant`}
          onError={(event) => {
            event.currentTarget.src =
              backgroundImage
          }}
        />

        <div className="restaurant-page__hero-actions">
          <div className="restaurant-page__badge">
            <img
              src={ratingIcon}
              alt=""
              aria-hidden="true"
            />

            <span>
              <strong>
                {averageRating.toFixed(1)}
              </strong>

              <small>
                {ratingCount} ratings
              </small>
            </span>
          </div>

          <div className="restaurant-page__badge">
            <img
              src={deliveryIcon}
              alt=""
              aria-hidden="true"
            />

            <span>
              <strong>
                {restaurant.deliveryTime ||
                  '—'}
              </strong>

              <small>min</small>
            </span>
          </div>

          <div className="restaurant-page__menu-wrapper">
            <button
              className="restaurant-page__square-button"
              type="button"
              onClick={() =>
                setIsMenuOpen(
                  (currentValue) =>
                    !currentValue,
                )
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
                <button type="button">
                  Call
                </button>

                <button type="button">
                  Share
                </button>

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
            className={`restaurant-page__square-button ${
              isFavoriteLoading
                ? 'restaurant-page__favorite-loading'
                : ''
            }`}
            type="button"
            onClick={() =>
              void handleFavoriteClick()
            }
            disabled={isFavoriteLoading}
            aria-label={
              isFavorite
                ? 'Remove restaurant from favorites'
                : 'Add restaurant to favorites'
            }
            aria-pressed={isFavorite}
          >
            <img
              src={
                isFavorite
                  ? likeOnIcon
                  : likeOffIcon
              }
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      {favoriteError && (
        <p
          className="restaurant-page__favorite-error"
          role="alert"
        >
          {favoriteError}
        </p>
      )}

      <section className="restaurant-page__information">
        <h1>
          {restaurant.title}
        </h1>

        <p className="restaurant-page__description">
          {restaurant.description}
        </p>

        <div className="restaurant-page__information-row">
          <img
            src={infoIcon}
            alt=""
            aria-hidden="true"
          />

          <span>
            Min. order:{' '}
            {formatPrice(
              getMinOrderAmount(
                restaurant.minOrderAmount,
              ),
            )}
          </span>
        </div>

        <div className="restaurant-page__information-row">
          <img
            src={clockIcon}
            alt=""
            aria-hidden="true"
          />

          <span>
            {getOperatingHours(
              restaurant,
            )}
          </span>
        </div>
      </section>

      <section className="restaurant-page__rating-info">
        <div className="restaurant-page__rating-info-main">
          <div className="restaurant-page__rating-info-icon">
            ★
          </div>

          <div className="restaurant-page__rating-info-text">
            <strong>
              {averageRating.toFixed(1)}
            </strong>

            <span>
              {ratingCount}{' '}
              {ratingCount === 1
                ? 'rating'
                : 'ratings'}
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
        onClick={() =>
          navigate('/food/search')
        }
      >
        <img
          src={searchIcon}
          alt=""
          aria-hidden="true"
        />

        <span>
          Search {restaurant.title}
        </span>
      </button>

      {productGroups.length > 0 && (
        <section className="restaurant-page__categories">
          <h2>Categories</h2>

          <div className="restaurant-page__category-list">
            {productGroups.map(
              (group) => (
                <button
                  className="restaurant-page__category-card"
                  type="button"
                  key={group.id}
                  onClick={() =>
                    handleCategoryClick(
                      group.id,
                    )
                  }
                >
                  {group.image ? (
                    <img
                      src={group.image}
                      alt={group.title}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none'
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

                  <strong>
                    {group.title}
                  </strong>

                  <span>
                    {group.products.length}{' '}
                    {group.products.length ===
                    1
                      ? 'item'
                      : 'items'}
                  </span>
                </button>
              ),
            )}
          </div>
        </section>
      )}

      <section className="restaurant-page__products">
        {productGroups.map(
          (group) => (
            <div
              className="restaurant-page__section"
              id={group.id}
              key={group.id}
            >
              <h2 className="restaurant-page__section-title">
                {group.title}
              </h2>

              <div className="restaurant-page__product-list">
                {group.products.map(
                  (product) => (
                    <RestaurantProductCard
                      key={product.id}
                      product={product}
                      isSelected={isProductOrdered(
                        product.id,
                      )}
                      onClick={
                        handleProductClick
                      }
                    />
                  ),
                )}
              </div>
            </div>
          ),
        )}

        {productGroups.length === 0 && (
          <p
            style={{
              padding: '20px 16px',
              textAlign: 'center',
            }}
          >
            No dishes available.
          </p>
        )}
      </section>

      {cartError && (
        <p
          role="alert"
          style={{
            margin: '16px',
            color: '#d32f2f',
            fontSize: '13px',
            textAlign: 'center',
          }}
        >
          {cartError}
        </p>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={
            handleCloseProductModal
          }
          onAddToOrder={
            handleAddToOrder
          }
        />
      )}

      {pendingCartItem && (
        <CartConflictModal
          isLoading={isAddingToCart}
          onCancel={
            handleCancelCartReplacement
          }
          onReplace={() =>
            void handleReplaceCart()
          }
        />
      )}

      {totalQuantity > 0 && (
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