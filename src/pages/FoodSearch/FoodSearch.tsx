import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import backButtonIcon from '../../assets/search/Back button.svg'
import bellIcon from '../../assets/search/bell.svg'
import cuisineAreaImage from '../../assets/search/Cuisine in the area.svg'
import filterIcon from '../../assets/search/filter.svg'
import foodLogo from '../../assets/search/food.svg'
import mapIcon from '../../assets/search/map.svg'
import searchIcon from '../../assets/search/search.svg'
import utLogo from '../../assets/search/ut.svg'

import {
  searchDishes,
} from '../../services/dishService'

import {
  searchRestaurants,
} from '../../services/restaurantService'

import type {
  DishResponse,
  RestaurantResponse,
} from '../../types/restaurant'

import './FoodSearch.css'

type FilterValue =
  | 'all'
  | 'restaurants'
  | 'dishes'

type SortValue =
  | 'recommended'
  | 'rating'

function getRestaurantImage(
  restaurant: RestaurantResponse,
): string {
  if (
    restaurant.imageUrl &&
    restaurant.imageUrl.trim() !== ''
  ) {
    return restaurant.imageUrl
  }

  return cuisineAreaImage
}

function getDishImage(
  dish: DishResponse,
): string {
  if (
    dish.imageUrl &&
    dish.imageUrl.trim() !== ''
  ) {
    return dish.imageUrl
  }

  return cuisineAreaImage
}

function getRestaurantCategory(
  restaurant: RestaurantResponse,
): string {
  if (
    restaurant.category &&
    restaurant.category.trim() !== ''
  ) {
    return restaurant.category
  }

  return 'Restaurant'
}

function getDeliveryTime(
  restaurant: RestaurantResponse,
): string {
  if (
    restaurant.deliveryTime &&
    restaurant.deliveryTime.trim() !== ''
  ) {
    return restaurant.deliveryTime
  }

  return '—'
}

function formatPrice(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
    return '0'
  }

  return new Intl.NumberFormat(
    'en-US',
  ).format(value)
}

