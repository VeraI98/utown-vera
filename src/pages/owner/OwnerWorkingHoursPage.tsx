import axios from 'axios'
import {
  useEffect,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import backIcon from '../../assets/restaurateur/Back Icon.svg'
import headerLogo from '../../assets/restaurateur/Header Text Container.svg'

import { useAuth } from '../../hooks/useAuth'

import {
  getOwnerRestaurants,
} from '../../services/ownerRestaurantService'

import {
  getOwnerOperatingModes,
  type OperatingModeResponse,
} from '../../services/ownerOperatingHoursService'

import './OwnerWorkingHoursPage.css'

const DAYS = [
  {
    dayOfWeek: 1,
    label: 'Monday',
  },
  {
    dayOfWeek: 2,
    label: 'Tuesday',
  },
  {
    dayOfWeek: 3,
    label: 'Wednesday',
  },
  {
    dayOfWeek: 4,
    label: 'Thursday',
  },
  {
    dayOfWeek: 5,
    label: 'Friday',
  },
  {
    dayOfWeek: 6,
    label: 'Saturday',
  },
  {
    dayOfWeek: 7,
    label: 'Sunday',
  },
]

function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
      error.response?.data

    if (
      responseData &&
      typeof responseData ===
        'object' &&
      'message' in responseData &&
      typeof responseData.message ===
        'string'
    ) {
      return responseData.message
    }

    if (
      typeof responseData ===
      'string'
    ) {
      return responseData
    }
  }

  return 'Failed to load working hours.'
}

function OwnerWorkingHoursPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id

  const [
    restaurantId,
    setRestaurantId,
  ] = useState<number | null>(
    null,
  )

  const [
    operatingModes,
    setOperatingModes,
  ] = useState<
    OperatingModeResponse[]
  >([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  useEffect(() => {
    if (!userId) {
      return
    }

    let isActive = true

    getOwnerRestaurants(userId)
      .then(
        async (restaurants) => {
          if (!isActive) {
            return
          }

          const restaurant =
            restaurants[0]

          if (!restaurant) {
            setErrorMessage(
              'No restaurant found.',
            )
            setIsLoading(false)

            return
          }

          setRestaurantId(
            restaurant.id,
          )

          const modes =
            await getOwnerOperatingModes(
              restaurant.id,
            )

          if (!isActive) {
            return
          }

          setOperatingModes(
            modes,
          )

          setErrorMessage('')
        },
      )
      .catch((error: unknown) => {
        if (!isActive) {
          return
        }

        setErrorMessage(
          getErrorMessage(
            error,
          ),
        )
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

  const handleEditDay = (
    dayOfWeek: number,
  ) => {
    if (!restaurantId) {
      return
    }

    const mode =
      operatingModes.find(
        (item) =>
          item.dayOfWeek ===
          dayOfWeek,
      )

    const searchParams =
      new URLSearchParams()

    searchParams.set(
      'restaurantId',
      String(restaurantId),
    )

    searchParams.set(
      'dayOfWeek',
      String(dayOfWeek),
    )

    if (mode) {
      searchParams.set(
        'modeId',
        String(mode.id),
      )
    }

    navigate(
      `/owner/working-hours/edit?${searchParams.toString()}`,
    )
  }

  return (
    <main className="owner-working-hours-page">
      <section className="owner-working-hours-page__screen">
        <header className="owner-working-hours-page__header">
          <button
            className="owner-working-hours-page__back"
            type="button"
            aria-label="Go back"
            onClick={() =>
              navigate('/owner')
            }
          >
            <img
              src={backIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <img
            className="owner-working-hours-page__logo"
            src={headerLogo}
            alt="UT Business"
          />

          <div
            className="owner-working-hours-page__header-placeholder"
            aria-hidden="true"
          />
        </header>

        <div className="owner-working-hours-page__content">
          <h1>
            Opening hours of
            <br />
            the establishment
          </h1>

          {isLoading && (
            <p className="owner-working-hours-page__message">
              Loading...
            </p>
          )}

          {!isLoading &&
            errorMessage && (
              <p className="owner-working-hours-page__error">
                {
                  errorMessage
                }
              </p>
            )}

          {!isLoading &&
            !errorMessage && (
              <div className="owner-working-hours-page__days">
                {DAYS.map(
                  (day) => (
                    <button
                      className="owner-working-hours-page__day"
                      key={
                        day.dayOfWeek
                      }
                      type="button"
                      onClick={() =>
                        handleEditDay(
                          day.dayOfWeek,
                        )
                      }
                    >
                      <span>
                        {
                          day.label
                        }
                      </span>

                      <span className="owner-working-hours-page__edit">
                        Edit
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
        </div>
      </section>
    </main>
  )
}

export default OwnerWorkingHoursPage