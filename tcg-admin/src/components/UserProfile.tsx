import { useState } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 border-2 border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-gray-800"
        aria-label="Menú de usuario"
      >
        <User className="w-4 h-4 text-yellow-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border-2 border-yellow-200">
          <div className="px-4 py-2 text-xs text-yellow-200 font-press-start border-b border-gray-700">
            {session?.user.email}
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/profile');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-yellow-200 flex items-center"
          >
            <User className="w-4 h-4 mr-2" />
            Ver perfil
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/settings');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-yellow-200 flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </button>
          <div className="border-t border-gray-700"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}