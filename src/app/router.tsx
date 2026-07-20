import { createBrowserRouter } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'

import AccountPasswordPage from '../pages/AccountPasswordPage'
import AccountSettingPage from '../pages/AccountSettingPage'
import ContactSupportPage from '../pages/ContactSupportPage/ContactSupportPage'
import FavoritesPage from '../pages/FavoritesPage'
import HomePage from '../pages/HomePage'
import InformationPage from '../pages/InformationPage/InformationPage'
import LoginPage from '../pages/LoginPage'
import NotificationsPage from '../pages/NotificationsPage'
import PersonalInformationPage from '../pages/PersonalInformationPage'
import ProfilePage from '../pages/ProfilePage'
import RegisterPage from '../pages/RegisterPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/favorites',
    element: <FavoritesPage />,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account',
    element: (
      <ProtectedRoute>
        <AccountSettingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account/personal-information',
    element: (
      <ProtectedRoute>
        <PersonalInformationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account/password',
    element: (
      <ProtectedRoute>
        <AccountPasswordPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/information',
    element: (
      <ProtectedRoute>
        <InformationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contact-support',
    element: (
      <ProtectedRoute>
        <ContactSupportPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
])