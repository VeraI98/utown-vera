import { createBrowserRouter } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'

import AccountPasswordPage from '../pages/AccountPasswordPage/AccountPasswordPage'
import AccountSettingPage from '../pages/AccountSettingPage/AccountSettingPage'
import AddressCreatePage from '../pages/AddressCreatePage/AddressCreatePage'
import ContactSupportPage from '../pages/ContactSupportPage/ContactSupportPage'
import FavoritesPage from '../pages/FavoritesPage/FavoritesPage'
import FoodMorePage from '../pages/FoodMorePage/FoodMorePage'
import FoodPage from '../pages/FoodPage/FoodPage'
import FoodSearch from '../pages/FoodSearch/FoodSearch'
import HomePage from '../pages/HomePage/HomePage'
import InformationPage from '../pages/InformationPage/InformationPage'
import LoginPage from '../pages/LoginPage/LoginPage'
import NotificationsPage from '../pages/NotificationsPage/NotificationsPage'
import OrderPage from '../pages/OrderPage/OrderPage'
import OrderPaymentPage from '../pages/OrderPaymentPage/OrderPaymentPage'
import OrderRatingPage from '../pages/OrderRatingPage/OrderRatingPage'
import OrdersHistoryPage from '../pages/OrdersHistoryPage/OrdersHistoryPage'
import OrderStatusPage from '../pages/OrderStatusPage/OrderStatusPage'
import PersonalInformationPage from '../pages/PersonalInformationPage/PersonalInformationPage'
import ProfilePage from '../pages/ProfilePage/ProfilePage'
import RegisterPage from '../pages/RegisterPage/RegisterPage'
import RestaurantPage from '../pages/RestaurantPage/RestaurantPage'

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
    path: '/food',
    element: <FoodPage />,
  },
  {
    path: '/food/search',
    element: <FoodSearch />,
  },
  {
    path: '/food/restaurants/:restaurantId',
    element: <RestaurantPage />,
  },
  {
    path: '/food/order',
    element: <OrderPage />,
  },
  {
    path: '/food/order/payment',
    element: <OrderPaymentPage />,
  },
  {
    path: '/food/order/address',
    element: (
      <ProtectedRoute>
        <AddressCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/food/orders',
    element: (
      <ProtectedRoute>
        <OrdersHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/food/order/:orderId/rating',
    element: <OrderRatingPage />,
  },
  {
    path: '/food/order/:orderId/status',
    element: <OrderStatusPage />,
  },
  {
    path: '/food/establishments',
    element: <FoodMorePage title="Establishments" />,
  },
  {
    path: '/food/fastest-delivery',
    element: (
      <FoodMorePage title="The fastest delivery" />
    ),
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