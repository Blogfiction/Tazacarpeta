import { useState, useEffect } from 'react';
import { MapPin, Edit, Trash2, Plus, Package, DollarSign, LinkIcon } from 'lucide-react';
import type { Store, StoreInput } from '../types/database';
import { getStores, createStore, updateStore, deleteStore } from '../services/stores';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PlacesAutocomplete from '../components/PlacesAutocomplete';

export default function StoresAdmin() {
  const { session } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState<StoreInput>({
    name_store: '',
    adress: '',
    phone: undefined,
    email: undefined,
    latitude: undefined,
    longitude: undefined
  });

  useEffect(() => {
    if (!session) return;
    loadStores();
  }, [session]);

  async function loadStores() {
    setLoading(true);
    try {
      const data = await getStores();
      setStores(data);
    } catch (err) {
      setError('Error al cargar las tiendas');
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentStore) {
        await updateStore(currentStore.id_store, formData);
        setSuccess('Tienda actualizada correctamente');
      } else {
        await createStore(formData);
        setSuccess('Tienda creada correctamente');
      }
      setIsModalOpen(false);
      resetForm();
      loadStores();
    } catch (err) {
      setError('Error al guardar la tienda');
      console.error('Error saving store:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tienda?')) return;
    
    setLoading(true);
    try {
      await deleteStore(id);
      setSuccess('Tienda eliminada correctamente');
      loadStores();
    } catch (err) {
      setError('Error al eliminar la tienda');
      console.error('Error deleting store:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      setFormData({
        ...formData,
        adress: place.formatted_address
      });
      
      try {
        const geometry = place.geometry as any;
        if (geometry?.location?.lat && geometry?.location?.lng) {
          setFormData(prev => ({
            ...prev,
            latitude: geometry.location.lat(),
            longitude: geometry.location.lng()
          }));
        }
      } catch (error) {
        console.warn('Error getting geometry from place:', error);
      }
    }
  };

  const openEditModal = (store: Store) => {
    setCurrentStore(store);
    setFormData({
      name_store: store.name_store,
      adress: store.adress,
      phone: store.phone || undefined,
      email: store.email || undefined,
      latitude: store.latitude || undefined,
      longitude: store.longitude || undefined
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentStore(null);
    setFormData({
      name_store: '',
      adress: '',
      phone: undefined,
      email: undefined,
      latitude: undefined,
      longitude: undefined
    });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-press-start text-2xl text-gray-800">Gestión de Tiendas</h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="retro-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tienda
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <p className="font-press-start text-lg text-gray-600">Cargando tiendas...</p>
          </div>
        ) : stores.length > 0 ? (
          <ul className="space-y-4">
            {stores.map((store) => (
              <li key={store.id_store} className="bg-white p-6 rounded-lg border-4 border-gray-800 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-press-start text-lg text-gray-800 mb-2">
                      {store.name_store}
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{store.adress}</span>
                    </div>
                    {store.phone && (
                      <p className="text-sm text-gray-600 mt-1">Tel: {store.phone}</p>
                    )}
                    {store.email && (
                      <p className="text-sm text-gray-600">Email: {store.email}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(store)}
                      className="retro-button-secondary"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(store.id_store)}
                      className="retro-button-danger"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-white p-6 text-center rounded-lg border-4 border-gray-800 shadow-lg">
            <p className="font-press-start text-sm text-gray-600 mb-4">
              No hay tiendas registradas
            </p>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={currentStore ? "Editar Tienda" : "Nueva Tienda"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la tienda
              </label>
              <input
                type="text"
                required
                value={formData.name_store}
                onChange={(e) => setFormData({ ...formData, name_store: e.target.value })}
                className="retro-input"
                placeholder="Nombre de la tienda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <PlacesAutocomplete
                onPlaceSelect={handlePlaceSelect}
                defaultValue={formData.adress}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    phone: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="retro-input"
                  placeholder="Teléfono"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    email: e.target.value || undefined
                  })}
                  className="retro-input"
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="retro-button-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="retro-button-primary"
              >
                {loading ? 'Guardando...' : currentStore ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}