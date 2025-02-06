import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { session } = useAuth();

  if (!session) return children;

  return (
    <div className="min-h-screen bg-[#FFFFE0] flex flex-col">
      <div className="scanlines"></div>
      <Navbar />
      <div className="content-wrapper flex-1">
        <main className="container-fluid py-4 sm:py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}