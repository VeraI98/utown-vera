import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import {
  getOwnerRestaurants,
  updateOwnerRestaurant,
} from '../../../services/ownerEditRestaurantService'

import type {
  OwnerRestaurant,
} from '../../../services/ownerEditRestaurantService'

import './OwnerEditRestaurantPage.css'

const DAY_NAMES: Record<
  number,
  string
> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }
    ).response

    if (response?.data?.message) {
      return response.data.message
    }
  }

  return 'Something went wrong'
}

function formatOpeningHours(
  restaurant: OwnerRestaurant,
): string[] {
  const modes = [
    ...(restaurant.operatingModes ??
      []),
  ].sort(
    (first, second) =>
      first.dayOfWeek -
      second.dayOfWeek,
  )

  if (modes.length === 0) {
    return [
      'Working hours are not specified',
    ]
  }

  return modes.map((mode) => {
    const day =
      DAY_NAMES[mode.dayOfWeek] ??
      `Day ${mode.dayOfWeek}`

    if (mode.dayOff) {
      return `${day}: Day off`
    }

    if (
      !mode.start ||
      !mode.end
    ) {
      return `${day}: Not specified`
    }

    return `${day}: ${mode.start} — ${mode.end}`
  })
}

export default function OwnerEditRestaurantPage() {
  const navigate = useNavigate()

  const { user } = useAuth()

  const userId = Number(
    user?.id,
  )

  const [
    restaurant,
    setRestaurant,
  ] =
    useState<OwnerRestaurant | null>(
      null,
    )

  const [
    title,
    setTitle,
  ] = useState('')

  const [
    description,
    setDescription,
  ] = useState('')

  const [
    imageUrl,
    setImageUrl,
  ] = useState('')

  const [
    minOrderAmount,
    setMinOrderAmount,
  ] = useState('')

  const [
    category,
    setCategory,
  ] = useState('')

  const [
    city,
    setCity,
  ] = useState(
    () =>
      sessionStorage.getItem(
        'ownerEditRestaurantCity',
      ) ?? '',
  )

  const [
    area,
    setArea,
  ] = useState(
    () =>
      sessionStorage.getItem(
        'ownerEditRestaurantArea',
      ) ?? '',
  )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  useEffect(() => {
    if (!userId) {
      return
    }

    let isActive = true

    getOwnerRestaurants(
      userId,
    )
      .then((restaurants) => {
        if (!isActive) {
          return
        }

        const firstRestaurant =
          restaurants[0] ??
          null

        setRestaurant(
          firstRestaurant,
        )

        if (!firstRestaurant) {
          setErrorMessage(
            'Restaurant was not found',
          )

          return
        }

        setTitle(
          firstRestaurant.title ??
            '',
        )

        setDescription(
          firstRestaurant.description ??
            '',
        )

        setImageUrl(
          firstRestaurant.imageUrl ??
            '',
        )

        setMinOrderAmount(
          String(
            firstRestaurant.minOrderAmount ??
              '',
          ),
        )

        setCategory(
          firstRestaurant.category ??
            '',
        )

        setCity(
          sessionStorage.getItem(
            'ownerEditRestaurantCity',
          ) ??
            firstRestaurant.address
              ?.city ??
            '',
        )

        setArea(
          sessionStorage.getItem(
            'ownerEditRestaurantArea',
          ) ??
            firstRestaurant.address
              ?.area ??
            '',
        )

        setErrorMessage('')
      })
      .catch(
        (error: unknown) => {
          if (!isActive) {
            return
          }

          setRestaurant(null)

          setErrorMessage(
            getErrorMessage(
              error,
            ),
          )
        },
      )
      .finally(() => {
        if (!isActive) {
          return
        }

        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [userId])

  const openingHours =
    useMemo(() => {
      if (!restaurant) {
        return []
      }

      return formatOpeningHours(
        restaurant,
      )
    }, [restaurant])

  const isSaveDisabled =
    isSaving ||
    !restaurant ||
    !title.trim() ||
    !description.trim() ||
    !category.trim() ||
    !city.trim() ||
    !area.trim() ||
    !minOrderAmount.trim()

  const handleSave =
    async () => {
      if (
        !restaurant ||
        isSaveDisabled
      ) {
        return
      }

      const parsedMinOrderAmount =
        Number(
          minOrderAmount,
        )

      if (
        !Number.isFinite(
          parsedMinOrderAmount,
        ) ||
        parsedMinOrderAmount < 0
      ) {
        setErrorMessage(
          'Minimum order must be a valid number',
        )

        return
      }

      setIsSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      try {
        const updatedRestaurant:
          OwnerRestaurant = {
          ...restaurant,

          title:
            title.trim(),

          description:
            description.trim(),

          imageUrl:
            imageUrl.trim(),

          minOrderAmount:
            parsedMinOrderAmount,

          category:
            category.trim(),

          address: {
            ...restaurant.address,

            city:
              city.trim(),

            area:
              area.trim(),
          },
        }

        const response =
          await updateOwnerRestaurant(
            restaurant.id,
            updatedRestaurant,
          )

        setRestaurant(
          response,
        )

        sessionStorage.removeItem(
          'ownerEditRestaurantCity',
        )

        sessionStorage.removeItem(
          'ownerEditRestaurantArea',
        )

        setSuccessMessage(
          'Changes saved successfully',
        )
      } catch (
        error: unknown
      ) {
        setErrorMessage(
          getErrorMessage(
            error,
          ),
        )
      } finally {
        setIsSaving(false)
      }
    }

  const handleCityClick =
    () => {
      if (!restaurant) {
        return
      }

      sessionStorage.setItem(
        'ownerEditRestaurantCity',
        city,
      )

      sessionStorage.setItem(
        'ownerEditRestaurantArea',
        area,
      )

      navigate(
        `/owner/restaurant/edit/city?restaurantId=${restaurant.id}`,
      )
    }

  const handleDeleteClick =
    () => {
      setErrorMessage(
        'Restaurant deletion is not available for restaurant owners',
      )
    }

  if (isLoading) {
    return (
      <main className="owner-edit-restaurant-page">
        <div className="owner-edit-restaurant-loading">
          Loading...
        </div>
      </main>
    )
  }

  return (
    <main className="owner-edit-restaurant-page">
      <section className="owner-edit-restaurant-content">
        <h1>
          Establishment
        </h1>

        {errorMessage && (
          <p className="owner-edit-restaurant-message owner-edit-restaurant-message-error">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="owner-edit-restaurant-message owner-edit-restaurant-message-success">
            {successMessage}
          </p>
        )}

        <div className="owner-edit-restaurant-field">
          <label htmlFor="restaurant-name">
            Name
          </label>

          <input
            id="restaurant-name"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
          />
        </div>

        <div className="owner-edit-restaurant-field">
          <label htmlFor="restaurant-description">
            Description
          </label>

          <textarea
            id="restaurant-description"
            value={
              description
            }
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
          />
        </div>

        <div className="owner-edit-restaurant-field">
          <label htmlFor="restaurant-image">
            Image of establishment
          </label>

          <input
            id="restaurant-image"
            type="text"
            value={imageUrl}
            placeholder="Image URL"
            onChange={(event) =>
              setImageUrl(
                event.target.value,
              )
            }
          />
        </div>

        <div className="owner-edit-restaurant-field">
          <span className="owner-edit-restaurant-label">
            Opening hours
          </span>

          <div className="owner-edit-restaurant-hours">
            {openingHours.map(
              (
                openingHour,
              ) => (
                <div
                  key={
                    openingHour
                  }
                  className="owner-edit-restaurant-hours-row"
                >
                  {
                    openingHour
                  }
                </div>
              ),
            )}
          </div>
        </div>

        <div className="owner-edit-restaurant-field">
          <label htmlFor="restaurant-min-order">
            Minimum order
          </label>

          <input
            id="restaurant-min-order"
            type="number"
            min="0"
            step="0.01"
            value={
              minOrderAmount
            }
            onChange={(event) =>
              setMinOrderAmount(
                event.target.value,
              )
            }
          />
        </div>

        <div className="owner-edit-restaurant-field">
          <label htmlFor="restaurant-category">
            Category of
            establishment
          </label>

          <input
            id="restaurant-category"
            type="text"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
          />
        </div>

        <div className="owner-edit-restaurant-field">
          <span className="owner-edit-restaurant-label">
            Delivery area
          </span>

          <button
            type="button"
            className="owner-edit-restaurant-select"
            onClick={
              handleCityClick
            }
          >
            <span>
              {city && area
                ? `${city}, ${area}`
                : city ||
                  area ||
                  'Select delivery area'}
            </span>

            <span className="owner-edit-restaurant-chevron">
              ›
            </span>
          </button>
        </div>
      </section>

      <footer className="owner-edit-restaurant-actions">
        <button
          type="button"
          className="owner-edit-restaurant-save"
          disabled={
            isSaveDisabled
          }
          onClick={
            handleSave
          }
        >
          {isSaving
            ? 'Saving...'
            : 'Save changes'}
        </button>

        <button
          type="button"
          className="owner-edit-restaurant-delete"
          onClick={
            handleDeleteClick
          }
        >
          Delete
        </button>
      </footer>
    </main>
  )
}