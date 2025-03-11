import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, ArrowLeft, Store, TowerControl as GameController } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Activity, Game, Store as StoreType } from '../types/database';
import { getActivity } from '../services/activities';
import { getGames } from '../services/games';
import { getStores } from '../services/stores';
import LoadingScreen from '../components/LoadingScreen';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [store, setStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    if (id) {
      loadActivity(id);
    }
  }, [id, session, navigate]);

  async function loadActivity(activityId: string) {
    try {
      setLoading(true);
      const data = await getActivity(activityId);
      
      if (data) {
        setActivity(data);
        
        // Cargar juego y tienda relacionados si existen
        if (data.id_juego) {
          const gamesData = await getGames();
          const gameData = gamesData.find(g => g.id_juego === data.id_juego);
          if (gameData) setGame(gameData);
        }
        
        if (data.id_tienda) {
          const storesData = await getStores();
          const storeData = storesData.find(s => s.id_tienda === data.id_tienda);
          if (storeData) setStore(storeData);
        }
      }
    } catch (err) {
      setError('Error al cargar la actividad');
    } finally {
      setLoading(false);
    }
  }

  const isPastEvent = (activity: Activity) => {
    const eventDate = new Date(activity.fecha);
    const now = new Date();
    return eventDate < now;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!session) return null;

  // Comprobar si el evento es hoy
  const isToday = activity ? (() => {
    const activityDate = new Date(activity.fecha);
    const today = new Date();
    return (
      activityDate.getDate() === today.getDate() &&
      activityDate.getMonth() === today.getMonth() &&
      activityDate.getFullYear() === today.getFullYear()
    );
  })() : false;

  // Comprobar si el evento ya pasó
  const isPast = activity ? isPastEvent(activity) : false;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="retro-button mb-6 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-press-start text-xs">Volver</span>
        </button>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg border-2 border-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingScreen />
        ) : activity ? (
          <div className={`event-card ${isPast ? 'past-event' : ''} max-w-2xl mx-auto`}>
            {isToday && !isPast && (
              <div className="event-today-badge">
                HOY
              </div>
            )}
            
            <h1 className="event-title text-xl">
              {activity.nombre}
            </h1>

            <div className="mb-6">
              <div className="event-detail">
                <Calendar className="event-detail-icon text-yellow-600" />
                <span className="event-detail-text">
                  {formatDate(activity.fecha)}
                </span>
              </div>

              <div className="event-detail">
                <MapPin className="event-detail-icon text-red-600" />
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.ubicacion)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-detail-text hover:text-blue-600 transition-colors flex items-center"
                >
                  {activity.ubicacion}
                  <LinkIcon className="w-3 h-3 ml-1 inline" />
                </a>
              </div>
              
              <div className="mt-6 flex flex-wrap">
                {game && (
                  <div className="event-tag game-tag">
                    <GameController className="h-3 w-3 mr-1" />
                    {game.nombre}
                  </div>
                )}
                
                {store && (
                  <div className="event-tag store-tag">
                    <Store className="h-3 w-3 mr-1" />
                    {store.nombre}
                  </div>
                )}
              </div>

              {activity.enlace_referencia && (
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <h3 className="font-press-start text-sm mb-2">Enlaces</h3>
                  <a
                    href={activity.enlace_referencia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="retro-button text-xs flex items-center justify-center w-full"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Abrir enlace de referencia
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6 pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => navigate('/activities')}
                className="retro-button text-xs"
              >
                Ver todas las actividades
              </button>
              <button
                onClick={() => navigate(`/activities?edit=${activity.id_actividad}`)}
                className="retro-button bg-blue-600 text-xs"
              >
                Editar actividad
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-press-start text-sm text-gray-600">
              Actividad no encontrada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}