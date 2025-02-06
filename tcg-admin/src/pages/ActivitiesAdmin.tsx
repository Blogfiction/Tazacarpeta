import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Activity, ActivityInput } from '../types/database';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../services/activities';

export default function ActivitiesAdmin() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<ActivityInput>({
    nombre: '',
    fecha: '',
    ubicacion: '',
    enlace_referencia: ''
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadActivities();
  }, [session, navigate]);

  async function loadActivities() {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (err) {
      setError('Error al cargar las actividades');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (currentActivity) {
        await updateActivity(currentActivity.id_actividad, formData);
      } else {
        await createActivity(formData);
      }
      setIsModalOpen(false);
      loadActivities();
      resetForm();
    } catch (err) {
      setError('Error al guardar la actividad');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;
    
    try {
      await deleteActivity(id);
      loadActivities();
    } catch (err) {
      setError('Error al eliminar la actividad');
    }
  };

  const openEditModal = (activity: Activity) => {
    setCurrentActivity(activity);
    setFormData({
      nombre: activity.nombre,
      fecha: new Date(activity.fecha).toISOString().slice(0, 16),
      ubicacion: activity.ubicacion,
      enlace_referencia: activity.enlace_referencia || '',
      id_tienda: activity.id_tienda || undefined,
      id_juego: activity.id_juego || undefined
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentActivity(null);
    setFormData({
      nombre: '',
      fecha: '',
      ubicacion: '',
      enlace_referencia: ''
    });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="retro-button inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="font-press-start text-xs sm:text-sm">Nueva Actividad</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <li key={activity.id_actividad}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {activity.nombre}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {new Date(activity.fecha).toLocaleString()}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {activity.ubicacion}
                        </div>
                        {activity.enlace_referencia && (
                          <div className="mt-2 flex items-center text-sm text-blue-600">
                            <LinkIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <a href={activity.enlace_referencia} target="_blank" rel="noopener noreferrer">
                              Enlace de referencia
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(activity)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id_actividad)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentActivity ? 'Editar' : 'Nueva'} Actividad
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Enlace de Referencia
                  </label>
                  <input
                    type="url"
                    value={formData.enlace_referencia || ''}
                    onChange={(e) => setFormData({ ...formData, enlace_referencia: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="retro-button bg-gray-600 hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="retro-button"
                  >
                    {currentActivity ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}