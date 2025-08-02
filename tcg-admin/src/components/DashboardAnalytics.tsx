import { useState, useEffect } from 'react';
import { BarChart3, Users, MapPin, TowerControl as GameController, Trophy, Clock } from 'lucide-react';
import type { Activity, Game, Store, UserActivityStats } from '../types/database';
import { getTopActiveUsers } from '../services/users';

interface DashboardAnalyticsProps {
  activities: Activity[];
  games: Game[];
  stores: Store[];
}

export default function DashboardAnalytics({ activities, games, stores }: DashboardAnalyticsProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [topUsers, setTopUsers] = useState<Array<{ profile: any; count: number }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [filters, setFilters] = useState({
    game: '',
    timeSlot: 'all',
    location: ''
  });

  useEffect(() => {
    loadTopUsers();
  }, []);

  async function loadTopUsers() {
    try {
      const data = await getTopActiveUsers();
      setTopUsers(data);
    } catch (error) {
      console.error('Error loading top users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }

  const getTimeSlot = (date: Date) => {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getActivityStats = () => {
    const now = new Date();
    const filteredActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      
      // Date range filter
      if (dateRange === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (activityDate < monthAgo) return false;
      } else if (dateRange === 'year') {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        if (activityDate < yearAgo) return false;
      }

      // Game filter
      if (filters.game && activity.id_game !== filters.game) return false;

      // Time slot filter
      if (filters.timeSlot !== 'all') {
        const timeSlot = getTimeSlot(activityDate);
        if (timeSlot !== filters.timeSlot) return false;
      }

      // Location filter
      if (filters.location) {
        const store = stores.find(s => s.id_store === activity.id_store);
        if (!store || store.adress !== filters.location) return false;
      }

      return true;
    });

    const total = filteredActivities.length;
    const upcoming = filteredActivities.filter(activity => new Date(activity.date) > now).length;

    // Group by game
    const byGame = filteredActivities.reduce((acc, activity) => {
      if (activity.id_game) {
        acc[activity.id_game] = (acc[activity.id_game] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Group by store
    const byStore = filteredActivities.reduce((acc, activity) => {
      if (activity.id_store) {
        acc[activity.id_store] = (acc[activity.id_store] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, upcoming, byGame, byStore };
  };

  const stats = getActivityStats();
  const topGames = Object.entries(stats.byGame)
    .map(([id, count]) => ({
      game: games.find(g => g.id_game === id),
      count
    }))
    .filter(item => item.game)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topStores = Object.entries(stats.byStore)
    .map(([id, count]) => ({
      store: stores.find(s => s.id_store === id),
      count
    }))
    .filter(item => item.store)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Get unique locations from stores - using adress instead of direccion.comuna_region
  const locations = Array.from(new Set(stores.map(store => store.adress))).filter(Boolean);

  return (
    <div className="retro-container bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="font-press-start text-sm sm:text-base text-gray-800">
          Análisis de Actividades
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="retro-input text-xs py-1"
          >
            <option value="month">Este Mes</option>
            <option value="year">Este Año</option>
            <option value="all">Todo</option>
          </select>

          <select
            value={filters.game}
            onChange={(e) => setFilters(prev => ({ ...prev, game: e.target.value }))}
            className="retro-input text-xs py-1"
          >
            <option value="">Todos los juegos</option>
            {games.map(game => (
              <option key={game.id_game} value={game.id_game}>
                {game.name}
              </option>
            ))}
          </select>

          <select
            value={filters.timeSlot}
            onChange={(e) => setFilters(prev => ({ ...prev, timeSlot: e.target.value }))}
            className="retro-input text-xs py-1"
          >
            <option value="all">Cualquier hora</option>
            <option value="morning">Mañana (antes de 12:00)</option>
            <option value="afternoon">Tarde (12:00 - 17:00)</option>
            <option value="evening">Noche (después de 17:00)</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="retro-input text-xs py-1"
          >
            <option value="">Todas las comunas</option>
            {locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="retro-container bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Actividades</p>
              <p className="font-press-start text-lg text-gray-800 mt-1">{stats.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="retro-container bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Próximas</p>
              <p className="font-press-start text-lg text-gray-800 mt-1">{stats.upcoming}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="retro-container bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Juegos Activos</p>
              <p className="font-press-start text-lg text-gray-800 mt-1">
                {Object.keys(stats.byGame).length}
              </p>
            </div>
            <GameController className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="retro-container bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Tiendas Activas</p>
              <p className="font-press-start text-lg text-gray-800 mt-1">
                {Object.keys(stats.byStore).length}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="font-press-start text-xs text-gray-800 mb-4">
            Top Juegos
          </h3>
          <div className="space-y-3">
            {topGames.map(({ game, count }) => (
              <div key={game?.id_game} className="flex items-center justify-between">
                <div className="flex items-center">
                  <GameController className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-700">{game?.name}</span>
                </div>
                <span className="text-sm font-press-start text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="retro-container bg-gray-50 p-4">
            <h3 className="font-press-start text-sm text-gray-800 mb-3">Tiendas Más Activas</h3>
            <div className="space-y-3">
              {topStores.map(({ store, count }) => (
                <div key={store?.id_store} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm text-gray-700">{store?.name_store}</span>
                  </div>
                  <span className="text-sm font-press-start text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

        <div>
          <h3 className="font-press-start text-xs text-gray-800 mb-4">
            Top Usuarios
          </h3>
          <div className="space-y-3">
            {loadingUsers ? (
              <p className="text-sm text-gray-500">Cargando usuarios...</p>
            ) : (
              topUsers.map(({ profile, count }, index) => (
                <div key={profile.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className={`w-4 h-4 mr-2 ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-600' :
                      'text-blue-600'
                    }`} />
                    <span className="text-sm text-gray-700">
                      {profile.nombre || profile.email}
                    </span>
                  </div>
                  <span className="font-press-start text-xs text-gray-600">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}