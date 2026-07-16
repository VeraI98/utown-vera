import { createBrowserRouter } from 'react-router-dom'
import AccountPasswordPage from '../pages/AccountPasswordPage'
import AccountSettingPage from '../pages/AccountSettingPage'
import FavouritesPage from '../pages/FavouritesPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import PersonalInformationPage from '../pages/PersonalInformationPage'
import ProfilePage from '../pages/ProfilePage'
import RegisterPage from '../pages/RegisterPage'
import ProtectedRoute from '../components/ProtectedRoute'

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
    path: '/favourites',
    element: <FavouritesPage />,
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
])