function FoodSearch() {
  const navigate = useNavigate()

  const [
    searchValue,
    setSearchValue,
  ] = useState('')

  const [
    restaurants,
    setRestaurants,
  ] = useState<RestaurantResponse[]>([])

  const [
    dishes,
    setDishes,
  ] = useState<DishResponse[]>([])

  const [
    isFilterOpen,
    setIsFilterOpen,
  ] = useState(false)

  const [
    filter,
    setFilter,
  ] = useState<FilterValue>('all')

  const [
    sort,
    setSort,
  ] = useState<SortValue>('recommended')

  const [
    isLoading,
    setIsLoading,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const normalizedSearch =
    searchValue.trim()

  useEffect(() => {
    if (!normalizedSearch) {
      return
    }

    let isMounted = true

    const timeoutId =
      window.setTimeout(
        async () => {
          try {
            setIsLoading(true)
            setErrorMessage('')

            const [
              restaurantsResult,
              dishesResult,
            ] = await Promise.allSettled([
              searchRestaurants(
                normalizedSearch,
                0,
                50,
              ),
              searchDishes(
                normalizedSearch,
                0,
                50,
              ),
            ])

            if (!isMounted) {
              return
            }

            if (
              restaurantsResult.status ===
              'fulfilled'
            ) {
              const activeRestaurants = (
                restaurantsResult.value
                  .content ?? []
              ).filter(
                (restaurant) =>
                  restaurant.isActive !==
                  false,
              )

              setRestaurants(
                activeRestaurants,
              )
            } else {
              console.error(
                'Restaurant search failed:',
                restaurantsResult.reason,
              )

              setRestaurants([])
            }

            if (
              dishesResult.status ===
              'fulfilled'
            ) {
              const activeDishes = (
                dishesResult.value.content ??
                []
              ).filter(
                (dish) =>
                  dish.isActive !== false &&
                  dish.isDeleted !== true,
              )

              setDishes(
                activeDishes,
              )
            } else {
              console.error(
                'Dish search failed:',
                dishesResult.reason,
              )

              setDishes([])
            }

            if (
              restaurantsResult.status ===
                'rejected' &&
              dishesResult.status ===
                'rejected'
            ) {
              setErrorMessage(
                'Failed to search.',
              )
            }
          } catch (error) {
            console.error(
              'Food search failed:',
              error,
            )

            if (!isMounted) {
              return
            }

            setRestaurants([])
            setDishes([])
            setErrorMessage(
              'Failed to search.',
            )
          } finally {
            if (isMounted) {
              setIsLoading(false)
            }
          }
        },
        350,
      )

    return () => {
      isMounted = false

      window.clearTimeout(
        timeoutId,
      )
    }
  }, [
    normalizedSearch,
  ])

  const visibleRestaurants =
    useMemo(() => {
      const results = [
        ...restaurants,
      ]

      if (sort === 'rating') {
        return results.sort(
          (
            firstRestaurant,
            secondRestaurant,
          ) =>
            secondRestaurant.ratings -
            firstRestaurant.ratings,
        )
      }

      return results.sort(
        (
          firstRestaurant,
          secondRestaurant,
        ) =>
          Number(
            secondRestaurant.isRecommended,
          ) -
          Number(
            firstRestaurant.isRecommended,
          ),
      )
    }, [
      restaurants,
      sort,
    ])

  const showRestaurants =
    filter === 'all' ||
    filter === 'restaurants'

  const showDishes =
    filter === 'all' ||
    filter === 'dishes'

  const showPrompt =
    normalizedSearch.length === 0

  const restaurantCount =
    showRestaurants
      ? visibleRestaurants.length
      : 0

  const dishCount =
    showDishes
      ? dishes.length
      : 0

  const totalVisibleResults =
    restaurantCount + dishCount

  const showEmptyResult =
    normalizedSearch.length > 0 &&
    !isLoading &&
    !errorMessage &&
    totalVisibleResults === 0

  const handleSearchChange = (
    value: string,
  ) => {
    setSearchValue(value)

    if (!value.trim()) {
      setRestaurants([])
      setDishes([])
      setErrorMessage('')
      setIsLoading(false)
    }
  }

  const handleRestaurantClick = (
    restaurantId: number,
  ) => {
    navigate(
      `/food/restaurants/${restaurantId}`,
    )
  }

  const handleDishClick = (
    dish: DishResponse,
  ) => {
    navigate(
      `/food/restaurants/${dish.restaurantId}`,
    )
  }

  return (
    <main className="mobile-page food-search-page">
      <section className="food-search-screen">
        <header className="food-search-header">
          <button
            className="food-search-header-button"
            type="button"
            onClick={() =>
              navigate(-1)
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
            className="food-search-logo"
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
            className="food-search-header-button"
            type="button"
            onClick={() =>
              navigate(
                '/notifications',
              )
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

        <div className="food-search-address">
          <img
            src={mapIcon}
            alt=""
            aria-hidden="true"
          />

          <span>
            Home, street Seobuk-gu
            Byeonhyeong-ro 569
          </span>
        </div>

        <div className="food-search-bar-wrapper">
          <label className="food-search-input-wrapper">
            <img
              src={searchIcon}
              alt=""
              aria-hidden="true"
            />

            <input
              autoFocus
              type="search"
              value={searchValue}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value,
                )
              }
              placeholder="Search for restaurants and dishes"
              aria-label="Search for restaurants and dishes"
            />
          </label>

          <button
            className={`food-filter-button ${
              isFilterOpen
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              setIsFilterOpen(true)
            }
            aria-label="Open filters"
          >
            <img
              src={filterIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>

        {!isFilterOpen && (
          <div className="food-search-main-content">
            {showPrompt && (
              <p className="food-search-prompt">
                What shall we
                <br />
                search for?
              </p>
            )}

            {isLoading && (
              <p className="food-search-empty">
                Searching...
              </p>
            )}

            {errorMessage && (
              <p
                className="food-search-empty"
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            {!isLoading &&
              showRestaurants &&
              visibleRestaurants.length >
                0 && (
                <section className="food-search-section">
                  <div className="food-search-section-header">
                    <h2 className="food-search-section-title">
                      Restaurants
                    </h2>

                    <span className="food-search-section-count">
                      {restaurantCount}
                    </span>
                  </div>

                  <div className="food-search-results">
                    {visibleRestaurants.map(
                      (restaurant) => (
                        <button
                          className="food-search-result-card"
                          type="button"
                          key={
                            restaurant.id
                          }
                          onClick={() =>
                            handleRestaurantClick(
                              restaurant.id,
                            )
                          }
                          aria-label={`Open ${restaurant.title}`}
                        >
                          <img
                            className="food-search-result-image"
                            src={getRestaurantImage(
                              restaurant,
                            )}
                            alt={
                              restaurant.title
                            }
                            onError={(
                              event,
                            ) => {
                              event.currentTarget.onerror =
                                null

                              event.currentTarget.src =
                                cuisineAreaImage
                            }}
                          />

                          <div className="food-search-result-info">
                            <h2>
                              {
                                restaurant.title
                              }
                            </h2>

                            <p>
                              {getRestaurantCategory(
                                restaurant,
                              )}
                            </p>

                            <span>
                              Min. order:{' '}
                              {formatPrice(
                                restaurant.minOrderAmount,
                              )}{' '}
                              won ·{' '}
                              {getDeliveryTime(
                                restaurant,
                              )}
                            </span>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </section>
              )}

            {!isLoading &&
              showDishes &&
              dishes.length > 0 && (
                <section className="food-search-section">
                  <div className="food-search-section-header">
                    <h2 className="food-search-section-title">
                      Dishes
                    </h2>

                    <span className="food-search-section-count">
                      {dishCount}
                    </span>
                  </div>

                  <div className="food-search-results">
                    {dishes.map(
                      (dish) => (
                        <button
                          className="food-search-result-card"
                          type="button"
                          key={
                            dish.id
                          }
                          onClick={() =>
                            handleDishClick(
                              dish,
                            )
                          }
                          aria-label={`Open ${dish.title}`}
                        >
                          <img
                            className="food-search-result-image"
                            src={getDishImage(
                              dish,
                            )}
                            alt={
                              dish.title
                            }
                            onError={(
                              event,
                            ) => {
                              event.currentTarget.onerror =
                                null

                              event.currentTarget.src =
                                cuisineAreaImage
                            }}
                          />

                          <div className="food-search-result-info">
                            <h2>
                              {dish.title}
                            </h2>

                            <p>
                              {
                                dish.restaurantName
                              }
                            </p>

                            <span>
                              {formatPrice(
                                dish.price,
                              )}{' '}
                              won
                              {dish.categoryName
                                ? ` · ${dish.categoryName}`
                                : ''}
                            </span>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </section>
              )}

            {showEmptyResult && (
              <p className="food-search-empty">
                Nothing was found
              </p>
            )}
          </div>
        )}

        {isFilterOpen && (
          <section className="food-filter-panel">
            <div className="food-filter-content">
              <h1>Filter</h1>

              <div className="food-filter-options">
                <button
                  className={
                    filter === 'all'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setFilter('all')
                  }
                >
                  All results
                </button>

                <button
                  className={
                    filter ===
                    'restaurants'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setFilter(
                      'restaurants',
                    )
                  }
                >
                  Restaurants
                </button>

                <button
                  className={
                    filter === 'dishes'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setFilter('dishes')
                  }
                >
                  Dishes
                </button>
              </div>

              <h2>
                Sort restaurants by
              </h2>

              <div className="food-filter-options">
                <button
                  className={
                    sort ===
                    'recommended'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setSort(
                      'recommended',
                    )
                  }
                >
                  Recommended
                </button>

                <button
                  className={
                    sort === 'rating'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setSort('rating')
                  }
                >
                  Rating
                </button>
              </div>
            </div>

            <div className="food-filter-footer">
              <button
                type="button"
                onClick={() =>
                  setIsFilterOpen(
                    false,
                  )
                }
              >
                Close
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default FoodSearch