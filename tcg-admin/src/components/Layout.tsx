import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Toast from './Toast';
import LoadingScreen from './LoadingScreen';
import ScrollToTop from './ScrollToTop';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0] flex flex-col">
      <ScrollToTop />
      <div className="scanlines" aria-hidden="true"></div>
      <Toast />
      <a 
        href="#main-content" 
        className="skip-to-content"
      >
        Saltar al contenido principal
      </a>
      <Navbar />
      <div className="content-wrapper flex-1">
        <main id="main-content" className="container-fluid py-4 sm:py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}