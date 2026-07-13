import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import FavouritesPage from '../pages/FavouritesPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
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
])