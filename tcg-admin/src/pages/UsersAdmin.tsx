import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  UserPlus,
  Search,
  Filter
} from 'lucide-react';
import { 
  getAllUsers, 
  getAllRoles, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserStats,
  type AdminUser, 
  type Role, 
  type CreateUserData, 
  type UpdateUserData 
} from '../services/adminUsers';
import LoadingScreen from '../components/LoadingScreen';
import toast from 'react-hot-toast';

export default function UsersAdmin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, byRole: {} as Record<string, number> });
  
  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Estados para el formulario
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    city: '',
    region: '',
    country: '',
    id_role: ''
  });
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Estados para confirmaciones
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  async function loadData() {
    try {
      const [usersData, rolesData, statsData] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
        getUserStats()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setStats(statsData);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async () => {
    try {
      if (!formData.email || !formData.password || !formData.first_name || !formData.last_name || !formData.id_role) {
        toast.error('Todos los campos obligatorios deben estar completos');
        return;
      }

      const newUser = await createUser(formData);
      toast.success('Usuario creado exitosamente');
      
      // Cerrar modal y limpiar estado
      closeModal();
      resetForm();
      
      // Recargar datos desde la base de datos para asegurar sincronización
      await loadData();
    } catch (error) {
      toast.error('Error al crear el usuario');
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) {
      toast.error('Error: Usuario no seleccionado');
      return;
    }
    
    if (!editingUser.id_user) {
      toast.error('Error: ID de usuario no válido');
      return;
    }
    
    try {
      const updateData: UpdateUserData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        city: formData.city || undefined,
        region: formData.region || undefined,
        country: formData.country || undefined,
        id_role: formData.id_role
      };

      // Solo incluir email si cambió
      if (formData.email !== editingUser.email) {
        updateData.email = formData.email;
      }

      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await updateUser(editingUser.id_user, updateData);
      toast.success('Usuario actualizado exitosamente');
      
      // Cerrar modal y limpiar estado
      closeModal();
      resetForm();
      
      // Recargar datos desde la base de datos para asegurar sincronización
      await loadData();
    } catch (error) {
      toast.error('Error al actualizar el usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
      setShowDeleteConfirm(null);
      
      // Recargar datos desde la base de datos para asegurar sincronización
      await loadData();
    } catch (error) {
      toast.error('Error al eliminar el usuario');
      console.error('Error deleting user:', error);
    }
  };



  const openCreateModal = () => {
    setModalMode('create');
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    // Verificar que el usuario tenga todos los campos necesarios
    if (!user || !user.id_user) {
      toast.error('Error: Usuario no válido');
      return;
    }
    
    // Verificar que el usuario esté en la lista actualizada
    const currentUser = users.find(u => u.id_user === user.id_user);
    if (!currentUser) {
      toast.error('Error: Usuario no encontrado');
      return;
    }
    
    setModalMode('edit');
    setEditingUser(currentUser);
    
    const formDataToSet = {
      email: currentUser.email || '',
      password: '',
      first_name: currentUser.first_name || '',
      last_name: currentUser.last_name || '',
      city: currentUser.city || '',
      region: currentUser.region || '',
      country: currentUser.country || '',
      id_role: currentUser.id_role || ''
    };
    
    setFormData(formDataToSet);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      city: '',
      region: '',
      country: '',
      id_role: ''
    });
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role_name === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (!isAdmin) return null;
  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-press-start text-3xl text-gray-800 mb-2">
            Administración de Usuarios
          </h1>
          <p className="text-gray-600">
            Gestiona todos los usuarios del sistema y asigna roles
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="retro-container bg-white p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="font-press-start text-2xl text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          
          {Object.entries(stats.byRole).map(([roleName, count]) => (
            <div key={roleName} className="retro-container bg-white p-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">{roleName}</p>
                  <p className="font-press-start text-2xl text-gray-800">{count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controles */}
        <div className="retro-container bg-white p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtro por rol */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los roles</option>
                  {roles.map(role => (
                    <option key={role.id_role} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón crear usuario */}
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="retro-container bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id_user} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role_name === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role_name === 'Cliente' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role_name || 'Sin rol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.city && user.region ? `${user.city}, ${user.region}` : 'No especificada'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                                                 <button
                           onClick={() => openEditModal(user)}
                           className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                           title="Editar"
                           disabled={!user.id_user}
                         >
                           <Edit className="h-4 w-4" />
                         </button>
                        
                        <button
                          onClick={() => setShowDeleteConfirm(user.id_user)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de creación/edición */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); modalMode === 'create' ? handleCreateUser() : handleUpdateUser(); }}>
                <div className="space-y-4">
                                     {/* Email - siempre visible */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700">
                       Email {modalMode === 'create' ? '*' : ''}
                     </label>
                     <input
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       required={modalMode === 'create'}
                     />
                   </div>
                   
                   {/* Contraseña - siempre visible */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700">
                       Contraseña {modalMode === 'create' ? '*' : ' (dejar en blanco para no cambiar)'}
                     </label>
                     <div className="relative">
                       <input
                         type="password"
                         value={formData.password}
                         onChange={(e) => setFormData({...formData, password: e.target.value})}
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         required={modalMode === 'create'}
                         placeholder={modalMode === 'edit' ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
                       />
                     </div>
                   </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol *</label>
                    <select
                      value={formData.id_role}
                      onChange={(e) => setFormData({...formData, id_role: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      {roles.map(role => (
                        <option key={role.id_role} value={role.id_role}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Opcional"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Región</label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">País</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Eliminación</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
