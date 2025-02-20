import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, MapPin, Link as LinkIcon, Store, TowerControl as GameController } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Activity, ActivityInput, Game, Store as StoreType } from '../types/database';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../services/activities';
import { getGames } from '../services/games';
import { getStores } from '../services/stores';
import Modal from '../components/Modal';
import LoadingScreen from '../components/LoadingScreen';
import PlacesAutocomplete from '../components/PlacesAutocomplete';

export default function ActivitiesAdmin() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<ActivityInput>({
    nombre: '',
    fecha: '',
    ubicacion: '',
    enlace_referencia: '',
    id_juego: undefined,
    id_tienda: undefined,
    place_id: undefined,
    lat: undefined,
    lng: undefined
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadData();
  }, [session, navigate]);

  async function loadData() {
    try {
      const [activitiesData, gamesData, storesData] = await Promise.all([
        getActivities(),
        getGames(),
        getStores()
      ]);
      setActivities(activitiesData);
      setGames(gamesData);
      setStores(storesData);
    } catch (err) {
      setError('Error al cargar los datos');
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
      loadData();
      resetForm();
    } catch (err) {
      setError('Error al guardar la actividad');
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address && place.place_id) {
      setFormData({
        ...formData,
        ubicacion: place.formatted_address,
        place_id: place.place_id,
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng()
      });
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
      id_juego: activity.id_juego || undefined,
      place_id: activity.place_id,
      lat: activity.lat,
      lng: activity.lng
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentActivity(null);
    setFormData({
      nombre: '',
      fecha: '',
      ubicacion: '',
      enlace_referencia: '',
      id_juego: undefined,
      id_tienda: undefined,
      place_id: undefined,
      lat: undefined,
      lng: undefined
    });
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.fecha || !formData.ubicacion) {
      return false;
    }
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;
    
    try {
      await deleteActivity(id);
      loadData();
    } catch (err) {
      setError('Error al eliminar la actividad');
    }
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
          <LoadingScreen />
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => {
                const game = games.find(g => g.id_juego === activity.id_juego);
                const store = stores.find(s => s.id_tienda === activity.id_tienda);

                return (
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
                          {game && (
                            <div className="mt-2 flex items-center text-sm text-blue-600">
                              <GameController className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              {game.nombre}
                            </div>
                          )}
                          {store && (
                            <div className="mt-2 flex items-center text-sm text-green-600">
                              <Store className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              {store.nombre}
                            </div>
                          )}
                          {activity.enlace_referencia && (
                            <div className="mt-2 flex items-center text-sm text-blue-600">
                              <LinkIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              <a
                                href={activity.enlace_referencia}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate hover:underline"
                              >
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
                );
              })}
            </ul>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={currentActivity ? 'Editar Actividad' : 'Nueva Actividad'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="retro-input"
                placeholder="Nombre de la actividad"
              />
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="retro-input"
              />
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Ubicación
              </label>
              <PlacesAutocomplete
                onPlaceSelect={handlePlaceSelect}
                defaultValue={formData.ubicacion}
              />
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Tienda
              </label>
              <select
                value={formData.id_tienda || ''}
                onChange={(e) => setFormData({ ...formData, id_tienda: e.target.value || undefined })}
                className="retro-input"
              >
                <option value="">Selecciona una tienda</option>
                {stores.map((store) => (
                  <option key={store.id_tienda} value={store.id_tienda}>
                    {store.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Juego
              </label>
              <select
                value={formData.id_juego || ''}
                onChange={(e) => setFormData({ ...formData, id_juego: e.target.value || undefined })}
                className="retro-input"
              >
                <option value="">Selecciona un juego</option>
                {games.map((game) => (
                  <option key={game.id_juego} value={game.id_juego}>
                    {game.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Enlace de Referencia
              </label>
              <input
                type="url"
                value={formData.enlace_referencia || ''}
                onChange={(e) => setFormData({ ...formData, enlace_referencia: e.target.value })}
                className="retro-input"
                placeholder="https://ejemplo.com"
              />
            </div>

            <div className="modal-footer">
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
                disabled={!validateForm()}
              >
                {currentActivity ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}