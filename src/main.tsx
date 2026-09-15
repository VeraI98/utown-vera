import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from './app/router'
import { ToastProvider } from './components/Toast/ToastProvider'
import { AuthProvider } from './hooks/AuthProvider'

import './styles/global.css'

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)