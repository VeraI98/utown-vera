import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import backButtonIcon from '../../assets/food-menu/Back button.svg'
import bellIcon from '../../assets/food-menu/bell.svg'
import coffeeImage from '../../assets/food-menu/coffee.svg'
import cuisineAreaImage from '../../assets/food-menu/Cuisine in the area.svg'
import foodLogo from '../../assets/food-menu/food.svg'
import iceCreamImage from '../../assets/food-menu/ice cream.jpg'
import longRestaurantImage from '../../assets/food-menu/Long name of the restaurant....svg'
import mapIcon from '../../assets/food-menu/map.svg'
import panAsianImage from '../../assets/food-menu/Pan Asian.svg'
import pizzaImage from '../../assets/food-menu/pizza.svg'
import redWhiteImage from '../../assets/food-menu/red white.svg'
import saladsImage from '../../assets/food-menu/salads.svg'
import searchIcon from '../../assets/food-menu/search.svg'
import utLogo from '../../assets/food-menu/ut.svg'

import favoritesIcon from '../../assets/icons main pages/Favorites.svg'
import homeIcon from '../../assets/icons main pages/Home.svg'
import profileIcon from '../../assets/icons main pages/Profile.svg'

import { api } from '../../services/api'
import { getActiveRestaurants } from '../../services/restaurantService'

import type {
  PaginatedResponse,
  RestaurantResponse,
} from '../../types/restaurant'

import './FoodPage.css'

interface DishCategoryResponse {
  id: number
  name: string
  sort: number
  isActive: boolean
  imageUrl: string
  restaurantId: number
  restaurantName: string
}

interface FoodCategory {
  id: number
  title: string
  subtitle: string
  image: string
}

interface RestaurantSectionProps {
  title: string
  moreTo: string
  restaurants: RestaurantResponse[]
  onRestaurantClick: (
    restaurant: RestaurantResponse,
  ) => void
}

const fallbackRestaurantImages = [
  cuisineAreaImage,
  longRestaurantImage,
  redWhiteImage,
]

function getCategoryFallbackImage(
  categoryName: string,
): string {
  const normalizedName = categoryName
    .trim()
    .toLowerCase()

  if (normalizedName.includes('pizza')) {
    return pizzaImage
  }

  if (normalizedName.includes('salad')) {
    return saladsImage
  }

  if (
    normalizedName.includes('asian') ||
    normalizedName.includes('pan')
  ) {
    return panAsianImage
  }

  if (
    normalizedName.includes('ice cream') ||
    normalizedName.includes('dessert')
  ) {
    return iceCreamImage
  }

  return pizzaImage
}

function getRestaurantFallbackImage(
  index: number,
): string {
  return fallbackRestaurantImages[
    index % fallbackRestaurantImages.length
  ]
}

function getDeliveryMinutes(
  deliveryTime?: string,
): number {
  if (!deliveryTime) {
    return Number.MAX_SAFE_INTEGER
  }

  const match = deliveryTime.match(/\d+/)

  if (!match) {
    return Number.MAX_SAFE_INTEGER
  }

  return Number(match[0])
}

function formatMinOrderAmount(
  amount?: number,
): string {
  if (
    amount === undefined ||
    amount === null ||
    Number.isNaN(amount)
  ) {
    return '0 won'
  }

  return `${amount.toLocaleString('en-US')} won`
}

