import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Gamepad2, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { analyticsService, ReportFilters, DashboardMetrics } from '../services/analytics';
import BarChart from './Charts/BarChart';
import LoadingScreen from './LoadingScreen';
import toast from 'react-hot-toast';

interface ReportAnalyticsProps {
  onExportPDF?: (data: DashboardMetrics) => void;
}

export default function ReportAnalytics({ onExportPDF }: ReportAnalyticsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Cargar métricas iniciales
  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboardMetrics(filters);
      setMetrics(data);
    } catch (err) {
      console.error('Error cargando métricas:', err);
      setError('Error al cargar las analíticas');
      toast.error('Error al cargar las analíticas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const handleExportPDF = () => {
    if (metrics && onExportPDF) {
      onExportPDF(metrics);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadMetrics}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros y exportación */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Analíticas de Reportes
          </h2>
          <p className="text-gray-600 mt-1">
            Métricas y tendencias del sistema TCG Admin
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleFilterChange({ 
                  dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.dateTo?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleFilterChange({ 
                  dateTo: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Búsquedas</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalSearches}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Actividades</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <Gamepad2 className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Inscripciones</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalInscriptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tiendas más visitadas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <BarChart
            data={metrics.topStores.map(store => ({
              name: store.name_store.length > 15 ? store.name_store.substring(0, 15) + '...' : store.name_store,
              value: store.visits,
              fullName: store.name_store
            }))}
            title="Tiendas Más Visitadas"
            xAxisKey="name"
            yAxisKey="value"
            height={300}
          />
        </div>

        {/* Juegos más clickeados */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <BarChart
            data={metrics.topGames.map(game => ({
              name: game.name.length > 15 ? game.name.substring(0, 15) + '...' : game.name,
              value: game.clicks,
              fullName: game.name
            }))}
            title="Juegos Más Clickeados"
            xAxisKey="name"
            yAxisKey="value"
            height={300}
          />
        </div>

        {/* Juegos más jugados en actividades */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <BarChart
            data={metrics.topPlayedGames.map(game => ({
              name: game.name.length > 15 ? game.name.substring(0, 15) + '...' : game.name,
              value: game.clicks,
              fullName: game.name
            }))}
            title="Juegos Más Jugados en Actividades"
            xAxisKey="name"
            yAxisKey="value"
            height={300}
          />
        </div>

        {/* Categorías de juego más participadas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <BarChart
            data={metrics.gameCategoryParticipation.map(category => ({
              name: category.category.length > 15 ? category.category.substring(0, 15) + '...' : category.category,
              value: category.participation_count,
              fullName: category.category
            }))}
            title="Categorías de Juego Más Participadas"
            xAxisKey="name"
            yAxisKey="value"
            height={300}
          />
        </div>
      </div>

      {/* Actividades más concurridas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Actividades Más Concurridas
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tienda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Juego
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscripciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.topActivities.map((activity) => (
                <tr key={activity.id_activity}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activity.name_activity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.store_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.game_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.inscriptions_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
