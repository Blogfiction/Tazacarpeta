import { useAuth } from '../context/AuthContext';

export default function RoleTestComponent() {
  const { isAdmin, isClient, isUser, userProfile } = useAuth();

  return (
    <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
      <h3 className="font-bold mb-2">Prueba de Roles - Contenido Según Rol</h3>
      
      {isAdmin && (
        <div className="bg-red-200 p-2 rounded mb-2">
          <strong>🎯 ADMIN:</strong> Tienes acceso completo a todas las funcionalidades
        </div>
      )}
      
      {isClient && (
        <div className="bg-blue-200 p-2 rounded mb-2">
          <strong>👤 CLIENTE:</strong> Solo puedes ver/editar tus propios datos
        </div>
      )}
      
      {isUser && (
        <div className="bg-yellow-200 p-2 rounded mb-2">
          <strong>👥 USUARIO:</strong> Acceso básico a la plataforma
        </div>
      )}
      
      {!isAdmin && !isClient && !isUser && (
        <div className="bg-gray-200 p-2 rounded mb-2">
          <strong>❓ SIN ROL:</strong> No se pudo determinar tu rol
        </div>
      )}
      
      <div className="text-sm mt-2">
        <strong>Rol detectado:</strong> {userProfile?.role_name || 'No disponible'}
      </div>
    </div>
  );
}
