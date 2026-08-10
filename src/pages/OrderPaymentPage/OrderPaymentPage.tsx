import axios from 'axios'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import backButtonIcon from '../../assets/order/Back button.svg'
import bankIcon from '../../assets/order/bank.svg'
import bellIcon from '../../assets/order/bell.svg'
import deliveryIcon from '../../assets/order/delivery-man.svg'
import foodLogo from '../../assets/order/food.svg'
import mapIcon from '../../assets/order/map.svg'
import utLogo from '../../assets/order/ut.svg'
import warningIcon from '../../assets/order/warning.svg'

import { getMyAddresses } from '../../services/addressService'
import {
  checkoutMyCart,
  getMyCart,
} from '../../services/cartService'
import { getRestaurantById } from '../../services/restaurantService'

import type { AddressResponse } from '../../types/address'
import type { CartResponse } from '../../types/cart'

import { formatPrice } from '../RestaurantPage/restaurantData'

import './OrderPaymentPage.css'

interface StoredUser {
  username?: string
}

interface OrderPaymentPageState {
  createdAddress?: AddressResponse
}

type AddressWithDefault = AddressResponse & {
  isDefault?: boolean
  default?: boolean
}

const FALLBACK_MIN_ORDER_AMOUNT = 15000

function normalizeMinOrderAmount(
  amount: number,
): number {
  if (amount > 0 && amount < 1000) {
    return amount * 1000
  }

  return amount
}

function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message
    }

    if (typeof responseData === 'string') {
      return responseData
    }
  }

  return 'Failed to place the order. Please try again.'
}

function getClientPhone(): string {
  const storedUser =
    localStorage.getItem('user')

  if (!storedUser) {
    return ''
  }

  try {
    const user =
      JSON.parse(storedUser) as StoredUser

    const phone = user.username ?? ''

    return phone.replace(/\D/g, '')
  } catch {
    return ''
  }
}

function findDeliveryAddress(
  addresses: AddressResponse[],
): AddressResponse | null {
  if (addresses.length === 0) {
    return null
  }

  const defaultAddress = addresses.find(
    (address) => {
      const addressWithDefault =
        address as AddressWithDefault

      return (
        addressWithDefault.isDefault === true ||
        addressWithDefault.default === true
      )
    },
  )

  return defaultAddress ?? addresses[0]
}

function OrderPaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const locationState =
    location.state as OrderPaymentPageState | null

  const createdAddress =
    locationState?.createdAddress ?? null

  const [cart, setCart] =
    useState<CartResponse | null>(null)

  const [
    defaultAddress,
    setDefaultAddress,
  ] = useState<AddressResponse | null>(
    createdAddress,
  )

  const [
    minimumOrderAmount,
    setMinimumOrderAmount,
  ] = useState(FALLBACK_MIN_ORDER_AMOUNT)

  const [
    isLoadingCart,
    setIsLoadingCart,
  ] = useState(true)

  const [isSending, setIsSending] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    addressError,
    setAddressError,
  ] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadPageData = async () => {
      try {
        const currentCart =
          await getMyCart()

        if (!isMounted) {
          return
        }

        setCart(currentCart)
        setErrorMessage('')

        if (createdAddress) {
          setDefaultAddress(
            createdAddress,
          )

          setAddressError('')
        } else {
          try {
            const addresses =
              await getMyAddresses()

            if (!isMounted) {
              return
            }

            const selectedAddress =
              findDeliveryAddress(addresses)

            setDefaultAddress(
              selectedAddress,
            )

            setAddressError(
              selectedAddress
                ? ''
                : 'No delivery address found.',
            )
          } catch (error) {
            console.error(
              'Failed to load user addresses:',
              error,
            )

            if (isMounted) {
              setDefaultAddress(null)

              setAddressError(
                'No delivery address found.',
              )
            }
          }
        }

        const restaurantId =
          currentCart.items[0]?.restaurantId

        if (!restaurantId) {
          setMinimumOrderAmount(
            FALLBACK_MIN_ORDER_AMOUNT,
          )

          return
        }

        try {
          const restaurant =
            await getRestaurantById(
              restaurantId,
            )

          if (!isMounted) {
            return
          }

          const normalizedAmount =
            normalizeMinOrderAmount(
              restaurant.minOrderAmount,
            )

          setMinimumOrderAmount(
            normalizedAmount > 0
              ? normalizedAmount
              : FALLBACK_MIN_ORDER_AMOUNT,
          )
        } catch (error) {
          console.error(
            'Failed to load restaurant minimum order:',
            error,
          )

          if (isMounted) {
            setMinimumOrderAmount(
              FALLBACK_MIN_ORDER_AMOUNT,
            )
          }
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          getErrorMessage(error),
        )
      } finally {
        if (isMounted) {
          setIsLoadingCart(false)
        }
      }
    }

    void loadPageData()

    return () => {
      isMounted = false
    }
  }, [createdAddress])

  const orderAmount =
    cart?.sumOrder ?? 0

  const deliveryPrice =
    cart?.deliveryPrice ?? 0

  const totalPrice =
    cart?.totalSum ??
    orderAmount + deliveryPrice

  const restaurant =
    cart?.items[0]

  const restaurantId =
    restaurant?.restaurantId

  const restaurantName =
    restaurant?.restaurantName ??
    'Restaurant'

  const missingAmount = Math.max(
    minimumOrderAmount - orderAmount,
    0,
  )

  const hasReachedMinimum =
    missingAmount === 0

  const canPay =
    Boolean(cart) &&
    Boolean(restaurantId) &&
    Boolean(defaultAddress) &&
    hasReachedMinimum &&
    !isSending &&
    !isLoadingCart

  const deliveryTimeText = useMemo(
    () => '45–55 minutes',
    [],
  )

  const handlePay = async () => {
    if (
      !canPay ||
      !restaurantId ||
      !defaultAddress
    ) {
      return
    }

    setIsSending(true)
    setErrorMessage('')

    try {
      const order =
        await checkoutMyCart({
          restaurantId,

          fullAddress:
            defaultAddress.fullAddress,

          area:
            defaultAddress.area,

          city:
            defaultAddress.city,

          state:
            defaultAddress.state,

          postcode:
            defaultAddress.postcode,

          street:
            defaultAddress.street,

          latitude:
            defaultAddress.latitude,

          longitude:
            defaultAddress.longitude,

          typeAddress:
            defaultAddress.typeAddress,

          intercomCode:
            defaultAddress.intercomCode,

          clientPhone:
            getClientPhone(),

          deliveryTime:
            deliveryTimeText,

          payment: 'CASH',

          noteForCourier:
            'Leave at the door',

          details:
            defaultAddress.details ?? '',
        })

      navigate(
        `/food/order/${order.id}/status`,
        {
          replace: true,
          state: {
            order,
          },
        },
      )
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      )

      setIsSending(false)
    }
  }

  const handleAddressClick = () => {
    if (isSending) {
      return
    }

    navigate('/food/order/address')
  }

  return (
    <main
      className="order-payment-page"
      aria-busy={
        isSending ||
        isLoadingCart
      }
    >
      <header className="order-payment-page__header">
        <button
          className="order-payment-page__header-button"
          type="button"
          onClick={() =>
            navigate(-1)
          }
          aria-label="Go back"
          disabled={isSending}
        >
          <img
            src={backButtonIcon}
            alt=""
            aria-hidden="true"
          />
        </button>

        <div
          className="order-payment-page__logo"
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
          className="order-payment-page__header-button"
          type="button"
          onClick={() =>
            navigate('/notifications')
          }
          aria-label="Notifications"
          disabled={isSending}
        >
          <img
            src={bellIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </header>

      <section className="order-payment-page__content">
        <h1>
          Order Payment
        </h1>

        {errorMessage && (
          <div
            className="order-payment-page__error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {addressError && (
          <div
            className="order-payment-page__error"
            role="alert"
          >
            {addressError}
          </div>
        )}

        {isLoadingCart ? (
          <div
            className="order-payment-page__loading"
            role="status"
          >
            Loading order...
          </div>
        ) : !cart ||
          cart.items.length === 0 ? (
          <div className="order-payment-page__empty">
            <p>
              Your order is empty
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/food')
              }
            >
              Return to restaurants
            </button>
          </div>
        ) : (
          <>
            <h2>
              {restaurantName}
            </h2>

            <div className="order-payment-page__info-list">
              <button
                className="order-payment-page__info-card"
                type="button"
                disabled={isSending}
              >
                <img
                  src={deliveryIcon}
                  alt=""
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Delivery in{' '}
                    {deliveryTimeText}.
                  </strong>
                </div>
              </button>

              <button
                className="order-payment-page__info-card"
                type="button"
                onClick={
                  handleAddressClick
                }
                disabled={isSending}
              >
                <img
                  src={mapIcon}
                  alt=""
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    {defaultAddress
                      ?.fullAddress ??
                      'No delivery address'}
                  </strong>

                  <span>
                    {defaultAddress
                      ? 'Delivery Location'
                      : 'Add delivery address'}
                  </span>
                </div>
              </button>

              <button
                className="order-payment-page__info-card"
                type="button"
                disabled={isSending}
              >
                <img
                  src={warningIcon}
                  alt=""
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Note for the courier
                  </strong>

                  <span>
                    Leave at the door
                  </span>
                </div>
              </button>
            </div>

            <section className="order-payment-page__section">
              <h2>
                Payment
              </h2>

              <button
                className="order-payment-page__info-card"
                type="button"
                disabled={isSending}
              >
                <img
                  src={bankIcon}
                  alt=""
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Cash
                  </strong>

                  <span>
                    Payment to the courier
                  </span>
                </div>
              </button>
            </section>

            <section className="order-payment-page__summary">
              <h2>
                Total (won)
              </h2>

              <div className="order-payment-page__summary-row">
                <span>
                  Order Amount
                </span>

                <strong>
                  {formatPrice(
                    orderAmount,
                  )}
                </strong>
              </div>

              <div className="order-payment-page__summary-row">
                <span>
                  Delivery
                </span>

                <strong>
                  {formatPrice(
                    deliveryPrice,
                  )}
                </strong>
              </div>

              <div className="order-payment-page__summary-row">
                <span>
                  Total
                </span>

                <strong>
                  {formatPrice(
                    totalPrice,
                  )}
                </strong>
              </div>
            </section>

            {!hasReachedMinimum && (
              <div
                className="order-payment-page__minimum-message"
                role="status"
              >
                Minimum order is{' '}
                {formatPrice(
                  minimumOrderAmount,
                )}
                . Add{' '}
                {formatPrice(
                  missingAmount,
                )}{' '}
                more.
              </div>
            )}
          </>
        )}
      </section>

      {!isLoadingCart &&
        cart &&
        cart.items.length > 0 && (
          <div className="order-payment-page__bottom">
            <strong>
              {formatPrice(
                totalPrice,
              )}
            </strong>

            {defaultAddress ? (
              <button
                type="button"
                onClick={() =>
                  void handlePay()
                }
                disabled={!canPay}
              >
                {isSending
                  ? 'Sending...'
                  : hasReachedMinimum
                    ? 'Pay'
                    : `Add ${formatPrice(
                        missingAmount,
                      )} more`}
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  handleAddressClick
                }
                disabled={isSending}
              >
                Add delivery address
              </button>
            )}
          </div>
        )}

      {isSending && (
        <div
          className="order-payment-page__sending-overlay"
          role="status"
          aria-live="polite"
          aria-label="Sending order"
        >
          <div
            className="order-payment-page__spinner"
            aria-hidden="true"
          />

          <p>
            Sending order...
          </p>
        </div>
      )}
    </main>
  )
}

export default OrderPaymentPage