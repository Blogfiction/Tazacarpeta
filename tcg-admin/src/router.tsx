import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ActivitiesAdmin from './pages/ActivitiesAdmin';
import ActivityDetail from './pages/ActivityDetail';
import StoresAdmin from './pages/StoresAdmin';
import GamesAdmin from './pages/GamesAdmin';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
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
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: '/activities',
    element: <Layout><ActivitiesAdmin /></Layout>,
  },
  {
    path: '/activities/:id',
    element: <Layout><ActivityDetail /></Layout>,
  },
  {
    path: '/stores',
    element: <Layout><StoresAdmin /></Layout>,
  },
  {
    path: '/games',
    element: <Layout><GamesAdmin /></Layout>,
  },
  {
    path: '/profile',
    element: <Layout><Profile /></Layout>,
  },
  {
    path: '/settings',
    element: <Layout><Settings /></Layout>,
  },
]);