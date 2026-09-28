import { parseHoursRow, isValidHoursRow } from '../../../utils/openingHours'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

import { uploadFile } from '../../../services/fileService'
import {
  getOwnerRestaurants,
  updateOwnerRestaurant,
} from '../../../services/ownerEditRestaurantService'

import type { OwnerRestaurant } from '../../../services/ownerEditRestaurantService'
import { getErrorMessage } from '../../../utils/getErrorMessage'
import { logError } from '../../../utils/logger'

import './OwnerEditRestaurantPage.css'

const MIN_ORDER_OPTIONS = ['5000', '10000', '15000', '20000', '30000']

const CATEGORY_OPTIONS = [
  'Fast food',
  'Asian',
  'Korean',
  'Russian',
  'Uzbek',
  'European',
]

// Weekday hours (Mon-Fri) live on dayOfWeek 1-5, weekend hours (Sat-Sun) on
// 6-7. The form only exposes these two combined rows, not per-day editing.
const WEEKDAY_DAYS = [1, 2, 3, 4, 5]
const WEEKEND_DAYS = [6, 7]

// The form only exposes one combined row per group (weekdays / weekend),
// but individual days within a group can carry different hours (e.g. one
// weekday marked as a day off while the rest are open). Rather than always
// reading the first day in the group — which silently hid the real hours
// whenever that first day happened to differ from the rest — this takes
// the most common working pattern among the group's open days, so a single
// outlier day doesn't blank out the row.
function formatHoursRow(
  restaurant: OwnerRestaurant | null,
  days: number[],
): string {
  if (!restaurant) {
    return ''
  }

  const modesInGroup = (restaurant.operatingModes ?? []).filter((item) =>
    days.includes(item.dayOfWeek),
  )

  const openModes = modesInGroup.filter(
    (mode) => !mode.dayOff && mode.start && mode.end,
  )

  if (openModes.length === 0) {
    return ''
  }

  const countByHours = new Map<string, number>()

  openModes.forEach((mode) => {
    const key = `${mode.start} — ${mode.end}`

    countByHours.set(key, (countByHours.get(key) ?? 0) + 1)
  })

  let mostCommonHours = ''
  let highestCount = 0

  countByHours.forEach((count, hours) => {
    if (count > highestCount) {
      mostCommonHours = hours
      highestCount = count
    }
  })

  return mostCommonHours
}

// True when the days in a group don't all share the same hours/day-off
// state, so saving the single combined row would flatten real differences.
function hasMixedHours(
  restaurant: OwnerRestaurant | null,
  days: number[],
): boolean {
  if (!restaurant) {
    return false
  }

  const modesInGroup = (restaurant.operatingModes ?? []).filter((item) =>
    days.includes(item.dayOfWeek),
  )

  const signatures = new Set(
    modesInGroup.map((mode) =>
      mode.dayOff ? 'off' : `${mode.start ?? ''}-${mode.end ?? ''}`,
    ),
  )

  return signatures.size > 1
}

export default function OwnerEditRestaurantPage() {
  const navigate = useNavigate()

  const { user } = useAuth()

  const userId = Number(user?.id)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [restaurant, setRestaurant] = useState<OwnerRestaurant | null>(null)

  const [title, setTitle] = useState('')

  const [description, setDescription] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [existingImageUrl, setExistingImageUrl] = useState('')

  const [weekdayHours, setWeekdayHours] = useState('')

  const [weekendHours, setWeekendHours] = useState('')
  const [weekdayHoursEdited, setWeekdayHoursEdited] = useState(false)
  const [weekendHoursEdited, setWeekendHoursEdited] = useState(false)

  const [minOrderAmount, setMinOrderAmount] = useState('')

  const [category, setCategory] = useState('')

  const [city, setCity] = useState(
    () => sessionStorage.getItem('ownerEditRestaurantCity') ?? '',
  )

  const [area, setArea] = useState(
    () => sessionStorage.getItem('ownerEditRestaurantArea') ?? '',
  )

  const [isLoading, setIsLoading] = useState(true)

  const [isSaving, setIsSaving] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')

  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!userId) {
      return
    }

    let isActive = true

    getOwnerRestaurants(userId)
      .then((restaurants) => {
        if (!isActive) {
          return
        }

        const firstRestaurant = restaurants[0] ?? null

        setRestaurant(firstRestaurant)

        if (!firstRestaurant) {
          setErrorMessage('Restaurant was not found')

          return
        }

        setTitle(firstRestaurant.title ?? '')

        setDescription(firstRestaurant.description ?? '')

        setExistingImageUrl(firstRestaurant.imageUrl ?? '')

        setWeekdayHours(formatHoursRow(firstRestaurant, WEEKDAY_DAYS))

        setWeekendHours(formatHoursRow(firstRestaurant, WEEKEND_DAYS))

        setMinOrderAmount(
          firstRestaurant.minOrderAmount != null
            ? String(firstRestaurant.minOrderAmount)
            : '',
        )

        setCategory(firstRestaurant.category ?? '')

        setCity(
          sessionStorage.getItem('ownerEditRestaurantCity') ??
            firstRestaurant.address?.city ??
            '',
        )

        setArea(
          sessionStorage.getItem('ownerEditRestaurantArea') ??
            firstRestaurant.address?.area ??
            '',
        )

        setErrorMessage('')
      })
      .catch((error: unknown) => {
        logError('OwnerEditRestaurantPage: failed to load restaurant', error)

        if (!isActive) {
          return
        }

        setRestaurant(null)

        setErrorMessage(getErrorMessage(error, 'Something went wrong'))
      })
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

  const weekdayHoursAreMixed = hasMixedHours(restaurant, WEEKDAY_DAYS)

  const weekendHoursAreMixed = hasMixedHours(restaurant, WEEKEND_DAYS)

  const isWeekdayHoursValid = isValidHoursRow(weekdayHours)

  const isWeekendHoursValid = isValidHoursRow(weekendHours)

  const isSaveDisabled =
    isSaving ||
    !restaurant ||
    !title.trim() ||
    !description.trim() ||
    !category.trim() ||
    !city.trim() ||
    !area.trim() ||
    !minOrderAmount.trim() ||
    !isWeekdayHoursValid ||
    !isWeekendHoursValid

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!restaurant || isSaveDisabled) {
      return
    }

    const parsedMinOrderAmount = Number(minOrderAmount)

    if (!Number.isFinite(parsedMinOrderAmount) || parsedMinOrderAmount < 0) {
      setErrorMessage('Minimum order must be a valid number')

      return
    }

    if (!isValidHoursRow(weekdayHours) || !isValidHoursRow(weekendHours)) {
      setErrorMessage(
        'Opening hours must be in the format "9:00 — 22:00", or left blank for a day off',
      )

      return
    }

    if (!area.trim()) {
      setErrorMessage('Delivery area must be filled in')

      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      let imageUrl = existingImageUrl

      if (imageFile) {
        imageUrl = await uploadFile(imageFile)
      }

      const parsedWeekday = parseHoursRow(weekdayHours)
      const parsedWeekend = parseHoursRow(weekendHours)

      const otherModes = (restaurant.operatingModes ?? []).filter(
        (mode) =>
          !WEEKDAY_DAYS.includes(mode.dayOfWeek) &&
          !WEEKEND_DAYS.includes(mode.dayOfWeek),
      )

      const weekdayModes = WEEKDAY_DAYS.map((dayOfWeek) => {
        const existing = restaurant.operatingModes?.find(
          (mode) => mode.dayOfWeek === dayOfWeek,
        )

        return {
          id: existing?.id ?? 0,
          dayOfWeek,
          start: parsedWeekday?.start ?? null,
          end: parsedWeekday?.end ?? null,
          dayOff: !parsedWeekday,
        }
      })

      const weekendModes = WEEKEND_DAYS.map((dayOfWeek) => {
        const existing = restaurant.operatingModes?.find(
          (mode) => mode.dayOfWeek === dayOfWeek,
        )

        return {
          id: existing?.id ?? 0,
          dayOfWeek,
          start: parsedWeekend?.start ?? null,
          end: parsedWeekend?.end ?? null,
          dayOff: !parsedWeekend,
        }
      })

      const updatedRestaurant: OwnerRestaurant = {
        ...restaurant,

        title: title.trim(),

        description: description.trim(),

        imageUrl,

        minOrderAmount: parsedMinOrderAmount,

        category: category.trim(),

        operatingModes: [
          ...otherModes,
          ...(weekdayHoursEdited
            ? weekdayModes
            : restaurant.operatingModes.filter((mode) =>
                WEEKDAY_DAYS.includes(mode.dayOfWeek),
              )),
          ...(weekendHoursEdited
            ? weekendModes
            : restaurant.operatingModes.filter((mode) =>
                WEEKEND_DAYS.includes(mode.dayOfWeek),
              )),
        ],

        address: {
          ...restaurant.address,

          city: city.trim(),

          area: area.trim(),
        },
      }

      const response = await updateOwnerRestaurant(
        restaurant.id,
        updatedRestaurant,
      )

      setRestaurant(response)
      setWeekdayHours(formatHoursRow(response, WEEKDAY_DAYS))
      setWeekendHours(formatHoursRow(response, WEEKEND_DAYS))
      setWeekdayHoursEdited(false)
      setWeekendHoursEdited(false)

      setExistingImageUrl(response.imageUrl ?? '')
      setImageFile(null)
      setImagePreview(null)

      sessionStorage.removeItem('ownerEditRestaurantCity')

      sessionStorage.removeItem('ownerEditRestaurantArea')

      setSuccessMessage('Changes saved successfully')
    } catch (error: unknown) {
      logError('OwnerEditRestaurantPage: failed to save restaurant', error)

      setErrorMessage(getErrorMessage(error, 'Something went wrong'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCityClick = () => {
    if (!restaurant) {
      return
    }

    sessionStorage.setItem('ownerEditRestaurantCity', city)

    sessionStorage.setItem('ownerEditRestaurantArea', area)

    navigate(`/owner/restaurant/edit/city?restaurantId=${restaurant.id}`)
  }

  const handleDeleteClick = () => {
    setErrorMessage(
      'Restaurant deletion is not available for restaurant owners',
    )
  }

  const previewSrc = imagePreview || existingImageUrl || ''

  if (isLoading) {
    return (
      <main className="owner-edit-restaurant-page">
        <div className="owner-edit-restaurant-loading">Loading...</div>
      </main>
    )
  }

  return (
    <main className="owner-edit-restaurant-page">
      <section className="owner-edit-restaurant-content">
        <h1>Establishment</h1>

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
          <label htmlFor="restaurant-name">Name</label>

          <input
            id="restaurant-name"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="owner-edit-restaurant-field">
          <label htmlFor="restaurant-description">Description</label>

          <textarea
            id="restaurant-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="owner-edit-restaurant-field">
          <span className="owner-edit-restaurant-label">
            Image of establishment
          </span>

          <button
            type="button"
            className="owner-edit-restaurant-upload"
            onClick={handleImageClick}
          >
            <span>{previewSrc ? 'Image uploaded' : 'Upload image'}</span>

            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M12 15V4m0 0L7 9m5-5l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="owner-edit-restaurant-file-input"
            onChange={handleImageChange}
          />
        </div>

        <div className="owner-edit-restaurant-field">
          <span className="owner-edit-restaurant-label">Opening hours</span>

          <div className="owner-edit-restaurant-hours">
            <input
              type="text"
              placeholder="Mon-Fri, 9:00 — 22:00"
              value={weekdayHours}
              onChange={(event) => {
                setWeekdayHours(event.target.value)
                setWeekdayHoursEdited(true)
              }}
              aria-invalid={!isWeekdayHoursValid}
            />

            <input
              type="text"
              placeholder="Sat-Sun, 10:00 — 00:00"
              value={weekendHours}
              onChange={(event) => {
                setWeekendHours(event.target.value)
                setWeekendHoursEdited(true)
              }}
              aria-invalid={!isWeekendHoursValid}
            />
          </div>

          {(!isWeekdayHoursValid || !isWeekendHoursValid) && (
            <p
              className="owner-edit-restaurant-hint owner-edit-restaurant-hint-error"
              role="alert"
            >
              Use the format "9:00 — 22:00" (a hyphen also works), or leave the
              field blank for a day off.
            </p>
          )}

          {(weekdayHoursAreMixed || weekendHoursAreMixed) && (
            <p className="owner-edit-restaurant-hint">
              Some days currently have different hours than the rest of the
              group. Editing a group will apply the same hours to its days.
              Unchanged groups keep their individual schedules.
            </p>
          )}
        </div>

        <div className="owner-edit-restaurant-field">
          <label htmlFor="restaurant-min-order">Minimum order</label>

          <select
            id="restaurant-min-order"
            value={minOrderAmount}
            onChange={(event) => setMinOrderAmount(event.target.value)}
          >
            <option value="">Select amount</option>
            {MIN_ORDER_OPTIONS.map((amount) => (
              <option key={amount} value={amount}>
                {Number(amount).toLocaleString('en-US')}
              </option>
            ))}
          </select>
        </div>

        <div className="owner-edit-restaurant-field">
          <label htmlFor="restaurant-category">Category of establishment</label>

          <select
            id="restaurant-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="owner-edit-restaurant-field">
          <span className="owner-edit-restaurant-label">Delivery area</span>

          <button
            type="button"
            className="owner-edit-restaurant-select"
            onClick={handleCityClick}
          >
            <span>{city || 'Select delivery area'}</span>

            <span className="owner-edit-restaurant-chevron">›</span>
          </button>
        </div>
      </section>

      <footer className="owner-edit-restaurant-actions">
        <button
          type="button"
          className="owner-edit-restaurant-save"
          disabled={isSaveDisabled}
          onClick={() => void handleSave()}
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>

        <button
          type="button"
          className="owner-edit-restaurant-delete"
          onClick={handleDeleteClick}
        >
          Delete
        </button>
      </footer>
    </main>
  )
}
