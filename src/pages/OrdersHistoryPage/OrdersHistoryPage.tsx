import axios from 'axios'
import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import backButtonIcon from '../../assets/order/Back button.svg'
import bellIcon from '../../assets/order/bell.svg'
import foodLogo from '../../assets/order/food.svg'
import utLogo from '../../assets/order/ut.svg'

import {
  getMyOrders,
} from '../../services/orderService'

import {
  getMyRestaurantRating,
} from '../../services/ratingService'

import type {
  OrderResponse,
} from '../../types/cart'

import {
  formatPrice,
} from '../RestaurantPage/restaurantData'

import './OrdersHistoryPage.css'

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

  return 'Failed to load your orders. Please try again.'
}

function normalizeStatus(
  status?: string,
): string {
  return (
    status
      ?.trim()
      .toUpperCase() ?? ''
  )
}

function getStatusLabel(
  status?: string,
): string {
  switch (
    normalizeStatus(status)
  ) {
    case 'PENDING':
      return 'Order received'

    case 'CONFIRMED':
      return 'Confirmed'

    case 'PREPARING':
      return 'Preparing'

    case 'READY':
      return 'Ready'

    case 'OUT_FOR_DELIVERY':
      return 'Out for delivery'

    case 'DELIVERED':
      return 'Delivered'

    case 'CANCELLED':
      return 'Cancelled'

    case 'REFUNDED':
      return 'Refunded'

    default:
      return (
        status ||
        'Unknown status'
      )
  }
}

function getStatusClass(
  status?: string,
): string {
  switch (
    normalizeStatus(status)
  ) {
    case 'DELIVERED':
      return 'orders-history-page__status--delivered'

    case 'CANCELLED':
    case 'REFUNDED':
      return 'orders-history-page__status--cancelled'

    case 'OUT_FOR_DELIVERY':
      return 'orders-history-page__status--delivery'

    default:
      return 'orders-history-page__status--active'
  }
}

function isDeliveredOrder(
  order: OrderResponse,
): boolean {
  const status =
    normalizeStatus(
      order.status,
    )

  const deliveryStatus =
    normalizeStatus(
      order.deliveryStatus,
    )

  return (
    status === 'DELIVERED' ||
    status === 'COMPLETED' ||
    deliveryStatus ===
      'DELIVERED' ||
    deliveryStatus ===
      'COMPLETED'
  )
}