function RestaurantSection({
  title,
  moreTo,
  restaurants,
  onRestaurantClick,
}: RestaurantSectionProps) {
  return (
    <section className="food-section">
      <div className="food-section-header">
        <h2>{title}</h2>

        <Link
          className="food-more-button"
          to={moreTo}
        >
          More
        </Link>
      </div>

      <div className="food-horizontal-list food-restaurant-list">
        {restaurants.map((restaurant, index) => {
          const fallbackImage =
            getRestaurantFallbackImage(index)

          return (
            <button
              className="food-restaurant-card"
              type="button"
              key={`${title}-${restaurant.id}`}
              onClick={() =>
                onRestaurantClick(restaurant)
              }
              aria-label={`Open ${restaurant.title}`}
            >
              <img
                className="food-restaurant-image"
                src={
                  restaurant.imageUrl ||
                  fallbackImage
                }
                alt={restaurant.title}
                onError={(event) => {
                  event.currentTarget.onerror =
                    null

                  event.currentTarget.src =
                    fallbackImage
                }}
              />

              <div className="food-restaurant-body">
                <h3>{restaurant.title}</h3>

                <p>
                  {restaurant.category ||
                    restaurant.description ||
                    'Restaurant'}
                </p>

                <div className="food-restaurant-meta">
                  <span aria-hidden="true">
                    ♿
                  </span>

                  <span>
                    {formatMinOrderAmount(
                      restaurant.minOrderAmount,
                    )}
                    {' · '}
                    {restaurant.deliveryTime ||
                      'Delivery time unavailable'}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function FoodPage() {
  const navigate = useNavigate()

  const [restaurants, setRestaurants] =
    useState<RestaurantResponse[]>([])

  const [backendCategories, setBackendCategories] =
    useState<DishCategoryResponse[]>([])

  const [isRestaurantsLoading, setIsRestaurantsLoading] =
    useState(true)

  const [isCategoriesLoading, setIsCategoriesLoading] =
    useState(true)

  useEffect(() => {
    let isMounted = true

    const loadRestaurants = async () => {
      try {
        const data =
          await getActiveRestaurants()

        if (!isMounted) {
          return
        }

        setRestaurants(
          Array.isArray(data)
            ? data.filter(
                (restaurant) =>
                  restaurant.isActive !== false,
              )
            : [],
        )
      } catch (error) {
        console.error(
          'Failed to load restaurants:',
          error,
        )

        if (isMounted) {
          setRestaurants([])
        }
      } finally {
        if (isMounted) {
          setIsRestaurantsLoading(false)
        }
      }
    }

    void loadRestaurants()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const { data } = await api.get<
          PaginatedResponse<DishCategoryResponse>
        >('/categories', {
          params: {
            page: 0,
            size: 100,
          },
        })

        if (!isMounted) {
          return
        }

        setBackendCategories(
          data.content ?? [],
        )
      } catch (error) {
        console.error(
          'Failed to load categories:',
          error,
        )

        if (isMounted) {
          setBackendCategories([])
        }
      } finally {
        if (isMounted) {
          setIsCategoriesLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo<
    FoodCategory[]
  >(() => {
    const categoryMap = new Map<
      string,
      {
        id: number
        title: string
        image: string
        restaurantIds: Set<number>
      }
    >()

    backendCategories.forEach(
      (category) => {
        if (!category.isActive) {
          return
        }

        const trimmedName =
          category.name.trim()

        if (!trimmedName) {
          return
        }

        const key =
          trimmedName.toLowerCase()

        const existingCategory =
          categoryMap.get(key)

        if (existingCategory) {
          existingCategory.restaurantIds.add(
            category.restaurantId,
          )

          if (
            !existingCategory.image &&
            category.imageUrl
          ) {
            existingCategory.image =
              category.imageUrl
          }

          return
        }

        categoryMap.set(key, {
          id: category.id,
          title: trimmedName,
          image:
            category.imageUrl ||
            getCategoryFallbackImage(
              trimmedName,
            ),
          restaurantIds: new Set([
            category.restaurantId,
          ]),
        })
      },
    )

    return Array.from(
      categoryMap.values(),
    ).map((category) => {
      const restaurantCount =
        category.restaurantIds.size

      return {
        id: category.id,
        title: category.title,
        image:
          category.image ||
          getCategoryFallbackImage(
            category.title,
          ),
        subtitle: `${restaurantCount} ${
          restaurantCount === 1
            ? 'establishment'
            : 'establishments'
        }`,
      }
    })
  }, [backendCategories])

  const establishmentRestaurants =
    useMemo(
      () => restaurants.slice(0, 10),
      [restaurants],
    )

  const fastestRestaurants =
    useMemo(() => {
      return [...restaurants]
        .sort(
          (firstRestaurant, secondRestaurant) =>
            getDeliveryMinutes(
              firstRestaurant.deliveryTime,
            ) -
            getDeliveryMinutes(
              secondRestaurant.deliveryTime,
            ),
        )
        .slice(0, 10)
    }, [restaurants])

  const handleRestaurantClick = (
    restaurant: RestaurantResponse,
  ) => {
    navigate(
      `/food/restaurants/${restaurant.id}`,
    )
  }

  const handleCategoryClick = (
    category: FoodCategory,
  ) => {
    navigate(
      `/food/category/${category.id}`,
    )
  }

  return (
    <main className="food-page">
      <section className="food-screen">
        <header className="food-header">
          <button
            className="food-header-button"
            type="button"
            onClick={() =>
              navigate('/', {
                replace: true,
              })
            }
            aria-label="Go back"
          >
            <img
              src={backButtonIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <div
            className="food-logo"
            aria-label="UT Food"
          >
            <img
              src={utLogo}
              alt="UT"
            />

            <img
              src={foodLogo}
              alt="Food"
            />
          </div>

          <button
            className="food-header-button"
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

        <div className="food-content">
          <button
            className="food-address"
            type="button"
          >
            <img
              src={mapIcon}
              alt=""
              aria-hidden="true"
            />

            <span>
              House, street Seobuk-gu
              Byeonhyeong-ro 569
            </span>

            <span aria-hidden="true">
              ⌄
            </span>
          </button>

          <button
            className="food-search"
            type="button"
            onClick={() =>
              navigate('/food/search')
            }
            aria-label="Open food search"
          >
            <img
              src={searchIcon}
              alt=""
              aria-hidden="true"
            />

            <span>
              Search for cafes, restaurants
              and dishes
            </span>
          </button>

          <section className="food-banner">
            <img
              src={coffeeImage}
              alt="Coffee promotion"
            />

            <div className="food-banner-text">
              <strong>
                Delicious coffee
              </strong>

              <span>
                Short promotional text -20%
                on everything
              </span>
            </div>
          </section>

          <div
            className="food-banner-dots"
            aria-hidden="true"
          >
            <span />
            <span />
            <span className="active" />
            <span />
            <span />
          </div>

          <section className="food-section">
            <div className="food-section-header">
              <h2>Categories</h2>
            </div>

            {isCategoriesLoading ? (
              <p>
                Loading categories...
              </p>
            ) : categories.length > 0 ? (
              <div className="food-horizontal-list food-category-list">
                {categories.map(
                  (category) => (
                    <button
                      className="food-category-card"
                      type="button"
                      key={`${category.title}-${category.id}`}
                      onClick={() =>
                        handleCategoryClick(
                          category,
                        )
                      }
                    >
                      <img
                        src={category.image}
                        alt={category.title}
                        onError={(event) => {
                          event.currentTarget.onerror =
                            null

                          event.currentTarget.src =
                            getCategoryFallbackImage(
                              category.title,
                            )
                        }}
                      />

                      <strong>
                        {category.title}
                      </strong>

                      <span>
                        {category.subtitle}
                      </span>
                    </button>
                  ),
                )}
              </div>
            ) : (
              <p>
                No categories available
              </p>
            )}
          </section>

          {isRestaurantsLoading ? (
            <section className="food-section">
              <p>
                Loading restaurants...
              </p>
            </section>
          ) : restaurants.length > 0 ? (
            <>
              <RestaurantSection
                title="Establishments"
                moreTo="/food/establishments"
                restaurants={
                  establishmentRestaurants
                }
                onRestaurantClick={
                  handleRestaurantClick
                }
              />

              <RestaurantSection
                title="Fastest delivery"
                moreTo="/food/fastest-delivery"
                restaurants={
                  fastestRestaurants
                }
                onRestaurantClick={
                  handleRestaurantClick
                }
              />

              <RestaurantSection
                title="Fastest delivery"
                moreTo="/food/fastest-delivery"
                restaurants={
                  fastestRestaurants
                }
                onRestaurantClick={
                  handleRestaurantClick
                }
              />
            </>
          ) : (
            <section className="food-section">
              <p>
                No restaurants available
              </p>
            </section>
          )}
        </div>

        <nav
          className="bottom-nav"
          aria-label="Main navigation"
        >
          <Link
            className="bottom-nav-link active"
            to="/"
          >
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Home</span>
          </Link>

          <Link
            className="bottom-nav-link"
            to="/favorites"
          >
            <img
              src={favoritesIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Favorites</span>
          </Link>

          <Link
            className="bottom-nav-link"
            to="/profile"
          >
            <img
              src={profileIcon}
              alt=""
              aria-hidden="true"
            />

            <span>Profile</span>
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default FoodPage