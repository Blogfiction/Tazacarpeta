import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorScreenProps {
  message?: string;
  showHomeLink?: boolean;
}

export default function ErrorScreen({ 
  message = "Ha ocurrido un error inesperado", 
  showHomeLink = true 
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-[#FFFFE0] flex items-center justify-center p-4">
      <div className="retro-container bg-white text-center max-w-md w-full">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h1 className="font-press-start text-lg text-gray-800 mb-4">¡Ups!</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {showHomeLink && (
          <Link to="/" className="retro-button inline-flex justify-center">
            Volver al Inicio
          </Link>
        )}
      </div>
    </div>
  );
}