import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, MapPin, Clock, TowerControl as GameController, 
  Package, DollarSign, Coins, ChevronDown, ChevronUp, ShoppingBag, AlertCircle,
  Link as LinkIcon,
  ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Store, StoreInput, Direccion, HorarioTienda, Game, StoreGameInput } from '../types/database';
import { getStores, createStore, updateStore, deleteStore } from '../services/stores';
import { getGames } from '../services/games';
import { addGameToStore, removeGameFromStore, getStoreGames, updateStoreGame } from '../services/games';
import Modal from '../components/Modal';
import LoadingScreen from '../components/LoadingScreen';
import PlacesAutocomplete from '../components/PlacesAutocomplete';

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

function renderStoreItem(
  store: Store, 
  storeGames: Map<string, StoreGameFormData>,
  games: Game[],
  openEditModal: (store: Store) => void,
  openGameModal: (store: Store) => void,
  handleDelete: (id: string) => void,
  handleRemoveGame: (gameId: string) => void,
) {
  const dayHours = store.horario.lunes;
  
  const fullAddress = `${store.direccion.calle} ${store.direccion.numero}, ${store.direccion.ciudad}, ${store.direccion.estado} CP ${store.direccion.cp}`;
  
  const storeGamesList = Array.from(storeGames.entries()).map(([gameId, gameData]) => {
    const gameInfo = games.find(g => g.id_juego === gameId);
    return {
      id: gameId,
      nombre: gameInfo?.nombre || 'Juego desconocido',
      stock: gameData.stock,
      precio: gameData.precio
    };
  });
  
  const getPlanBadgeClass = (plan: string) => {
    switch(plan.toLowerCase()) {
      case 'premium': return 'premium';
      case 'enterprise': return 'enterprise';
      default: return 'basic';
    }
  };
  
  return (
    <li key={store.id_tienda} className="mb-6">
      <div className="store-card">
        <h3 className="store-title">
          {store.nombre}
        </h3>
        
        <div className="store-detail">
          <MapPin className="store-detail-icon text-red-600" />
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="store-detail-text hover:text-blue-600 transition-colors flex items-center"
          >
            {fullAddress}
            <LinkIcon className="w-3 h-3 ml-1 inline" />
          </a>
        </div>
        
        <div className="store-hours">
          <h4 className="store-hours-title">HORARIO DE ATENCIÓN</h4>
          <div className="store-hours-grid">
            {DIAS_SEMANA.map(dia => (
              <div key={dia} className="store-day">
                <strong className="capitalize">{dia}:</strong> {store.horario[dia].apertura} - {store.horario[dia].cierre}
              </div>
            ))}
          </div>
        </div>
        
        <div className={`store-plan-badge ${getPlanBadgeClass(store.plan)}`}>
          <Coins className="h-3 w-3 mr-1" />
          Plan {store.plan}
        </div>
        
        {storeGamesList.length > 0 && (
          <div className="store-games-list">
            <h4 className="store-hours-title mb-3">
              <GameController className="h-3 w-3 mr-1 inline" />
              INVENTARIO ({storeGamesList.length} juegos)
            </h4>
            
            {storeGamesList.slice(0, 3).map(game => (
              <div key={game.id} className="store-game-item">
                <div className="store-game-name">{game.nombre}</div>
                <div className="store-game-details">
                  <div className="store-game-detail">
                    <Package className="h-3 w-3 mr-1" />
                    {game.stock}
                  </div>
                  <div className="store-game-detail">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${game.precio}
                  </div>
                </div>
              </div>
            ))}
            
            {storeGamesList.length > 3 && (
              <div className="text-center text-xs text-gray-500 mt-2">
                Y {storeGamesList.length - 3} juegos más...
              </div>
            )}
          </div>
        )}
        
        <div className="store-actions">
          <button
            onClick={() => openGameModal(store)}
            className="store-action-button games"
          >
            <GameController className="h-4 w-4 mr-2" />
            <span className="font-['Press_Start_2P'] text-xs">Gestionar Juegos</span>
          </button>
          
          <button
            onClick={() => openEditModal(store)}
            className="store-action-button edit"
            aria-label="Editar tienda"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleDelete(store.id_tienda)}
            className="store-action-button delete"
            aria-label="Eliminar tienda"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

const ITEMS_PER_PAGE = 5;

export default function StoresAdmin() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [storeGames, setStoreGames] = useState<Map<string, StoreGameFormData>>(new Map());
  const [storeGamesMap, setStoreGamesMap] = useState<Map<string, Map<string, StoreGameFormData>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<StoreInput>({
    nombre: '',
    direccion: {
      calle: '',
      numero: '',
      ciudad: '',
      estado: '',
      cp: '',
      place_id: undefined,
      lat: undefined,
      lng: undefined
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
      
      // Después de cargar las tiendas, cargamos los juegos de cada una
      const gamesMap = new Map<string, Map<string, StoreGameFormData>>();
      
      // Promise.all para cargar los juegos de todas las tiendas en paralelo
      await Promise.all(data.map(async (store) => {
        try {
          const storeGamesData = await getStoreGames(store.id_tienda);
          const gamesMapForStore = new Map<string, StoreGameFormData>();
          
          storeGamesData.forEach(sg => {
            gamesMapForStore.set(sg.id_juego, {
              id_juego: sg.id_juego,
              stock: sg.stock,
              precio: sg.precio
            });
          });
          
          gamesMap.set(store.id_tienda, gamesMapForStore);
        } catch (err) {
          console.error(`Error loading games for store ${store.id_tienda}:`, err);
        }
      }));
      
      setStoreGamesMap(gamesMap);
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
      
      // También actualizamos el mapa global
      const updatedMap = new Map(storeGamesMap);
      updatedMap.set(storeId, gamesMap);
      setStoreGamesMap(updatedMap);
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

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      const updatedFormData = JSON.parse(JSON.stringify(formData));
      
      const addressComponents = place.address_components || [];
      let streetNumber = '';
      let route = '';
      let locality = '';
      let region = '';
      let postalCode = '';

      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        } else if (types.includes('route')) {
          route = component.long_name;
        } else if (types.includes('locality')) {
          locality = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          region = component.long_name;
        } else if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
      });

      updatedFormData.direccion = {
        ...updatedFormData.direccion,
        calle: route || updatedFormData.direccion.calle,
        numero: streetNumber || updatedFormData.direccion.numero,
        ciudad: locality || updatedFormData.direccion.ciudad,
        estado: region || updatedFormData.direccion.estado,
        cp: postalCode || updatedFormData.direccion.cp,
        place_id: place.place_id,
      };
      
      if (place.geometry && place.geometry.location) {
        updatedFormData.direccion.lat = place.geometry.location.lat();
        updatedFormData.direccion.lng = place.geometry.location.lng();
      }

      setFormData(updatedFormData);
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
    resetGameForm();
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
        cp: '',
        place_id: undefined,
        lat: undefined,
        lng: undefined
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

  const hasStoreGames = selectedStore ? (storeGamesMap.get(selectedStore.id_tienda)?.size ?? 0) > 0 : false;

  if (!session) return null;

  const calculatePaginatedItems = (items: Store[], page: number) => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = items.slice(startIndex, endIndex);
    return { paginatedItems, totalPages, totalItems };
  };

  const {
    paginatedItems: paginatedStores,
    totalPages: totalStorePages,
    totalItems: totalStoreItems
  } = calculatePaginatedItems(stores, currentPage);
  
  const renderPaginationControls = (
    currentPageNum: number, 
    totalPagesNum: number, 
    setPage: (page: number | ((prev: number) => number)) => void,
  ) => {
    if (totalPagesNum <= 1) return null;
    
    return (
      <div className="flex items-center justify-center mt-6 py-2">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPageNum === 1}
            className={`retro-button p-2 text-xs sm:p-2 ${currentPageNum === 1 ? 'bg-gray-400 opacity-70 cursor-not-allowed' : 'bg-gray-600'}`}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-['Press_Start_2P'] text-sm text-gray-800 whitespace-nowrap">
            Pág {currentPageNum} / {totalPagesNum}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPagesNum))}
            disabled={currentPageNum === totalPagesNum}
            className={`retro-button p-2 text-xs sm:p-2 ${currentPageNum === totalPagesNum ? 'bg-gray-400 opacity-70 cursor-not-allowed' : 'bg-gray-800'}`}
            aria-label="Página siguiente"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-xl font-press-start text-gray-800">Tiendas</h1>
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
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg border-2 border-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingScreen />
        ) : stores.length > 0 ? (
          <>
            <ul>
              {paginatedStores.map((store) => {
                const storeGamesData = storeGamesMap.get(store.id_tienda) || new Map();
                
                return renderStoreItem(
                  store,
                  storeGamesData,
                  games,
                  openEditModal,
                  openGameModal,
                  handleDelete,
                  handleRemoveGame
                );
              })}
            </ul>
            {renderPaginationControls(currentPage, totalStorePages, setCurrentPage)}
          </>
        ) : (
          <div className="bg-white p-6 text-center rounded-lg border-4 border-gray-800 shadow-lg">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="font-press-start text-sm text-gray-600 mb-4">
              No hay tiendas registradas
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="retro-button inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-press-start text-xs">Crear primera tienda</span>
            </button>
          </div>
        )}

        <Modal
          isOpen={isGameModalOpen}
          onClose={() => {
            setIsGameModalOpen(false);
            setSelectedStore(null);
            resetGameForm();
          }}
          title={selectedStore ? `Juegos de ${selectedStore.nombre}` : "Gestionar Juegos"}
        >
          <div className="space-y-6">
            <form onSubmit={handleGameSubmit} className="space-y-4">
              <div className="rounded-lg border-2 border-gray-800 p-4 bg-gray-50">
                <h3 className="font-press-start text-sm text-gray-800 mb-3">Agregar nuevo juego</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block font-press-start text-xs text-gray-700 mb-2">
                      Juego
                    </label>
                    <select
                      value={gameFormData.id_juego}
                      onChange={(e) => setGameFormData({ ...gameFormData, id_juego: e.target.value })}
                      className="retro-input w-full"
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
                        onChange={(e) => setGameFormData({ ...gameFormData, stock: parseInt(e.target.value) || 0 })}
                        className="retro-input w-full"
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
                        onChange={(e) => setGameFormData({ ...gameFormData, precio: parseFloat(e.target.value) || 0 })}
                        className="retro-input w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <button
                      type="submit"
                      className="retro-button w-full"
                      disabled={!gameFormData.id_juego}
                    >
                      {storeGames.has(gameFormData.id_juego) ? 'Actualizar' : 'Agregar'} Juego
                    </button>
                  </div>
                </div>
              </div>

              {selectedStore && Array.from(storeGames.entries()).length > 0 ? (
                <div className="mt-6 pt-4 border-t-2 border-gray-200">
                  <h3 className="font-press-start text-sm text-gray-800 mb-4">
                    <GameController className="h-4 w-4 mr-2 inline-block" />
                    Juegos en inventario ({storeGames.size})
                  </h3>
                  <div className="space-y-3">
                    {Array.from(storeGames.entries()).map(([gameId, gameData]) => {
                      const gameInfo = games.find(g => g.id_juego === gameId);
                      
                      return (
                        <div key={gameId} className="store-game-item">
                          <div className="flex-1">
                            <div className="store-game-name">{gameInfo?.nombre || 'Juego desconocido'}</div>
                            <div className="store-game-details mt-1">
                              <div className="store-game-detail">
                                <Package className="h-3 w-3 mr-1" />
                                Stock: {gameData.stock}
                              </div>
                              <div className="store-game-detail">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Precio: ${gameData.precio}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGame(gameId)}
                            className="store-action-button delete p-1 h-8 w-8 flex items-center justify-center"
                            aria-label="Eliminar juego"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : selectedStore ? (
                <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                  <GameController className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-press-start text-xs text-gray-500">
                    Esta tienda no tiene juegos en inventario
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Agrega juegos usando el formulario de arriba
                  </p>
                </div>
              ) : null}
            </form>
          </div>
        </Modal>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar dirección
                </label>
                <PlacesAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  defaultValue={`${formData.direccion.calle} ${formData.direccion.numero}, ${formData.direccion.ciudad}`}
                />
              </div>
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