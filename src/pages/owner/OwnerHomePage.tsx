import axios from 'axios'
import {
  useEffect,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import arrowIcon from '../../assets/restaurateur/Arrow.svg'
import headerLogo from '../../assets/restaurateur/Header Text Container.svg'
import menuIcon from '../../assets/restaurateur/menu.svg'

import { useAuth } from '../../hooks/useAuth'

import {
  getOwnerRestaurants,
  toggleOwnerRestaurantStatus,
} from '../../services/ownerRestaurantService'

import type {
  RestaurantResponse,
} from '../../types/restaurant'

import './OwnerHomePage.css'

interface OwnerMenuItem {
  label: string
  path: string
}

const OWNER_MENU_ITEMS: OwnerMenuItem[] = [
  {
    label: 'Order table',
    path: '/owner/orders',
  },
  {
    label: 'Notifications',
    path: '/owner/notifications',
  },
  {
    label: 'Statistics',
    path: '/owner/statistics',
  },
  {
    label: 'Menu',
    path: '/owner/menu',
  },
  {
    label: 'Establishment',
    path: '/owner/establishment',
  },
  {
    label: 'Working hours',
    path: '/owner/working-hours',
  },
]

const DAY_NAMES: Record<number, string> = {
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
  if (axios.isAxiosError(error)) {
    if (
      error.response?.status ===
      403
    ) {
      return 'You do not have access to restaurant owner data.'
    }

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

  return 'Failed to load restaurant data.'
}

function OwnerHomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id

  const [
    restaurant,
    setRestaurant,
  ] =
    useState<RestaurantResponse | null>(
      null,
    )

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
  ] = useState(false)

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
      .then((restaurants) => {
        if (!isActive) {
          return
        }

        setRestaurant(
          restaurants[0] ?? null,
        )

        setErrorMessage('')
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return
        }

        setRestaurant(null)

        setErrorMessage(
          getErrorMessage(error),
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

  const operatingModes =
    restaurant?.operatingModes?.length
      ? [
          ...restaurant.operatingModes,
        ].sort(
          (
            firstMode,
            secondMode,
          ) =>
            firstMode.dayOfWeek -
            secondMode.dayOfWeek,
        )
      : []

  const visibleOperatingModes =
    operatingModes.slice(0, 4)

  const isSuspended =
    String(
      restaurant?.statusDisplay ?? '',
    )
      .trim()
      .toUpperCase() === 'CLOSED'

  const handleToggleStatus =
    async () => {
      if (
        !restaurant ||
        !userId ||
        isUpdatingStatus
      ) {
        return
      }

      setIsUpdatingStatus(true)
      setErrorMessage('')

      try {
        await toggleOwnerRestaurantStatus(
          restaurant.id,
        )

        const restaurants =
          await getOwnerRestaurants(
            userId,
          )

        setRestaurant(
          restaurants[0] ?? null,
        )
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error),
        )
      } finally {
        setIsUpdatingStatus(false)
      }
    }

  const handleMenuNavigation = (
    path: string,
  ) => {
    setIsMenuOpen(false)

    navigate(path)
  }

  return (
    <main className="owner-home-page">
      <section className="owner-home-page__screen">
        <header className="owner-home-page__header">
          <button
            className="owner-home-page__menu-button"
            type="button"
            aria-label="Open menu"
            onClick={() =>
              setIsMenuOpen(true)
            }
          >
            <img
              src={menuIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <img
            className="owner-home-page__logo"
            src={headerLogo}
            alt="UT Business"
          />

          <div
            className="owner-home-page__header-placeholder"
            aria-hidden="true"
          />
        </header>

        <div className="owner-home-page__content">
          {!userId ? (
            <p
              className="owner-home-page__error"
              role="alert"
            >
              User information is
              unavailable.
            </p>
          ) : isLoading ? (
            <p>
              Loading restaurant...
            </p>
          ) : (
            <>
              {errorMessage && (
                <p
                  className="owner-home-page__error"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              {restaurant ? (
                <>
                  <h1 className="owner-home-page__restaurant-name">
                    {
                      restaurant.title
                    }
                  </h1>

                  <section className="owner-home-page__suspend-card">
                    <div className="owner-home-page__suspend-text">
                      <h2>
                        Suspend operations
                      </h2>

                      <p>
                        Temporarily suspend
                        the establishment&apos;s
                        operations
                      </p>
                    </div>

                    <button
                      className={`owner-home-page__switch ${
                        isSuspended
                          ? 'owner-home-page__switch--active'
                          : ''
                      }`}
                      type="button"
                      role="switch"
                      aria-checked={
                        isSuspended
                      }
                      aria-label="Suspend operations"
                      disabled={
                        isUpdatingStatus
                      }
                      onClick={() =>
                        void handleToggleStatus()
                      }
                    >
                      <span />
                    </button>
                  </section>

                  <section className="owner-home-page__navigation">
                    <h2>
                      Navigation
                    </h2>

                    <div className="owner-home-page__navigation-grid">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            '/owner/orders',
                          )
                        }
                      >
                        Order table
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            '/owner/statistics',
                          )
                        }
                      >
                        Statistics
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            '/owner/menu',
                          )
                        }
                      >
                        Menu
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            '/owner/establishment',
                          )
                        }
                      >
                        Establishment
                      </button>
                    </div>
                  </section>

                  <section className="owner-home-page__working-hours">
                    <h2>
                      Working hours
                    </h2>

                    {visibleOperatingModes.length >
                    0 ? (
                      <div className="owner-home-page__days">
                        {visibleOperatingModes.map(
                          (
                            operatingMode,
                          ) => (
                            <article
                              className="owner-home-page__day"
                              key={
                                operatingMode.id
                              }
                            >
                              <span className="owner-home-page__day-name">
                                {DAY_NAMES[
                                  operatingMode
                                    .dayOfWeek
                                ] ??
                                  `Day ${operatingMode.dayOfWeek}`}
                              </span>

                              <div className="owner-home-page__day-card">
                                {operatingMode.dayOff ? (
                                  <span>
                                    Day off
                                  </span>
                                ) : (
                                  <>
                                    <span>
                                      {operatingMode.start ??
                                        '--:--'}{' '}
                                      -
                                    </span>

                                    <span>
                                      {operatingMode.end ??
                                        '--:--'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </article>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="owner-home-page__empty-hours">
                        Working hours are
                        not specified.
                      </p>
                    )}

                    <button
                      className="owner-home-page__working-hours-button"
                      type="button"
                      onClick={() =>
                        navigate(
                          '/owner/working-hours',
                        )
                      }
                    >
                      Specify the
                      establishment&apos;s
                      working hours
                    </button>
                  </section>
                </>
              ) : (
                !errorMessage && (
                  <p>
                    No restaurant found.
                  </p>
                )
              )}
            </>
          )}
        </div>

        {isMenuOpen && (
          <div className="owner-drawer">
            <button
              className="owner-drawer__overlay"
              type="button"
              aria-label="Close menu"
              onClick={() =>
                setIsMenuOpen(false)
              }
            />

            <aside className="owner-drawer__panel">
              <div className="owner-drawer__header">
                <img
                  className="owner-drawer__logo"
                  src={headerLogo}
                  alt="UT Business"
                />
              </div>

              <nav className="owner-drawer__navigation">
                {OWNER_MENU_ITEMS.map(
                  (item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() =>
                        handleMenuNavigation(
                          item.path,
                        )
                      }
                    >
                      <span>
                        {item.label}
                      </span>

                      <img
                        src={arrowIcon}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                  ),
                )}
              </nav>
            </aside>

            <button
              className="owner-drawer__close-button"
              type="button"
              aria-label="Close menu"
              onClick={() =>
                setIsMenuOpen(false)
              }
            >
              ×
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default OwnerHomePage