import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, MapPin, Link as LinkIcon, Store, TowerControl as GameController, 
         Filter, ChevronDown, ChevronUp, ChevronRight, Clock, CheckCircle, XCircle, ArrowUp, ArrowDown,
         ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Activity, ActivityInput, Game, Store as StoreType } from '../types/database';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../services/activities';
import { getGames } from '../services/games';
import { getStores } from '../services/stores';
import Modal from '../components/Modal';
import LoadingScreen from '../components/LoadingScreen';
import PlacesAutocomplete from '../components/PlacesAutocomplete';

// Tipos de filtro para las actividades
type FilterType = 'all' | 'upcoming' | 'past';
type SortDirection = 'asc' | 'desc';
type SortField = 'fecha' | 'nombre';

const ITEMS_PER_PAGE = 5; // Define items per page

export default function ActivitiesAdmin() {
  const { session, user, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  
  // Estados para filtros y ordenamiento
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pastCurrentPage, setPastCurrentPage] = useState(1); // Separate page for past events when shown collapsed
  const [filteredCurrentPage, setFilteredCurrentPage] = useState(1); // Separate page for filtered view

  const [formData, setFormData] = useState<ActivityInput>({
    name_activity: '',
    date: '',
    adress_activity: '',
    reference_link: '',
    id_game: '',
    id_store: ''
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
      // Si es cliente, filtrar solo sus actividades y tiendas; si es admin, mostrar todas
      const userId = isClient ? user?.id : undefined;
      const [activitiesData, gamesData, storesData] = await Promise.all([
        getActivities(userId),
        getGames(), // Los juegos son compartidos para todos
        getStores(userId)
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
        // Si es cliente, verificar que la actividad pertenezca al usuario
        const userId = isClient ? user?.id : undefined;
        await updateActivity(currentActivity.id_activity, formData, userId);
      } else {
        // Al crear una nueva actividad, siempre se asigna al usuario logueado
        if (!user?.id) {
          throw new Error('Usuario no autenticado');
        }
        await createActivity(formData, user.id);
      }
      setIsModalOpen(false);
      loadData();
      resetForm();
    } catch (err) {
      setError('Error al guardar la actividad');
    }
  };

  // Ya no necesitamos esta función porque ahora es un input simple
  // const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
  //   if (place.place_id) {
  //     setFormData(prev => ({
  //       ...prev,
  //       adress_activity: place.formatted_address || ''
  //     }));
  //   }
  // };

  const openEditModal = (activity: Activity) => {
    setCurrentActivity(activity);
    setFormData({
      name_activity: activity.name_activity || '',
      date: new Date(activity.date).toISOString().slice(0, 16),
      adress_activity: activity.adress_activity || '',
      reference_link: activity.reference_link || '',
      id_store: activity.id_store,
      id_game: activity.id_game
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentActivity(null);
    setFormData({
      name_activity: '',
      date: '',
      adress_activity: '',
      reference_link: '',
      id_game: '',
      id_store: ''
    });
  };

  const validateForm = () => {
    if (!formData.name_activity || !formData.date || !formData.adress_activity) {
      return false;
    }
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;
    
    try {
      // Si es cliente, verificar que la actividad pertenezca al usuario
      const userId = isClient ? user?.id : undefined;
      await deleteActivity(id, userId);
      loadData();
    } catch (err) {
      setError('Error al eliminar la actividad');
    }
  };
  
  // Filtrar actividades
  const getFilteredAndSortedActivities = () => {
    const now = new Date();
    
    // Filtrar por tipo
    let filtered = [...activities];
    if (filterType === 'upcoming') {
      filtered = filtered.filter(activity => new Date(activity.date) >= now);
    } else if (filterType === 'past') {
      filtered = filtered.filter(activity => new Date(activity.date) < now);
    }
    
    // Ordenar las actividades
    return filtered.sort((a, b) => {
      if (sortField === 'fecha') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        // Ordenar por nombre
        return sortDirection === 'asc' 
          ? (a.name_activity || '').localeCompare(b.name_activity || '')
          : (b.name_activity || '').localeCompare(a.name_activity || '');
      }
    });
  };
  
  // Separar actividades futuras y pasadas
  const getUpcomingActivities = () => {
    const now = new Date();
    return activities.filter(activity => new Date(activity.date) >= now);
  };
  
  const getPastActivities = () => {
    const now = new Date();
    return activities.filter(activity => new Date(activity.date) < now);
  };
  
  // Toggle ordenamiento
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reset pagination when filters/sorting change
  useEffect(() => {
    setCurrentPage(1);
    setPastCurrentPage(1);
    setFilteredCurrentPage(1);
  }, [filterType, sortField, sortDirection]);

  if (!session) return null;
  
  const filteredActivitiesData = getFilteredAndSortedActivities();
  const upcomingActivitiesData = getUpcomingActivities().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastActivitiesData = getPastActivities().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const hasPastEvents = pastActivitiesData.length > 0;
  const hasUpcomingEvents = upcomingActivitiesData.length > 0;

  // --- Pagination Logic ---
  const calculatePaginatedItems = (items: Activity[], page: number) => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = items.slice(startIndex, endIndex);
    return { paginatedItems, totalPages, totalItems };
  };

  const { 
    paginatedItems: paginatedUpcoming, 
    totalPages: totalUpcomingPages,
    totalItems: totalUpcomingItems 
  } = calculatePaginatedItems(upcomingActivitiesData, currentPage);

  const { 
    paginatedItems: paginatedPast, 
    totalPages: totalPastPages,
    totalItems: totalPastItems 
  } = calculatePaginatedItems(pastActivitiesData, pastCurrentPage);
  
  const { 
    paginatedItems: paginatedFiltered, 
    totalPages: totalFilteredPages,
    totalItems: totalFilteredItems 
  } = calculatePaginatedItems(filteredActivitiesData, filteredCurrentPage);
  
  // --- Helper to render pagination controls ---
  const renderPaginationControls = (
    currentPageNum: number, 
    totalPagesNum: number, 
    setPage: (page: number | ((prev: number) => number)) => void,
    totalItemsNum: number
  ) => {
    if (totalPagesNum <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-4 px-4 py-2 border-t border-gray-200">
        <div></div>
        
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

        <div></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between mb-6 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-press-start text-gray-800 mr-4">Actividades</h1>
            <div className="relative inline-block">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="retro-button inline-flex items-center text-xs"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>Filtrar</span>
                {showFilterMenu ? 
                  <ChevronUp className="h-4 w-4 ml-1" /> : 
                  <ChevronDown className="h-4 w-4 ml-1" />
                }
              </button>
              
              {showFilterMenu && (
                <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                        filterType === 'all' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'
                      }`}
                    >
                      Todas las actividades
                    </button>
                    <button
                      onClick={() => {
                        setFilterType('upcoming');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                        filterType === 'upcoming' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Actividades futuras
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setFilterType('past');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                        filterType === 'past' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-gray-400" />
                        Actividades pasadas
                      </div>
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500">Ordenar por:</div>
                    <button
                      onClick={() => {
                        toggleSort('fecha');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-md flex items-center ${
                        sortField === 'fecha' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Fecha
                      {sortField === 'fecha' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-2" /> : 
                          <ArrowDown className="h-3 w-3 ml-2" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        toggleSort('nombre');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-md flex items-center ${
                        sortField === 'nombre' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">Aa</span>
                      Nombre
                      {sortField === 'nombre' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-2" /> : 
                          <ArrowDown className="h-3 w-3 ml-2" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
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
          <>
            {/* Mostrar filtros activos */}
            {filterType !== 'all' && (
              <div className="mb-4 flex">
                <div className="bg-gray-100 rounded-full px-3 py-1 text-xs flex items-center">
                  {filterType === 'upcoming' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      <span>Mostrando actividades futuras</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1 text-gray-500" />
                      <span>Mostrando actividades pasadas</span>
                    </>
                  )}
                  <button 
                    onClick={() => setFilterType('all')}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          
            {/* Si estamos filtrando, mostramos solo las actividades filtradas */}
            {filterType !== 'all' ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {paginatedFiltered.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay actividades que coincidan con el filtro seleccionado.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {paginatedFiltered.map((activity) => renderActivityItem(activity, filterType === 'past'))}
                  </ul>
                )}
                {/* Pagination for filtered view */}
                {renderPaginationControls(filteredCurrentPage, totalFilteredPages, setFilteredCurrentPage, totalFilteredItems)}
              </div>
            ) : (
              /* Si no hay filtro, mostramos futuras y pasadas por separado */
              <>
                {/* Actividades futuras */}
                {hasUpcomingEvents ? (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 font-press-start text-green-700 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Próximas Actividades ({upcomingActivitiesData.length})
                    </h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <ul className="divide-y divide-gray-200">
                        {paginatedUpcoming
                          .map((activity: Activity) => renderActivityItem(activity, false))}
                      </ul>
                      {/* Pagination for upcoming view */}
                      {renderPaginationControls(currentPage, totalUpcomingPages, setCurrentPage, totalUpcomingItems)}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-6 bg-white shadow sm:rounded-lg text-center">
                    <p className="text-gray-500">No hay actividades próximas programadas.</p>
                    <button
                      onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                      }}
                      className="mt-4 retro-button inline-flex items-center text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Crear Actividad</span>
                    </button>
                  </div>
                )}
                
                {/* Actividades pasadas - colapsable */}
                {hasPastEvents && (
                  <div className="mt-8">
                    <button 
                      onClick={() => setShowPastEvents(!showPastEvents)}
                      className="w-full text-left mb-3 flex items-center font-press-start text-gray-600"
                    >
                      {showPastEvents ? 
                        <ChevronDown className="h-5 w-5 mr-2" /> : 
                        <ChevronRight className="h-5 w-5 mr-2" />
                      }
                      <Clock className="h-5 w-5 mr-2" />
                      <h2 className="text-lg font-semibold">
                        Actividades Pasadas ({pastActivitiesData.length})
                      </h2>
                    </button>
                    
                    {showPastEvents && (
                      <div className="bg-white shadow overflow-hidden sm:rounded-lg opacity-75 hover:opacity-100 transition-opacity">
                        <ul className="divide-y divide-gray-200">
                          {paginatedPast
                            .map((activity: Activity) => renderActivityItem(activity, true))}
                        </ul>
                        {/* Pagination for past view */}
                        {renderPaginationControls(pastCurrentPage, totalPastPages, setPastCurrentPage, totalPastItems)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
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
                 value={formData.name_activity}
                 onChange={(e) => setFormData({ ...formData, name_activity: e.target.value })}
                 className="retro-input w-full"
                 placeholder="Nombre de la actividad"
                 required
               />
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Fecha y Hora
              </label>
                             <input
                 type="datetime-local"
                 value={formData.date}
                 onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                 className="retro-input w-full"
                 required
               />
            </div>

                                       <div>
                <label className="block font-press-start text-xs text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.adress_activity}
                  onChange={(e) => setFormData({ ...formData, adress_activity: e.target.value })}
                  className="retro-input w-full"
                  placeholder="Ingresa la ubicación"
                  required
                />
              </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Juego
              </label>
                             <select
                 value={formData.id_game}
                 onChange={(e) => setFormData({ ...formData, id_game: e.target.value })}
                 className="retro-input w-full"
               >
                 <option value="">Seleccionar juego</option>
                 {games.map((game) => (
                   <option key={game.id_game} value={game.id_game}>
                     {game.name}
                   </option>
                 ))}
               </select>
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Tienda
              </label>
                             <select
                 value={formData.id_store}
                 onChange={(e) => setFormData({ ...formData, id_store: e.target.value })}
                 className="retro-input w-full"
               >
                 <option value="">Seleccionar tienda</option>
                 {stores.map((store) => (
                   <option key={store.id_store} value={store.id_store}>
                     {store.name_store}
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
                value={formData.reference_link}
                onChange={(e) => setFormData({ ...formData, reference_link: e.target.value })}
                className="retro-input w-full"
                placeholder="https://ejemplo.com"
              />
            </div>

            <div className="flex justify-end space-x-3">
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
  
  // Función para renderizar un ítem de actividad
  function renderActivityItem(activity: Activity, isPast: boolean) {
    const game = games.find(g => g.id_game === activity.id_game);
    const store = stores.find(s => s.id_store === activity.id_store);
    const activityDate = new Date(activity.date);
    
    // Calcular si la actividad es hoy
    const today = new Date();
    const isToday = 
      activityDate.getDate() === today.getDate() &&
      activityDate.getMonth() === today.getMonth() &&
      activityDate.getFullYear() === today.getFullYear();
    
    // Formatear fecha para mostrar más linda
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const formattedDate = activityDate.toLocaleDateString('es-CL', options);
    
    return (
      <li key={activity.id_activity} className="mb-4">
        <div className={`event-card ${isPast ? 'past-event' : ''}`}>
          {/* Indicador de evento de hoy */}
          {isToday && !isPast && (
            <div className="event-today-badge">
              HOY
            </div>
          )}
          
          <h3 className="event-title">
            {activity.name_activity}
          </h3>
          
          <div className="event-detail">
            <Calendar className="event-detail-icon text-yellow-600" />
            <span className="event-detail-text">
              {formattedDate}
            </span>
          </div>
          
                     <div className="event-detail">
             <MapPin className="event-detail-icon text-red-600" />
             <a 
               href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.adress_activity || '')}`}
               target="_blank"
               rel="noopener noreferrer"
               className="event-detail-text hover:text-blue-600 transition-colors flex items-center"
             >
               {activity.adress_activity || 'Sin ubicación'}
               <LinkIcon className="w-3 h-3 ml-1 inline" />
             </a>
           </div>
          
          <div className="mt-3 flex flex-wrap">
            {game && (
              <div className="event-tag game-tag">
                <GameController className="h-3 w-3 mr-1" />
                {game.name}
              </div>
            )}
            
            {store && (
              <div className="event-tag store-tag">
                <Store className="h-3 w-3 mr-1" />
                {store.name_store}
              </div>
            )}
          </div>
          
          {activity.reference_link && (
            <div className="mt-2">
              <a
                                  href={activity.reference_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                Enlace de referencia
              </a>
            </div>
          )}
          
          <div className="event-actions">
            <button
              onClick={() => openEditModal(activity)}
              className="event-action-button edit"
              aria-label="Editar actividad"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(activity.id_activity)}
              className="event-action-button delete"
              aria-label="Eliminar actividad"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </li>
    );
  }
}