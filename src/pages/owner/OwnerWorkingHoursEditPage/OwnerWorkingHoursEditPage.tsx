import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  createOwnerOperatingMode,
  getOwnerOperatingModes,
  updateOwnerOperatingMode,
} from '../../../services/ownerOperatingHoursService'

import type {
  OperatingModeRequest,
  OperatingModeResponse,
} from '../../../services/ownerOperatingHoursService'
import { logError } from '../../../utils/logger'

import './OwnerWorkingHoursEditPage.css'

const DAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

function getErrorMessage(error: unknown): string {
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

  return 'Failed to save working hours.'
}

function OwnerWorkingHoursEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const restaurantId = Number(searchParams.get('restaurantId'))
  const dayOfWeek = Number(searchParams.get('dayOfWeek'))

  const modeIdParam = searchParams.get('modeId')
  const modeId = modeIdParam !== null ? Number(modeIdParam) : null

  const dayName = DAY_NAMES[dayOfWeek] ?? 'Working hours'

  const [existingMode, setExistingMode] =
    useState<OperatingModeResponse | null>(null)

  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('22:00')
  const [dayOff, setDayOff] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')

  const hasValidParams =
    Number.isFinite(restaurantId) &&
    restaurantId > 0 &&
    Number.isFinite(dayOfWeek) &&
    dayOfWeek >= 1 &&
    dayOfWeek <= 7

  useEffect(() => {
    if (!hasValidParams) {
      return
    }

    let isActive = true

    getOwnerOperatingModes(restaurantId)
      .then((modes) => {
        if (!isActive) {
          return
        }

        const mode =
          modes.find((item) => {
            if (modeId !== null && Number.isFinite(modeId)) {
              return item.id === modeId
            }

            return item.dayOfWeek === dayOfWeek
          }) ?? null

        setExistingMode(mode)

        if (mode) {
          setStartTime(mode.start ?? '09:00')
          setEndTime(mode.end ?? '22:00')
          setDayOff(mode.dayOff)
        }

        setErrorMessage('')
      })
      .catch((error: unknown) => {
        logError(
          'OwnerWorkingHoursEditPage: failed to load operating modes',
          error,
        )

        if (!isActive) {
          return
        }

        setErrorMessage(getErrorMessage(error))
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
  }, [hasValidParams, restaurantId, dayOfWeek, modeId])

  const isSaveDisabled = useMemo(() => {
    if (!hasValidParams || isSaving || isLoading) {
      return true
    }

    if (dayOff) {
      return false
    }

    return startTime.length === 0 || endTime.length === 0
  }, [hasValidParams, isSaving, isLoading, dayOff, startTime, endTime])

  const handleDayOffToggle = () => {
    setDayOff((currentValue) => !currentValue)
  }

  const handleSave = async () => {
    if (isSaveDisabled) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    const request: OperatingModeRequest = {
      dayOfWeek,
      start: dayOff ? null : startTime,
      end: dayOff ? null : endTime,
      dayOff,
    }

    try {
      if (existingMode) {
        await updateOwnerOperatingMode(restaurantId, existingMode.id, request)
      } else {
        await createOwnerOperatingMode(restaurantId, request)
      }

      navigate('/owner/working-hours', {
        replace: true,
      })
    } catch (error) {
      logError('OwnerWorkingHoursEditPage: failed to save working hours', error)

      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  if (!hasValidParams) {
    return (
      <main className="owner-working-hours-edit-page">
        <div className="owner-working-hours-edit-page__content">
          <p className="owner-working-hours-edit-page__error" role="alert">
            Invalid working hours parameters.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="owner-working-hours-edit-page">
      <div className="owner-working-hours-edit-page__content">
        <h1>{dayName}</h1>

        {isLoading ? (
          <p className="owner-working-hours-edit-page__message">Loading...</p>
        ) : (
          <>
            <label className="owner-working-hours-edit-page__field">
              <span>Start time</span>

              <input
                type="time"
                value={startTime}
                disabled={dayOff}
                onChange={(event) => {
                  setStartTime(event.target.value)
                }}
              />
            </label>

            <label className="owner-working-hours-edit-page__field">
              <span>End time</span>

              <input
                type="time"
                value={endTime}
                disabled={dayOff}
                onChange={(event) => {
                  setEndTime(event.target.value)
                }}
              />
            </label>

            <div className="owner-working-hours-edit-page__day-off-row">
              <span>Mark as a day off</span>

              <button
                className={`owner-working-hours-edit-page__switch ${
                  dayOff ? 'owner-working-hours-edit-page__switch--active' : ''
                }`}
                type="button"
                role="switch"
                aria-checked={dayOff}
                aria-label="Mark as a day off"
                onClick={handleDayOffToggle}
              >
                <span />
              </button>
            </div>

            {errorMessage && (
              <p className="owner-working-hours-edit-page__error" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              className="owner-working-hours-edit-page__save"
              type="button"
              disabled={isSaveDisabled}
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default OwnerWorkingHoursEditPage
