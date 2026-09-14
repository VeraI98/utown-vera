import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'

import { createEstablishment } from '../../services/establishmentService'
import { uploadFile } from '../../services/fileService'
import { createOwnerOperatingMode } from '../../services/ownerOperatingHoursService'

import './AdminEstablishmentAddPage.css'

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
  start: string
  end: string
  dayOff: boolean
}

const DEFAULT_HOURS: DayHours[] = [
  {
    dayOfWeek: 1,
    label: 'Monday',
    start: '09:00',
    end: '22:00',
    dayOff: false,
  },
  {
    dayOfWeek: 2,
    label: 'Tuesday',
    start: '09:00',
    end: '22:00',
    dayOff: true,
  },
  {
    dayOfWeek: 3,
    label: 'Wednesday',
    start: '09:00',
    end: '22:00',
    dayOff: false,
  },
  {
    dayOfWeek: 4,
    label: 'Thursday',
    start: '09:00',
    end: '22:00',
    dayOff: false,
  },
  {
    dayOfWeek: 5,
    label: 'Friday',
    start: '09:00',
    end: '22:00',
    dayOff: false,
  },
  {
    dayOfWeek: 6,
    label: 'Saturday',
    start: '09:00',
    end: '22:00',
    dayOff: false,
  },
  {
    dayOfWeek: 7,
    label: 'Sunday',
    start: '09:00',
    end: '22:00',
    dayOff: false,
  },
]

function AdminEstablishmentAddPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS)
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [facilities, setFacilities] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      const created = await createEstablishment({
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
          await createOwnerOperatingMode(created.id, {
            dayOfWeek: day.dayOfWeek,
            start: day.dayOff ? null : day.start,
            end: day.dayOff ? null : day.end,
            dayOff: day.dayOff,
          })
        } catch {
          continue
        }
      }

      navigate('/admin/establishments')
    } catch {
      setError('Не удалось создать заведение. Попробуйте ещё раз')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-establishment-add-page">
      <h1>Add new establishment</h1>
      <p className="admin-establishment-add-page__breadcrumb">
        <span
          className="admin-establishment-add-page__breadcrumb-link"
          onClick={() => navigate('/admin/establishments')}
        >
          Establishments
        </span>{' '}
        / Add new establishment
      </p>

      <form
        className="admin-establishment-add-page__card"
        onSubmit={handleSubmit}
      >
        <div className="admin-establishment-add-page__photo">
          <button
            type="button"
            className="admin-establishment-add-page__photo-upload"
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
          <div className="admin-establishment-add-page__photo-fill" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="admin-establishment-add-page__photo-input"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="admin-establishment-add-page__field">
          <label>Establishment name</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter name"
          />
        </div>

        <div className="admin-establishment-add-page__field">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="admin-establishment-add-page__field">
          <label className="admin-establishment-add-page__hours-title">
            Working hours
          </label>

          {hours.map((day) => (
            <div
              className="admin-establishment-add-page__hours-row"
              key={day.dayOfWeek}
            >
              <div className="admin-establishment-add-page__hours-day">
                {day.label}
              </div>

              <div className="admin-establishment-add-page__hours-controls">
                <input
                  type="time"
                  value={day.start}
                  disabled={day.dayOff}
                  onChange={(event) =>
                    handleHoursChange(
                      day.dayOfWeek,
                      'start',
                      event.target.value,
                    )
                  }
                />
                <span className="admin-establishment-add-page__hours-dash">
                  -
                </span>
                <input
                  type="time"
                  value={day.end}
                  disabled={day.dayOff}
                  onChange={(event) =>
                    handleHoursChange(day.dayOfWeek, 'end', event.target.value)
                  }
                />
              </div>

              <label className="admin-establishment-add-page__hours-dayoff">
                <input
                  type="checkbox"
                  checked={day.dayOff}
                  onChange={(event) =>
                    handleHoursChange(
                      day.dayOfWeek,
                      'dayOff',
                      event.target.checked,
                    )
                  }
                />
                Day off
              </label>
            </div>
          ))}
        </div>

        <div className="admin-establishment-add-page__field">
          <label>Minimum order</label>
          <input
            type="number"
            min="0"
            value={minOrderAmount}
            onChange={(event) => setMinOrderAmount(event.target.value)}
            placeholder="0"
          />
        </div>

        <div className="admin-establishment-add-page__field">
          <label>Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+82"
          />
        </div>

        <div className="admin-establishment-add-page__field">
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

        <div className="admin-establishment-add-page__field">
          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city"
          />
        </div>

        <div className="admin-establishment-add-page__field">
          <label>Delivery areas</label>
          <textarea
            value={facilities}
            onChange={(event) => setFacilities(event.target.value)}
            placeholder="Enter delivery areas"
          />
        </div>

        {error && (
          <p className="admin-establishment-add-page__error">{error}</p>
        )}

        <div className="admin-establishment-add-page__actions">
          <button
            type="button"
            className="admin-establishment-add-page__cancel-button"
            onClick={() => navigate('/admin/establishments')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-establishment-add-page__add-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminEstablishmentAddPage
