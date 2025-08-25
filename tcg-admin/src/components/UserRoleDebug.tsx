import { useAuth } from '../context/AuthContext';

export default function UserRoleDebug() {
  const { user, userProfile, isAdmin, isClient, isUser, loading } = useAuth();

  if (loading) {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Cargando perfil...</div>;
  }

  return (
    <div className="p-4 bg-blue-100 text-blue-800 rounded mb-4">
      <h3 className="font-bold mb-2">Debug - Información del Usuario</h3>
      <div className="text-sm space-y-1">
        <div><strong>User ID:</strong> {user?.id || 'No disponible'}</div>
        <div><strong>User Email:</strong> {user?.email || 'No disponible'}</div>
        <div><strong>Profile ID:</strong> {userProfile?.id_user || 'No disponible'}</div>
        <div><strong>Role ID:</strong> {userProfile?.id_role || 'No disponible'}</div>
        <div><strong>Role Name:</strong> {userProfile?.role_name || 'No disponible'}</div>
        <div><strong>Role Description:</strong> {userProfile?.role_description || 'No disponible'}</div>
        <div><strong>isAdmin:</strong> {isAdmin ? 'SÍ' : 'NO'}</div>
        <div><strong>isClient:</strong> {isClient ? 'SÍ' : 'NO'}</div>
        <div><strong>isUser:</strong> {isUser ? 'SÍ' : 'NO'}</div>
      </div>
    </div>
  );
}
