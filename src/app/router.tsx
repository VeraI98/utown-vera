import { createBrowserRouter } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'

import AccountPasswordPage from '../pages/AccountPasswordPage/AccountPasswordPage'
import AccountSettingPage from '../pages/AccountSettingPage/AccountSettingPage'
import AddressCreatePage from '../pages/AddressCreatePage/AddressCreatePage'
import ContactSupportPage from '../pages/ContactSupportPage/ContactSupportPage'
import FavoritesPage from '../pages/FavoritesPage/FavoritesPage'
import FoodCategoryPage from '../pages/FoodCategoryPage/FoodCategoryPage'
import FoodMorePage from '../pages/FoodMorePage/FoodMorePage'
import FoodPage from '../pages/FoodPage/FoodPage'
import FoodSearch from '../pages/FoodSearch/FoodSearch'
import HomePage from '../pages/HomePage/HomePage'
import InformationPage from '../pages/InformationPage/InformationPage'
import LegalPage from '../pages/LegalPage/LegalPage'
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
import AdminLayout from '../components/AdminLayout/AdminLayout'
import AdminClientsPage from '../pages/AdminClientsPage/AdminClientsPage'
import AdminClientAddPage from '../pages/AdminClientAddPage/AdminClientAddPage'
import AdminClientEditPage from '../pages/AdminClientEditPage/AdminClientEditPage'
import AdminRoute from '../components/AdminRoute'



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
    element: (
      <ProtectedRoute>
        <FavoritesPage />
      </ProtectedRoute>
    ),
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
    path: '/food/category/:categoryId',
    element: <FoodCategoryPage />,
  },
  {
    path: '/food/restaurants/:restaurantId',
    element: <RestaurantPage />,
  },
  {
    path: '/food/establishments',
    element: <FoodMorePage title="Establishments" />,
  },
  {
    path: '/food/fastest-delivery',
    element: <FoodMorePage title="The fastest delivery" />,
  },

  {
    path: '/food/order',
    element: (
      <ProtectedRoute>
        <OrderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/food/order/payment',
    element: (
      <ProtectedRoute>
        <OrderPaymentPage />
      </ProtectedRoute>
    ),
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
    path: '/food/order/:orderId/rating',
    element: (
      <ProtectedRoute>
        <OrderRatingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/food/order/:orderId/status',
    element: (
      <ProtectedRoute>
        <OrderStatusPage />
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
    path: '/information/:type',
    element: (
      <ProtectedRoute>
        <LegalPage />
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

  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: 'clients',
        element: <AdminClientsPage />,
      },
      {
        path: 'clients/add',
        element: <AdminClientAddPage />,
      },
      {
        path: 'clients/:clientId/edit',
        element: <AdminClientEditPage />,
      },
    ],
  },
])