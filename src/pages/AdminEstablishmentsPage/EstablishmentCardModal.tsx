import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './EstablishmentCardModal.css'
import { getRestaurantById } from '../../services/restaurantService'
import type { EstablishmentResponse } from '../../types/establishment'
import type { RestaurantOperatingMode } from '../../types/restaurant'

interface EstablishmentCardModalProps {
  establishment: EstablishmentResponse
  onClose: () => void
  onDelete: () => void
}

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

function formatTime(time: string) {
  return time.replace(/^0/, '').slice(0, 5)
}

function formatAmount(amount: number) {
  if (typeof amount !== 'number') {
    return '-'
  }

  return amount.toLocaleString('en-US')
}

function EstablishmentCardModal({
  establishment,
  onClose,
  onDelete,
}: EstablishmentCardModalProps) {
  const navigate = useNavigate()
  const [operatingModes, setOperatingModes] = useState<
    RestaurantOperatingMode[]
  >([])
  const [isLoadingHours, setIsLoadingHours] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadOperatingModes = async () => {
      try {
        const restaurant = await getRestaurantById(
          establishment.id,
        )

        if (!isMounted) {
          return
        }

        setOperatingModes(restaurant.operatingModes ?? [])
      } catch (error) {
        console.error(
          'Failed to load operating modes:',
          error,
        )

        if (isMounted) {
          setOperatingModes([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingHours(false)
        }
      }
    }

    void loadOperatingModes()

    return () => {
      isMounted = false
    }
  }, [establishment.id])

  const sortedModes = [...operatingModes].sort(
    (first, second) => first.dayOfWeek - second.dayOfWeek,
  )

  return (
    <div
      className="establishment-card-modal__overlay"
      onClick={onClose}
    >
      <div
        className="establishment-card-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="establishment-card-modal__close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="#101828"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="establishment-card-modal__top">
          {establishment.imageUrl ? (
            <img
              className="establishment-card-modal__photo"
              src={establishment.imageUrl}
              alt=""
            />
          ) : (
            <div className="establishment-card-modal__photo" />
          )}

          <div className="establishment-card-modal__panel">
            <div className="establishment-card-modal__panel-actions">
              <button
                className="establishment-card-modal__panel-button"
                type="button"
                onClick={() =>
                  navigate(`/admin/establishments/${establishment.id}/edit`)
                }
              >
                Edit account
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                className="establishment-card-modal__panel-button"
                type="button"
                disabled
              >
                Menu
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                className="establishment-card-modal__panel-button establishment-card-modal__panel-button--delete"
                type="button"
                onClick={onDelete}
              >
                Delete establishment
              </button>
            </div>
          </div>
        </div>

        <h2 className="establishment-card-modal__name">
          {establishment.title}
        </h2>

        <div className="establishment-card-modal__body">
          <div className="establishment-card-modal__column">
            <div className="establishment-card-modal__field">
              <p className="establishment-card-modal__label">
                Description:
              </p>
              <p className="establishment-card-modal__value">
                {establishment.description || '-'}
              </p>
            </div>

            <div className="establishment-card-modal__field">
              <p className="establishment-card-modal__label">
                City:
              </p>
              <p className="establishment-card-modal__value">
                {establishment.city || '-'}
              </p>
            </div>

            <div className="establishment-card-modal__field">
              <p className="establishment-card-modal__label">
                Delivery Areas:
              </p>
              <p className="establishment-card-modal__value">
                {establishment.facilities || '-'}
              </p>
            </div>
          </div>

          <div className="establishment-card-modal__column">
            <div className="establishment-card-modal__field">
              <p className="establishment-card-modal__label">
                Phone:
              </p>
              <p className="establishment-card-modal__value">
                {establishment.phone || '-'}
              </p>
            </div>

            <div className="establishment-card-modal__field">
              <p className="establishment-card-modal__label">
                Establishment Category:
              </p>
              <p className="establishment-card-modal__value">
                {establishment.category || '-'}
              </p>
            </div>

            <div className="establishment-card-modal__field">
              <p className="establishment-card-modal__label">
                Min. order:
              </p>
              <p className="establishment-card-modal__value">
                {formatAmount(establishment.minOrderAmount)}
              </p>
            </div>

            <div className="establishment-card-modal__field">
              <p className="establishment-card-modal__label">
                Orders:
              </p>
              <p className="establishment-card-modal__value">
                {establishment.ordersCount ?? 0}
              </p>
            </div>

            <div className="establishment-card-modal__field">
              <p className="establishment-card-modal__label">
                Opening hours:
              </p>

              {isLoadingHours && (
                <p className="establishment-card-modal__value">
                  Loading...
                </p>
              )}

              {!isLoadingHours && sortedModes.length === 0 && (
                <p className="establishment-card-modal__value">-</p>
              )}

              {sortedModes.map((mode) => (
                <p
                  className="establishment-card-modal__value"
                  key={mode.id}
                >
                  {DAY_NAMES[mode.dayOfWeek - 1]}:{' '}
                  {mode.dayOff
                    ? 'Closed'
                    : `${formatTime(mode.start)} - ${formatTime(mode.end)}`}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EstablishmentCardModal
