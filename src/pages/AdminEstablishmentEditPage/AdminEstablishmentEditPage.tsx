import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  getEstablishmentById,
  updateEstablishment,
} from '../../services/establishmentService'
import { uploadFile } from '../../services/fileService'
import {
  createOwnerOperatingMode,
  getOwnerOperatingModes,
  updateOwnerOperatingMode,
} from '../../services/ownerOperatingHoursService'
import { getRestaurantById } from '../../services/restaurantService'

import './AdminEstablishmentEditPage.css'

const ESTABLISHMENT_CATEGORIES = [
  'Korean',
  'Russian',
  'Uzbek',
  'Chinese',
  'Japanese',
  'European',
  'Fast food',
  'Bakery / Cafe',
]

interface DayHours {
  dayOfWeek: number
  label: string
  modeId: number | null
  start: string
  end: string
  dayOff: boolean
}

const DAY_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

function buildDefaultHours(): DayHours[] {
  return DAY_LABELS.map((label, index) => ({
    dayOfWeek: index + 1,
    label,
    modeId: null,
    start: '09:00',
    end: '22:00',
    dayOff: false,
  }))
}

function AdminEstablishmentEditPage() {
  const navigate = useNavigate()
  const { establishmentId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState<DayHours[]>(buildDefaultHours())
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [facilities, setFacilities] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadEstablishment = async () => {
      if (!establishmentId) {
        return
      }

      setIsLoading(true)
      setLoadError('')

      try {
        const establishment = await getEstablishmentById(
          Number(establishmentId),
        )

        if (!isMounted) {
          return
        }

        setTitle(establishment.title || '')
        setDescription(establishment.description || '')
        setCategory(establishment.category || '')
        setMinOrderAmount(
          establishment.minOrderAmount != null
            ? String(establishment.minOrderAmount)
            : '',
        )
        setPhone(establishment.phone || '')
        setCity(establishment.city || '')
        setFacilities(establishment.facilities || '')
        setPhotoPreview(establishment.imageUrl || null)

        try {
          const restaurant = await getRestaurantById(
            Number(establishmentId),
          )

          if (!isMounted) {
            return
          }

          const modes = restaurant.operatingModes ?? []

          if (modes.length > 0) {
            setHours(
              buildDefaultHours().map((day) => {
                const mode = modes.find(
                  (item) => item.dayOfWeek === day.dayOfWeek,
                )

                if (!mode) {
                  return day
                }

                return {
                  ...day,
                  modeId: mode.id,
                  start: mode.start ? mode.start.slice(0, 5) : day.start,
                  end: mode.end ? mode.end.slice(0, 5) : day.end,
                  dayOff: mode.dayOff,
                }
              }),
            )
          }
        } catch (hoursError) {
          console.error(
            'Failed to load operating modes:',
            hoursError,
          )
        }
      } catch (requestError) {
        console.error(
          'Failed to load establishment:',
          requestError,
        )

        if (isMounted) {
          setLoadError('Could not load the establishment')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadEstablishment()

    return () => {
      isMounted = false
    }
  }, [establishmentId])

  function handlePhotoClick() {
    fileInputRef.current?.click()
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleHoursChange(
    dayOfWeek: number,
    field: 'start' | 'end' | 'dayOff',
    value: string | boolean,
  ) {
    setHours((previous) =>
      previous.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day,
      ),
    )
  }

  function validate(): string | null {
    if (!title.trim()) {
      return 'Введите название заведения'
    }

    if (!category) {
      return 'Выберите категорию заведения'
    }

    if (!city.trim()) {
      return 'Введите город'
    }

    const parsedMinOrder = Number(minOrderAmount)

    if (!minOrderAmount || Number.isNaN(parsedMinOrder) || parsedMinOrder < 0) {
      return 'Введите корректную минимальную сумму заказа'
    }

    return null
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!establishmentId) {
      return
    }

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      let imageUrl: string | undefined

      if (photoFile) {
        imageUrl = await uploadFile(photoFile)
      }

      await updateEstablishment(Number(establishmentId), {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        minOrderAmount: Number(minOrderAmount),
        phone: phone.trim() || undefined,
        imageUrl,
        facilities: facilities.trim() || undefined,
        address: {
          city: city.trim(),
        },
      })

      for (const day of hours) {
        try {
          const payload = {
            dayOfWeek: day.dayOfWeek,
            start: day.dayOff ? null : day.start,
            end: day.dayOff ? null : day.end,
            dayOff: day.dayOff,
          }

          if (day.modeId) {
            await updateOwnerOperatingMode(
              Number(establishmentId),
              day.modeId,
              payload,
            )
          } else {
            await createOwnerOperatingMode(
              Number(establishmentId),
              payload,
            )
          }
        } catch {
          continue
        }
      }

      navigate('/admin/establishments')
    } catch {
      setError('Не удалось сохранить изменения. Попробуйте ещё раз')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-establishment-edit-page">
        <h1>Edit establishment</h1>
        <p className="admin-establishment-edit-page__loading">Loading...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="admin-establishment-edit-page">
        <h1>Edit establishment</h1>
        <p className="admin-establishment-edit-page__error">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="admin-establishment-edit-page">
      <h1>Edit establishment</h1>
      <p className="admin-establishment-edit-page__breadcrumb">
        <span
          className="admin-establishment-edit-page__breadcrumb-link"
          onClick={() => navigate('/admin/establishments')}
        >
          Establishments
        </span>{' '}
        / Edit
      </p>

      <form className="admin-establishment-edit-page__card" onSubmit={handleSubmit}>
        <div className="admin-establishment-edit-page__photo">
          <button
            type="button"
            className="admin-establishment-edit-page__photo-upload"
            onClick={handlePhotoClick}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M12 15V4m0 0L7 9m5-5l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <div className="admin-establishment-edit-page__photo-fill" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="admin-establishment-edit-page__photo-input"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="admin-establishment-edit-page__field">
          <label>Establishment name</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter name"
          />
        </div>

        <div className="admin-establishment-edit-page__field">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="admin-establishment-edit-page__field">
          <label className="admin-establishment-edit-page__hours-title">
            Working hours
          </label>

          {hours.map((day) => (
            <div className="admin-establishment-edit-page__hours-row" key={day.dayOfWeek}>
              <div className="admin-establishment-edit-page__hours-day">{day.label}</div>

              <div className="admin-establishment-edit-page__hours-controls">
                <input
                  type="time"
                  value={day.start}
                  disabled={day.dayOff}
                  onChange={(event) =>
                    handleHoursChange(day.dayOfWeek, 'start', event.target.value)
                  }
                />
                <span className="admin-establishment-edit-page__hours-dash">-</span>
                <input
                  type="time"
                  value={day.end}
                  disabled={day.dayOff}
                  onChange={(event) =>
                    handleHoursChange(day.dayOfWeek, 'end', event.target.value)
                  }
                />
              </div>

              <label className="admin-establishment-edit-page__hours-dayoff">
                <input
                  type="checkbox"
                  checked={day.dayOff}
                  onChange={(event) =>
                    handleHoursChange(day.dayOfWeek, 'dayOff', event.target.checked)
                  }
                />
                Day off
              </label>
            </div>
          ))}
        </div>

        <div className="admin-establishment-edit-page__field">
          <label>Minimum order</label>
          <input
            type="number"
            min="0"
            value={minOrderAmount}
            onChange={(event) => setMinOrderAmount(event.target.value)}
            placeholder="0"
          />
        </div>

        <div className="admin-establishment-edit-page__field">
          <label>Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+82"
          />
        </div>

        <div className="admin-establishment-edit-page__field">
          <label>Establishment category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Select category</option>
            {ESTABLISHMENT_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-establishment-edit-page__field">
          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city"
          />
        </div>

        <div className="admin-establishment-edit-page__field">
          <label>Delivery areas</label>
          <textarea
            value={facilities}
            onChange={(event) => setFacilities(event.target.value)}
            placeholder="Enter delivery areas"
          />
        </div>

        {error && <p className="admin-establishment-edit-page__error">{error}</p>}

        <div className="admin-establishment-edit-page__actions">
          <button
            type="button"
            className="admin-establishment-edit-page__cancel-button"
            onClick={() => navigate('/admin/establishments')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-establishment-edit-page__save-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminEstablishmentEditPage
