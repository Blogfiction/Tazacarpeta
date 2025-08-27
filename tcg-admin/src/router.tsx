import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ActivitiesAdmin from './pages/ActivitiesAdmin';
import ActivityDetail from './pages/ActivityDetail';
import StoresAdmin from './pages/StoresAdmin';
import GamesAdmin from './pages/GamesAdmin';
import UsersAdmin from './pages/UsersAdmin';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import ErrorScreen from './components/ErrorScreen';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorScreen />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/activities',
    element: (
      <ProtectedRoute>
        <Layout>
          <ActivitiesAdmin />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/activities/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <ActivityDetail />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stores',
    element: (
      <ProtectedRoute>
        <Layout>
          <StoresAdmin />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/games',
    element: (
      <ProtectedRoute>
        <Layout>
          <GamesAdmin />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <Layout>
          <UsersAdmin />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout>
          <Profile />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout>
          <Settings />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <Layout>
          <Reports />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);