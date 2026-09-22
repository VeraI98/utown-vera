import { createBrowserRouter } from 'react-router-dom'

import AdminLayout from '../components/AdminLayout/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'

import AccountPasswordPage from '../pages/AccountPasswordPage/AccountPasswordPage'
import AccountSettingPage from '../pages/AccountSettingPage/AccountSettingPage'
import AddressCreatePage from '../pages/AddressCreatePage/AddressCreatePage'
import AdminCategoriesPage from '../pages/AdminCategoriesPage/AdminCategoriesPage'
import AdminCategoryAddPage from '../pages/AdminCategoryAddPage/AdminCategoryAddPage'
import AdminClientAddPage from '../pages/AdminClientAddPage/AdminClientAddPage'
import AdminClientEditPage from '../pages/AdminClientEditPage/AdminClientEditPage'
import AdminClientsPage from '../pages/AdminClientsPage/AdminClientsPage'
import AdminEstablishmentAddPage from '../pages/AdminEstablishmentAddPage/AdminEstablishmentAddPage'
import AdminEstablishmentEditPage from '../pages/AdminEstablishmentEditPage/AdminEstablishmentEditPage'
import AdminEstablishmentsPage from '../pages/AdminEstablishmentsPage/AdminEstablishmentsPage'
import AdminOrdersPage from '../pages/AdminOrdersPage/AdminOrdersPage'
import AdminPositionAddPage from '../pages/AdminPositionAddPage/AdminPositionAddPage'
import AdminPositionEditPage from '../pages/AdminPositionEditPage/AdminPositionEditPage'
import AdminPositionsPage from '../pages/AdminPositionsPage/AdminPositionsPage'
import ContactSupportPage from '../pages/ContactSupportPage/ContactSupportPage'
import FavoritesPage from '../pages/FavoritesPage/FavoritesPage'
import FoodCategoryPage from '../pages/FoodCategoryPage/FoodCategoryPage'
import FoodMorePage from '../pages/FoodMorePage/FoodMorePage'
import FoodPage from '../pages/FoodPage/FoodPage'
import FoodSearch from '../pages/FoodSearch/FoodSearch'
import ForgotPasswordPage from '../pages/ForgotPasswordPage/ForgotPasswordPage'
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
import ResetPasswordPage from '../pages/ResetPasswordPage/ResetPasswordPage'
import RestaurantPage from '../pages/RestaurantPage/RestaurantPage'

