import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, MapPin, Clock, TowerControl as GameController } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Store, StoreInput, Direccion, HorarioTienda, Game, StoreGameInput } from '../types/database';
import { getStores, createStore, updateStore, deleteStore } from '../services/stores';
import { getGames } from '../services/games';
import { addGameToStore, removeGameFromStore, getStoreGames, updateStoreGame } from '../services/games';
import Modal from '../components/Modal';

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const PLANES = ['básico', 'premium', 'enterprise'];

const HORARIO_INICIAL: HorarioTienda = DIAS_SEMANA.reduce((acc, dia) => ({
  ...acc,
  [dia]: { apertura: '09:00', cierre: '18:00' }
}), {} as HorarioTienda);

interface StoreGameFormData {
  id_juego: string;
  stock: number;
  precio: number;
}

export default function StoresAdmin() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [storeGames, setStoreGames] = useState<Map<string, StoreGameFormData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState<StoreInput>({
    nombre: '',
    direccion: {
      calle: '',
      numero: '',
      ciudad: '',
      estado: '',
      cp: ''
    },
    horario: HORARIO_INICIAL,
    plan: 'básico'
  });
  const [gameFormData, setGameFormData] = useState<StoreGameFormData>({
    id_juego: '',
    stock: 0,
    precio: 0
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadStores();
    loadGames();
  }, [session, navigate]);

  async function loadStores() {
    try {
      const data = await getStores();
      setStores(data);
    } catch (err) {
      setError('Error al cargar las tiendas');
    } finally {
      setLoading(false);
    }
  }

  async function loadGames() {
    try {
      const data = await getGames();
      setGames(data);
    } catch (err) {
      setError('Error al cargar los juegos');
    }
  }

  async function loadStoreGames(storeId: string) {
    try {
      const data = await getStoreGames(storeId);
      const gamesMap = new Map();
      data.forEach(sg => {
        gamesMap.set(sg.id_juego, {
          id_juego: sg.id_juego,
          stock: sg.stock,
          precio: sg.precio
        });
      });
      setStoreGames(gamesMap);
    } catch (err) {
      setError('Error al cargar los juegos de la tienda');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (currentStore) {
        await updateStore(currentStore.id_tienda, formData);
      } else {
        await createStore(formData);
      }
      setIsModalOpen(false);
      loadStores();
      resetForm();
    } catch (err) {
      setError('Error al guardar la tienda');
    }
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    try {
      if (storeGames.has(gameFormData.id_juego)) {
        await updateStoreGame(
          selectedStore.id_tienda,
          gameFormData.id_juego,
          gameFormData
        );
      } else {
        await addGameToStore({
          id_tienda: selectedStore.id_tienda,
          ...gameFormData
        });
      }
      await loadStoreGames(selectedStore.id_tienda);
      setIsGameModalOpen(false);
      resetGameForm();
    } catch (err) {
      setError('Error al guardar el juego en la tienda');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tienda?')) return;
    
    try {
      await deleteStore(id);
      loadStores();
    } catch (err) {
      setError('Error al eliminar la tienda');
    }
  };

  const handleRemoveGame = async (gameId: string) => {
    if (!selectedStore || !confirm('¿Estás seguro de que deseas eliminar este juego de la tienda?')) return;

    try {
      await removeGameFromStore(selectedStore.id_tienda, gameId);
      await loadStoreGames(selectedStore.id_tienda);
    } catch (err) {
      setError('Error al eliminar el juego de la tienda');
    }
  };

  const openEditModal = (store: Store) => {
    setCurrentStore(store);
    setFormData({
      nombre: store.nombre,
      direccion: store.direccion,
      horario: store.horario,
      plan: store.plan
    });
    setIsModalOpen(true);
  };

  const openGameModal = (store: Store) => {
    setSelectedStore(store);
    loadStoreGames(store.id_tienda);
    setIsGameModalOpen(true);
  };

  const resetForm = () => {
    setCurrentStore(null);
    setFormData({
      nombre: '',
      direccion: {
        calle: '',
        numero: '',
        ciudad: '',
        estado: '',
        cp: ''
      },
      horario: HORARIO_INICIAL,
      plan: 'básico'
    });
  };

  const resetGameForm = () => {
    setGameFormData({
      id_juego: '',
      stock: 0,
      precio: 0
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
            <span className="font-press-start text-xs sm:text-sm">Nueva Tienda</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-r-transparent"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {stores.map((store) => (
                <li key={store.id_tienda}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {store.nombre}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {`${store.direccion.calle} ${store.direccion.numero}, ${store.direccion.ciudad}, ${store.direccion.estado} CP ${store.direccion.cp}`}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {`Lunes a Viernes: ${store.horario.lunes.apertura} - ${store.horario.lunes.cierre}`}
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Plan {store.plan}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => openGameModal(store)}
                          className="retro-button inline-flex items-center bg-blue-600 hover:bg-blue-700"
                        >
                          <GameController className="h-4 w-4 mr-2" />
                          <span className="font-press-start text-xs">Gestionar Juegos</span>
                        </button>
                        <button
                          onClick={() => openEditModal(store)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(store.id_tienda)}
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

        {/* Modal de Juegos */}
        <Modal
          isOpen={isGameModalOpen}
          onClose={() => {
            setIsGameModalOpen(false);
            setSelectedStore(null);
            resetGameForm();
          }}
          title="Gestionar Juegos de la Tienda"
        >
          <div className="space-y-6">
            <form onSubmit={handleGameSubmit} className="space-y-4">
              <div>
                <label className="block font-press-start text-xs text-gray-700 mb-2">
                  Juego
                </label>
                <select
                  value={gameFormData.id_juego}
                  onChange={(e) => setGameFormData({ ...gameFormData, id_juego: e.target.value })}
                  className="retro-input"
                  required
                >
                  <option value="">Selecciona un juego</option>
                  {games.map((game) => (
                    <option key={game.id_juego} value={game.id_juego}>
                      {game.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-press-start text-xs text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={gameFormData.stock}
                    onChange={(e) => setGameFormData({ ...gameFormData, stock: parseInt(e.target.value) })}
                    className="retro-input"
                    required
                  />
                </div>
                <div>
                  <label className="block font-press-start text-xs text-gray-700 mb-2">
                    Precio
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={gameFormData.precio}
                    onChange={(e) => setGameFormData({ ...gameFormData, precio: parseFloat(e.target.value) })}
                    className="retro-input"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="retro-button">
                  Agregar Juego
                </button>
              </div>
            </form>

            <div className="mt-6">
              <h3 className="font-press-start text-sm text-gray-800 mb-4">
                Juegos en la Tienda
              </h3>
              <div className="space-y-4">
                {Array.from(storeGames.entries()).map(([gameId, data]) => {
                  const game = games.find(g => g.id_juego === gameId);
                  if (!game) return null;

                  return (
                    <div key={gameId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{game.nombre}</h4>
                        <p className="text-sm text-gray-600">
                          Stock: {data.stock} | Precio: ${data.precio}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveGame(gameId)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>

        {/* Modal de Tienda */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={currentStore ? 'Editar Tienda' : 'Nueva Tienda'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="retro-input"
                placeholder="Nombre de la tienda"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 text-sm">Dirección</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calle
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direccion.calle}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, calle: e.target.value }
                    })}
                    className="retro-input"
                    placeholder="Nombre de la calle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direccion.numero}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, numero: e.target.value }
                    })}
                    className="retro-input"
                    placeholder="Número exterior"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direccion.ciudad}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, ciudad: e.target.value }
                    })}
                    className="retro-input"
                    placeholder="Ciudad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direccion.estado}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, estado: e.target.value }
                    })}
                    className="retro-input"
                    placeholder="Estado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direccion.cp}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, cp: e.target.value }
                    })}
                    className="retro-input"
                    placeholder="CP"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 text-sm">Horario</h3>
              <div className="grid grid-cols-1 gap-4">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
                    <span className="w-24 text-sm text-gray-700 capitalize">{dia}</span>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Apertura</label>
                        <input
                          type="time"
                          required
                          value={formData.horario[dia].apertura}
                          onChange={(e) => setFormData({
                            ...formData,
                            horario: {
                              ...formData.horario,
                              [dia]: { ...formData.horario[dia], apertura: e.target.value }
                            }
                          })}
                          className="retro-input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                        <input
                          type="time"
                          required
                          value={formData.horario[dia].cierre}
                          onChange={(e) => setFormData({
                            ...formData,
                            horario: {
                              ...formData.horario,
                              [dia]: { ...formData.horario[dia], cierre: e.target.value }
                            }
                          })}
                          className="retro-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan
              </label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="retro-input"
              >
                {PLANES.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </option>
                ))}
              </select>
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
              >
                {currentStore ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}