import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { updateOrderCookingTime } from '../../../services/ownerOrderService'
import { getErrorMessage } from '../../../utils/getErrorMessage'
import { logError } from '../../../utils/logger'

import './OwnerOrderCookingTimePage.css'

const DEFAULT_MINUTES = 50
const STEP_MINUTES = 5
const MIN_MINUTES = 5
const MAX_MINUTES = 180

function OwnerOrderCookingTimePage() {
  const navigate = useNavigate()
  const { orderId } = useParams()

  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleDecrease = () => {
    setMinutes((current) => Math.max(MIN_MINUTES, current - STEP_MINUTES))
  }

  const handleIncrease = () => {
    setMinutes((current) => Math.min(MAX_MINUTES, current + STEP_MINUTES))
  }

  const handleStartCooking = async () => {
    const id = Number(orderId)

    if (!id || isSaving) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      await updateOrderCookingTime(id, minutes)

      navigate(`/owner/orders/${orderId}`, { replace: true })
    } catch (error) {
      logError('OwnerOrderCookingTimePage: failed to save cooking time', error)

      setErrorMessage(getErrorMessage(error, 'Something went wrong.'))
      setIsSaving(false)
    }
  }

  return (
    <main className="owner-order-cooking-time-page">
      <div className="owner-order-cooking-time-page__content">
        <p className="owner-order-cooking-time-page__label">
          Specify cooking time
        </p>

        <div className="owner-order-cooking-time-page__stepper">
          <button
            type="button"
            className="owner-order-cooking-time-page__step-button"
            aria-label="Decrease cooking time"
            onClick={handleDecrease}
          >
            -
          </button>

          <span className="owner-order-cooking-time-page__value">
            {minutes} min
          </span>

          <button
            type="button"
            className="owner-order-cooking-time-page__step-button"
            aria-label="Increase cooking time"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>

        {errorMessage && (
          <p className="owner-order-cooking-time-page__error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <button
        type="button"
        className="owner-order-cooking-time-page__start-button"
        disabled={isSaving}
        onClick={() => void handleStartCooking()}
      >
        {isSaving ? 'Saving...' : 'Start cooking'}
      </button>
    </main>
  )
}

export default OwnerOrderCookingTimePage
