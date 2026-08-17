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
  searchRestaurantsAdvanced,
} from '../../services/restaurantService'

import type {
  DishResponse,
  RestaurantResponse,
  RestaurantStatus,
} from '../../types/restaurant'

import './FoodSearch.css'

type FilterValue =
  | 'all'
  | 'restaurants'
  | 'dishes'

type SortValue =
  | 'recommended'
  | 'rating'

type StatusFilter =
  | 'all'
  | RestaurantStatus

type RatingFilter =
  | 0
  | 3
  | 4
  | 4.5

const INVALID_IMAGE_VALUES = [
  'string',
  'null',
  'undefined',
  'file uploaded successfully',
]

function isValidImageUrl(
  imageUrl?: string | null,
): boolean {
  if (!imageUrl) {
    return false
  }

  const value = imageUrl.trim()

  if (!value) {
    return false
  }

  return !INVALID_IMAGE_VALUES.includes(
    value.toLowerCase(),
  )
}

function getRestaurantImage(
  restaurant: RestaurantResponse,
): string {
  if (isValidImageUrl(restaurant.imageUrl)) {
    return restaurant.imageUrl as string
  }

  return cuisineAreaImage
}

function getDishImage(
  dish: DishResponse,
): string {
  if (isValidImageUrl(dish.imageUrl)) {
    return dish.imageUrl as string
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

function parseOptionalNumber(
  value: string,
): number | undefined {
  const normalizedValue =
    value.trim()

  if (!normalizedValue) {
    return undefined
  }

  const parsedValue =
    Number(normalizedValue)

  if (
    Number.isNaN(parsedValue) ||
    parsedValue < 0
  ) {
    return undefined
  }

  return parsedValue
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
    appliedFilter,
    setAppliedFilter,
  ] = useState<FilterValue>('all')

  const [
    appliedSort,
    setAppliedSort,
  ] = useState<SortValue>('recommended')

  const [
    appliedStatusFilter,
    setAppliedStatusFilter,
  ] = useState<StatusFilter>('all')

  const [
    appliedMinRating,
    setAppliedMinRating,
  ] = useState<RatingFilter>(0)

  const [
    appliedCity,
    setAppliedCity,
  ] = useState('')

  const [
    appliedMinOrderAmount,
    setAppliedMinOrderAmount,
  ] = useState('')

  const [
    appliedMaxOrderAmount,
    setAppliedMaxOrderAmount,
  ] = useState('')

  const [
    draftFilter,
    setDraftFilter,
  ] = useState<FilterValue>('all')

  const [
    draftSort,
    setDraftSort,
  ] = useState<SortValue>('recommended')

  const [
    draftStatusFilter,
    setDraftStatusFilter,
  ] = useState<StatusFilter>('all')

  const [
    draftMinRating,
    setDraftMinRating,
  ] = useState<RatingFilter>(0)

  const [
    draftCity,
    setDraftCity,
  ] = useState('')

  const [
    draftMinOrderAmount,
    setDraftMinOrderAmount,
  ] = useState('')

  const [
    draftMaxOrderAmount,
    setDraftMaxOrderAmount,
  ] = useState('')

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

  const normalizedAppliedCity =
    appliedCity.trim()

  const parsedAppliedMinOrderAmount =
    parseOptionalNumber(
      appliedMinOrderAmount,
    )

  const parsedAppliedMaxOrderAmount =
    parseOptionalNumber(
      appliedMaxOrderAmount,
    )

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

            const needsAdvancedSearch =
              appliedStatusFilter !==
                'all' ||
              appliedMinRating > 0 ||
              normalizedAppliedCity
                .length > 0 ||
              parsedAppliedMinOrderAmount !==
                undefined ||
              parsedAppliedMaxOrderAmount !==
                undefined

            const restaurantRequest =
              needsAdvancedSearch
                ? searchRestaurantsAdvanced({
                    title:
                      normalizedSearch,

                    ...(appliedStatusFilter !==
                    'all'
                      ? {
                          status:
                            appliedStatusFilter,
                        }
                      : {}),

                    ...(appliedMinRating > 0
                      ? {
                          minRating:
                            appliedMinRating,
                        }
                      : {}),

                    ...(normalizedAppliedCity
                      ? {
                          city:
                            normalizedAppliedCity,
                        }
                      : {}),

                    ...(parsedAppliedMinOrderAmount !==
                    undefined
                      ? {
                          minMinOrderAmount:
                            parsedAppliedMinOrderAmount,
                        }
                      : {}),

                    ...(parsedAppliedMaxOrderAmount !==
                    undefined
                      ? {
                          maxMinOrderAmount:
                            parsedAppliedMaxOrderAmount,
                        }
                      : {}),

                    page: 0,
                    size: 50,
                  })
                : searchRestaurants(
                    normalizedSearch,
                    0,
                    50,
                  )

            const [
              restaurantsResult,
              dishesResult,
            ] = await Promise.allSettled([
              restaurantRequest,

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
    appliedStatusFilter,
    appliedMinRating,
    normalizedAppliedCity,
    parsedAppliedMinOrderAmount,
    parsedAppliedMaxOrderAmount,
  ])

  const visibleRestaurants =
    useMemo(() => {
      const results = [
        ...restaurants,
      ]

      if (
        appliedSort === 'rating'
      ) {
        return results.sort(
          (
            firstRestaurant,
            secondRestaurant,
          ) =>
            secondRestaurant.ratings -
            firstRestaurant.ratings,
        )
      }

      if (
        appliedSort === 'recommended'
      ) {
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
      }

      return results
    }, [
      restaurants,
      appliedSort,
    ])

  const showRestaurants =
    appliedFilter === 'all' ||
    appliedFilter === 'restaurants'

  const showDishes =
    appliedFilter === 'all' ||
    appliedFilter === 'dishes'

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

  const hasAppliedFilters =
    appliedFilter !== 'all' ||
    appliedSort !== 'recommended' ||
    appliedStatusFilter !== 'all' ||
    appliedMinRating > 0 ||
    normalizedAppliedCity.length > 0 ||
    appliedMinOrderAmount.trim()
      .length > 0 ||
    appliedMaxOrderAmount.trim()
      .length > 0

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

  const handleOpenFilters = () => {
    setDraftFilter(
      appliedFilter,
    )

    setDraftSort(
      appliedSort,
    )

    setDraftStatusFilter(
      appliedStatusFilter,
    )

    setDraftMinRating(
      appliedMinRating,
    )

    setDraftCity(
      appliedCity,
    )

    setDraftMinOrderAmount(
      appliedMinOrderAmount,
    )

    setDraftMaxOrderAmount(
      appliedMaxOrderAmount,
    )

    setIsFilterOpen(true)
  }

  const handleApplyFilters = () => {
    setAppliedFilter(
      draftFilter,
    )

    setAppliedSort(
      draftSort,
    )

    setAppliedStatusFilter(
      draftStatusFilter,
    )

    setAppliedMinRating(
      draftMinRating,
    )

    setAppliedCity(
      draftCity,
    )

    setAppliedMinOrderAmount(
      draftMinOrderAmount,
    )

    setAppliedMaxOrderAmount(
      draftMaxOrderAmount,
    )

    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setDraftFilter('all')
    setDraftSort('recommended')
    setDraftStatusFilter('all')
    setDraftMinRating(0)
    setDraftCity('')
    setDraftMinOrderAmount('')
    setDraftMaxOrderAmount('')
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

        <div
          className="food-search-address"
          aria-label="Delivery area"
        >
          <img
            src={mapIcon}
            alt=""
            aria-hidden="true"
          />

          <span>
            Delivery area
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
              isFilterOpen ||
              hasAppliedFilters
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={
              handleOpenFilters
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
                          key={dish.id}
                          onClick={() =>
                            handleDishClick(
                              dish,
                            )
                          }
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
              <div className="food-filter-title-row">
                <h1>Filter</h1>

                <button
                  className="food-filter-reset"
                  type="button"
                  onClick={
                    handleResetFilters
                  }
                >
                  Reset
                </button>
              </div>

              <h2>Show</h2>

              <div className="food-filter-options">
                <button
                  className={
                    draftFilter === 'all'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftFilter(
                      'all',
                    )
                  }
                >
                  All results
                </button>

                <button
                  className={
                    draftFilter ===
                    'restaurants'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftFilter(
                      'restaurants',
                    )
                  }
                >
                  Restaurants
                </button>

                <button
                  className={
                    draftFilter ===
                    'dishes'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftFilter(
                      'dishes',
                    )
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
                    draftSort ===
                    'recommended'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftSort(
                      'recommended',
                    )
                  }
                >
                  Recommended
                </button>

                <button
                  className={
                    draftSort ===
                    'rating'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftSort(
                      'rating',
                    )
                  }
                >
                  Rating
                </button>
              </div>

              <h2>Status</h2>

              <div className="food-filter-options">
                <button
                  className={
                    draftStatusFilter ===
                    'all'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftStatusFilter(
                      'all',
                    )
                  }
                >
                  All
                </button>

                <button
                  className={
                    draftStatusFilter ===
                    'OPEN'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftStatusFilter(
                      'OPEN',
                    )
                  }
                >
                  Open
                </button>

                <button
                  className={
                    draftStatusFilter ===
                    'BUSY'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftStatusFilter(
                      'BUSY',
                    )
                  }
                >
                  Busy
                </button>

                <button
                  className={
                    draftStatusFilter ===
                    'TEMPORARILY_CLOSED'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftStatusFilter(
                      'TEMPORARILY_CLOSED',
                    )
                  }
                >
                  Temporarily closed
                </button>

                <button
                  className={
                    draftStatusFilter ===
                    'CLOSED'
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftStatusFilter(
                      'CLOSED',
                    )
                  }
                >
                  Closed
                </button>
              </div>

              <h2>Minimum rating</h2>

              <div className="food-filter-options">
                <button
                  className={
                    draftMinRating === 0
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftMinRating(0)
                  }
                >
                  Any
                </button>

                <button
                  className={
                    draftMinRating === 3
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftMinRating(3)
                  }
                >
                  3+
                </button>

                <button
                  className={
                    draftMinRating === 4
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftMinRating(4)
                  }
                >
                  4+
                </button>

                <button
                  className={
                    draftMinRating ===
                    4.5
                      ? 'active'
                      : ''
                  }
                  type="button"
                  onClick={() =>
                    setDraftMinRating(
                      4.5,
                    )
                  }
                >
                  4.5+
                </button>
              </div>

              <h2>City</h2>

              <input
                className="food-filter-input"
                type="text"
                value={draftCity}
                onChange={(event) =>
                  setDraftCity(
                    event.target.value,
                  )
                }
                placeholder="Enter city"
              />

              <h2>Order amount</h2>

              <div className="food-filter-price-row">
                <label>
                  <span>From</span>

                  <input
                    className="food-filter-input"
                    type="number"
                    min="0"
                    value={
                      draftMinOrderAmount
                    }
                    onChange={(event) =>
                      setDraftMinOrderAmount(
                        event.target.value,
                      )
                    }
                    placeholder="0"
                  />
                </label>

                <label>
                  <span>To</span>

                  <input
                    className="food-filter-input"
                    type="number"
                    min="0"
                    value={
                      draftMaxOrderAmount
                    }
                    onChange={(event) =>
                      setDraftMaxOrderAmount(
                        event.target.value,
                      )
                    }
                    placeholder="50000"
                  />
                </label>
              </div>
            </div>

            <div className="food-filter-footer">
              <button
                type="button"
                onClick={
                  handleApplyFilters
                }
              >
                Show results
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default FoodSearch