function OrdersHistoryPage() {
  const navigate =
    useNavigate()

  const [
    orders,
    setOrders,
  ] = useState<
    OrderResponse[]
  >([])

  const [
    ratedRestaurantIds,
    setRatedRestaurantIds,
  ] = useState<Set<number>>(
    () => new Set(),
  )

  const [
    ratingChecksLoading,
    setRatingChecksLoading,
  ] = useState<
    Set<number>
  >(() => new Set())

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const loadRatingStatuses =
    useCallback(
      async (
        currentOrders: OrderResponse[],
      ) => {
        const restaurantIds =
          Array.from(
            new Set(
              currentOrders
                .filter(
                  (order) =>
                    isDeliveredOrder(
                      order,
                    ),
                )
                .map(
                  (order) =>
                    order.restaurantId,
                )
                .filter(
                  (
                    restaurantId,
                  ): restaurantId is number =>
                    typeof restaurantId ===
                      'number' &&
                    restaurantId > 0,
                ),
            ),
          )

        if (
          restaurantIds.length === 0
        ) {
          setRatedRestaurantIds(
            new Set(),
          )

          setRatingChecksLoading(
            new Set(),
          )

          return
        }

        setRatingChecksLoading(
          new Set(restaurantIds),
        )

        const results =
          await Promise.allSettled(
            restaurantIds.map(
              async (
                restaurantId,
              ) => {
                const rating =
                  await getMyRestaurantRating(
                    restaurantId,
                  )

                return {
                  restaurantId,
                  hasRating:
                    Boolean(rating),
                }
              },
            ),
          )

        const nextRatedIds =
          new Set<number>()

        results.forEach(
          (
            result,
            index,
          ) => {
            const restaurantId =
              restaurantIds[index]

            if (
              result.status ===
                'fulfilled' &&
              result.value.hasRating
            ) {
              nextRatedIds.add(
                restaurantId,
              )
            }

            if (
              result.status ===
              'rejected'
            ) {
              console.error(
                `Failed to check rating for restaurant ${restaurantId}:`,
                result.reason,
              )
            }
          },
        )

        setRatedRestaurantIds(
          nextRatedIds,
        )

        setRatingChecksLoading(
          new Set(),
        )
      },
      [],
    )

  const loadOrders =
    useCallback(
      async (
        showLoading = false,
      ) => {
        try {
          if (showLoading) {
            setIsLoading(true)
          }

          setErrorMessage('')

          const currentOrders =
            await getMyOrders()

          const sortedOrders = [
            ...currentOrders,
          ].sort(
            (
              firstOrder,
              secondOrder,
            ) =>
              secondOrder.id -
              firstOrder.id,
          )

          setOrders(
            sortedOrders,
          )

          await loadRatingStatuses(
            sortedOrders,
          )
        } catch (error) {
          setErrorMessage(
            getErrorMessage(
              error,
            ),
          )
        } finally {
          setIsLoading(false)
        }
      },
      [loadRatingStatuses],
    )

  useEffect(() => {
    let isMounted = true

    const loadInitialOrders =
      async () => {
        try {
          const currentOrders =
            await getMyOrders()

          if (!isMounted) {
            return
          }

          const sortedOrders = [
            ...currentOrders,
          ].sort(
            (
              firstOrder,
              secondOrder,
            ) =>
              secondOrder.id -
              firstOrder.id,
          )

          setOrders(
            sortedOrders,
          )

          setErrorMessage('')

          await loadRatingStatuses(
            sortedOrders,
          )
        } catch (error) {
          if (!isMounted) {
            return
          }

          setErrorMessage(
            getErrorMessage(
              error,
            ),
          )
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }

    void loadInitialOrders()

    return () => {
      isMounted = false
    }
  }, [
    loadRatingStatuses,
  ])

  const handleOpenOrder = (
    order: OrderResponse,
  ) => {
    navigate(
      `/food/order/${order.id}/status`,
      {
        state: {
          order,
        },
      },
    )
  }

  const handleRateOrder = (
    order: OrderResponse,
  ) => {
    navigate(
      `/food/order/${order.id}/rating`,
      {
        state: {
          order,
        },
      },
    )
  }

  return (
    <main className="orders-history-page">
      <header className="orders-history-page__header">
        <button
          className="orders-history-page__header-button"
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
          className="orders-history-page__logo"
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
          className="orders-history-page__header-button"
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

      <section className="orders-history-page__content">
        <div className="orders-history-page__title-row">
          <h1>
            My orders
          </h1>

          {!isLoading &&
            orders.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  void loadOrders(
                    true,
                  )
                }
              >
                Refresh
              </button>
            )}
        </div>

        {errorMessage && (
          <div
            className="orders-history-page__error"
            role="alert"
          >
            <p>
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadOrders(
                  true,
                )
              }
            >
              Try again
            </button>
          </div>
        )}

        {isLoading ? (
          <div
            className="orders-history-page__loading"
            role="status"
          >
            <div
              className="orders-history-page__spinner"
              aria-hidden="true"
            />

            <p>
              Loading orders...
            </p>
          </div>
        ) : orders.length ===
          0 ? (
          <div className="orders-history-page__empty">
            <h2>
              No orders yet
            </h2>

            <p>
              Your food orders will
              appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/food')
              }
            >
              Find food
            </button>
          </div>
        ) : (
          <div className="orders-history-page__list">
            {orders.map(
              (order) => {
                const isDelivered =
                  isDeliveredOrder(
                    order,
                  )

                const restaurantId =
                  order.restaurantId

                const isRatingCheckLoading =
                  typeof restaurantId ===
                    'number' &&
                  ratingChecksLoading.has(
                    restaurantId,
                  )

                const isRated =
                  typeof restaurantId ===
                    'number' &&
                  ratedRestaurantIds.has(
                    restaurantId,
                  )

                return (
                  <article
                    className="orders-history-page__card"
                    key={order.id}
                  >
                    <div className="orders-history-page__card-top">
                      <div>
                        <h2>
                          {order.restaurantName ||
                            'Restaurant'}
                        </h2>

                        <p>
                          {order.number
                            ? `Order ${order.number}`
                            : `Order #${order.id}`}
                        </p>
                      </div>

                      <span
                        className={`orders-history-page__status ${getStatusClass(
                          order.status,
                        )}`}
                      >
                        {getStatusLabel(
                          order.status,
                        )}
                      </span>
                    </div>

                    <div className="orders-history-page__details">
                      {order.date && (
                        <div>
                          <span>
                            Date
                          </span>

                          <strong>
                            {
                              order.date
                            }
                          </strong>
                        </div>
                      )}

                      {order.time && (
                        <div>
                          <span>
                            Time
                          </span>

                          <strong>
                            {
                              order.time
                            }
                          </strong>
                        </div>
                      )}

                      <div>
                        <span>
                          Total
                        </span>

                        <strong>
                          {formatPrice(
                            order.totalSum ??
                              order.orderPrice ??
                              0,
                          )}
                        </strong>
                      </div>
                    </div>

                    {order.items &&
                      order.items
                        .length >
                        0 && (
                        <div className="orders-history-page__items">
                          {order.items
                            .slice(
                              0,
                              2,
                            )
                            .map(
                              (
                                item,
                              ) => (
                                <div
                                  className="orders-history-page__item"
                                  key={
                                    item.id
                                  }
                                >
                                  {item.dishImageUrl ? (
                                    <img
                                      src={
                                        item.dishImageUrl
                                      }
                                      alt={
                                        item.dishTitle ||
                                        'Dish'
                                      }
                                    />
                                  ) : (
                                    <div className="orders-history-page__item-image-placeholder" />
                                  )}

                                  <div>
                                    <strong>
                                      {item.dishTitle ||
                                        'Dish'}
                                    </strong>

                                    <span>
                                      {
                                        item.count
                                      }{' '}
                                      ×{' '}
                                      {formatPrice(
                                        item.sum ??
                                          0,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}

                          {order.items
                            .length >
                            2 && (
                            <p className="orders-history-page__more-items">
                              +
                              {order
                                .items
                                .length -
                                2}{' '}
                              more
                              items
                            </p>
                          )}
                        </div>
                      )}

                    <div className="orders-history-page__actions">
                      <button
                        type="button"
                        className="orders-history-page__view-button"
                        onClick={() =>
                          handleOpenOrder(
                            order,
                          )
                        }
                      >
                        {isDelivered
                          ? 'View order'
                          : 'Track order'}
                      </button>

                      {isDelivered && (
                        <>
                          {isRatingCheckLoading ? (
                            <button
                              type="button"
                              className="orders-history-page__rate-button"
                              disabled
                            >
                              Checking...
                            </button>
                          ) : isRated ? (
                            <button
                              type="button"
                              className="orders-history-page__rate-button orders-history-page__rate-button--rated"
                              disabled
                            >
                              ✓ Rated
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="orders-history-page__rate-button"
                              onClick={() =>
                                handleRateOrder(
                                  order,
                                )
                              }
                            >
                              Rate order
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                )
              },
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default OrdersHistoryPage