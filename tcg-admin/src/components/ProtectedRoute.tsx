import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDev } from '../context/DevContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const { isDevMode } = useDev();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      console.log('No hay sesión, redirigiendo a login');
      navigate('/login', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}