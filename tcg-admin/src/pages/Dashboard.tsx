import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import EventList from '../components/EventList';
import DashboardAnalytics from '../components/DashboardAnalytics';
import LoadingScreen from '../components/LoadingScreen';
import { getActivities } from '../services/activities';
import { getGames } from '../services/games';
import { getStores } from '../services/stores';
import type { Activity, Game, Store } from '../types/database';

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleNewEvent = () => {
    navigate('/activities');
  };

  const handleEventClick = (event: Activity) => {
    navigate(`/activities/${event.id_activity}`);
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="retro-container mb-4 bg-red-100">
            <p className="font-press-start text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="retro-container bg-white">
              <h2 className="font-press-start text-sm sm:text-base text-gray-800 mb-4">
                Próximas Actividades
              </h2>
              <EventList
                events={activities.filter(activity => new Date(activity.date) >= new Date())
                                 .sort((a, b) => new Date(activity.date).getTime() - new Date(activity.date).getTime())}
                onEventClick={handleEventClick}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <Calendar
              events={activities}
              games={games}
              stores={stores}
              onEventClick={handleEventClick}
            />
          </div>
        </div>

        <DashboardAnalytics 
          activities={activities}
          games={games}
          stores={stores}
        />
      </main>
    </div>
  );
}