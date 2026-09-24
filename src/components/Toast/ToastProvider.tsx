import { useCallback, useRef, useState, type ReactNode } from 'react'

import './ToastProvider.css'
import { ToastContext, type ToastType } from './ToastContext'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const TOAST_DURATION = 4000

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId.current
      nextId.current += 1

      setToasts((current) => [...current, { id, message, type }])

      window.setTimeout(() => {
        removeToast(id)
      }, TOAST_DURATION)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item toast-item--${toast.type}`}
            role="alert"
            onClick={() => removeToast(toast.id)}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