import OwnerCategoriesListPage from '../pages/owner/OwnerCategoriesListPage/OwnerCategoriesListPage'
import OwnerCategoryFormPage from '../pages/owner/OwnerCategoryFormPage/OwnerCategoryFormPage'
import OwnerDeletedDishesPage from '../pages/owner/OwnerDeletedDishesPage/OwnerDeletedDishesPage'
import OwnerDeliveryAreasPage from '../pages/owner/OwnerDeliveryAreasPage/OwnerDeliveryAreasPage'
import OwnerDeliveryCityPage from '../pages/owner/OwnerDeliveryCityPage/OwnerDeliveryCityPage'
import OwnerDishesOnHoldPage from '../pages/owner/OwnerDishesOnHoldPage/OwnerDishesOnHoldPage'
import OwnerDishFormPage from '../pages/owner/OwnerDishFormPage/OwnerDishFormPage'
import OwnerEditRestaurantPage from '../pages/owner/OwnerEditRestaurantPage/OwnerEditRestaurantPage'
import OwnerHomePage from '../pages/owner/OwnerHomePage'
import OwnerHubPage from '../components/owner/OwnerHubPage/OwnerHubPage'
import OwnerLayout from '../pages/owner/OwnerLayout/OwnerLayout'
import OwnerMenuPage from '../pages/owner/OwnerMenuPage/OwnerMenuPage'
import OwnerNotFoundPage from '../pages/owner/OwnerNotFoundPage/OwnerNotFoundPage'
import OwnerNotificationsPage from '../pages/owner/OwnerNotificationsPage'
import OwnerOrderCardPage from '../pages/owner/OwnerOrderCardPage/OwnerOrderCardPage'
import OwnerOrderCookingTimePage from '../pages/owner/OwnerOrderCookingTimePage/OwnerOrderCookingTimePage'
import OwnerOrdersPage from '../pages/owner/OwnerOrdersPage/OwnerOrdersPage'
import OwnerStatisticsPage from '../pages/owner/OwnerStatisticsPage/OwnerStatisticsPage'
import OwnerWorkingHoursEditPage from '../pages/owner/OwnerWorkingHoursEditPage/OwnerWorkingHoursEditPage'
import OwnerWorkingHoursPage from '../pages/owner/OwnerWorkingHoursPage'

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
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
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

  // Admin
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
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
      {
        path: 'establishments',
        element: <AdminEstablishmentsPage />,
      },
      {
        path: 'establishments/add',
        element: <AdminEstablishmentAddPage />,
      },
      {
        path: 'establishments/:establishmentId/edit',
        element: <AdminEstablishmentEditPage />,
      },
      {
        path: 'establishments/:establishmentId/positions',
        element: <AdminPositionsPage />,
      },
      {
        path: 'establishments/:establishmentId/categories',
        element: <AdminCategoriesPage />,
      },
      {
        path: 'establishments/:establishmentId/categories/add',
        element: <AdminCategoryAddPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'establishments/:establishmentId/positions/add',
        element: <AdminPositionAddPage />,
      },
      {
        path: 'establishments/:establishmentId/positions/:positionId/edit',
        element: <AdminPositionEditPage />,
      },
    ],
  },

  // Restaurant owner
  {
    path: '/owner',
    element: (
      <ProtectedRoute allowedRoles={['RESTAURATEUR']}>
        <OwnerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <OwnerHomePage />,
      },
      {
        path: 'notifications',
        element: <OwnerNotificationsPage />,
      },

      // Orders
      {
        path: 'orders',
        element: <OwnerOrdersPage />,
      },
      {
        path: 'orders/:orderId',
        element: <OwnerOrderCardPage />,
      },
      {
        path: 'orders/:orderId/cooking-time',
        element: <OwnerOrderCookingTimePage />,
      },

      {
        path: 'menu',
        element: <OwnerMenuPage />,
      },
      {
        path: 'menu/edit',
        element: (
          <OwnerHubPage
            title="Edit Menu"
            items={[
              { label: 'Add Dish', path: '/owner/menu/add' },
              { label: 'Dishes on hold', path: '/owner/menu/on-hold' },
              { label: 'Deleted', path: '/owner/menu/deleted' },
              { label: 'Dish Categories', path: '/owner/menu/categories' },
            ]}
          />
        ),
      },
      {
        path: 'menu/add',
        element: <OwnerDishFormPage />,
      },
      {
        path: 'menu/:dishId/edit',
        element: <OwnerDishFormPage />,
      },
      {
        path: 'menu/on-hold',
        element: <OwnerDishesOnHoldPage />,
      },
      {
        path: 'menu/deleted',
        element: <OwnerDeletedDishesPage />,
      },
      {
        path: 'menu/categories',
        element: (
          <OwnerHubPage
            title="Categories of dishes"
            items={[
              { label: 'Add new category', path: '/owner/menu/categories/add' },
              { label: 'Edit categories', path: '/owner/menu/categories/list' },
            ]}
          />
        ),
      },
      {
        path: 'menu/categories/add',
        element: <OwnerCategoryFormPage />,
      },
      {
        path: 'menu/categories/list',
        element: <OwnerCategoriesListPage />,
      },
      {
        path: 'menu/categories/:categoryId/edit',
        element: <OwnerCategoryFormPage />,
      },

      {
        path: 'statistics',
        element: <OwnerStatisticsPage />,
      },

      {
        path: 'working-hours',
        element: <OwnerWorkingHoursPage />,
      },
      {
        path: 'working-hours/edit',
        element: <OwnerWorkingHoursEditPage />,
      },

      {
        path: 'restaurant/edit',
        element: <OwnerEditRestaurantPage />,
      },
      {
        path: 'restaurant/edit/city',
        element: <OwnerDeliveryCityPage />,
      },
      {
        path: 'restaurant/edit/areas',
        element: <OwnerDeliveryAreasPage />,
      },
      {
        path: '*',
        element: <OwnerNotFoundPage />,
      },
    ],
  },
])
