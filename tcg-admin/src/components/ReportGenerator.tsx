import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Calendar, Store, TowerControl as GameController, AlertCircle } from 'lucide-react';
import { reportService, ReportType, ReportOptions } from '../services/reports';
import { getStores } from '../services/stores';
import { getGames } from '../services/games';
import toast from 'react-hot-toast';

/**
 * Opciones avanzadas para generar reportes
 */
interface AdvancedOptions {
  // Título personalizado
  title: string;
  
  // Filtro por fecha desde
  dateFrom: string;
  
  // Filtro por fecha hasta
  dateTo: string;
  
  // ID de tienda a filtrar (opcional)
  storeId: string;
  
  // ID de juego a filtrar (opcional)
  gameId: string;
  
  // Incluir gráficos
  includeCharts: boolean;
}

/**
 * Componente para generar reportes en PDF
 */
export default function ReportGenerator() {
  // Estado para el tipo de reporte
  const [reportType, setReportType] = useState<ReportType>('dashboard');
  
  // Estado para mostrar/ocultar opciones avanzadas
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Estado para las opciones avanzadas
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    title: '',
    dateFrom: '',
    dateTo: '',
    storeId: '',
    gameId: '',
    includeCharts: true
  });
  
  // Estado para el progreso de generación
  const [generating, setGenerating] = useState(false);
  
  // Estado para almacenar tiendas y juegos para el selector
  const [stores, setStores] = useState<{ id: string; nombre: string }[]>([]);
  const [games, setGames] = useState<{ id: string; nombre: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Cargar tiendas y juegos al montar el componente
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        setLoadingOptions(true);
        const [storesData, gamesData] = await Promise.all([
          getStores(),
          getGames()
        ]);
        
        setStores(storesData.map(store => ({ 
          id: store.id_store, 
          nombre: store.name_store 
        })));
        
        setGames(gamesData.map(game => ({ 
          id: game.id_game, 
          nombre: game.name 
        })));
      } catch (error) {
        console.error('Error al cargar opciones de filtro:', error);
        toast.error('No se pudieron cargar todas las opciones de filtro');
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadFiltersData();
  }, []);
  
  /**
   * Maneja el cambio en las opciones avanzadas
   */
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Para checkboxes, usamos el checked en lugar del value
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setAdvancedOptions({
        ...advancedOptions,
        [name]: target.checked
      });
    } else {
      setAdvancedOptions({
        ...advancedOptions,
        [name]: value
      });
    }
  };
  
  /**
   * Valida y corrige los filtros según el tipo de reporte
   */
  const getValidFilters = (type: ReportType): Record<string, any> => {
    const filters: Record<string, any> = {};
    
    // Solo aplicar filtros específicos por tipo de reporte
    if (type === 'activities' || type === 'dashboard') {
      if (advancedOptions.storeId) {
        filters.id_tienda = advancedOptions.storeId;
      }
      
      if (advancedOptions.gameId) {
        filters.id_juego = advancedOptions.gameId;
      }
    } else if (type === 'stores') {
      if (advancedOptions.storeId) {
        filters.id_tienda = advancedOptions.storeId;
      }
    } else if (type === 'games') {
      if (advancedOptions.gameId) {
        filters.id_juego = advancedOptions.gameId;
      }
    }
    
    return filters;
  };
  
  /**
   * Genera y descarga el reporte
   */
  const generateReport = async () => {
    try {
      setGenerating(true);
      
      // Validar que no haya fechas incoherentes
      if (advancedOptions.dateFrom && advancedOptions.dateTo) {
        const dateFrom = new Date(advancedOptions.dateFrom);
        const dateTo = new Date(advancedOptions.dateTo);
        
        if (dateFrom > dateTo) {
          toast.error('La fecha "desde" debe ser anterior a la fecha "hasta"');
          setGenerating(false);
          return;
        }
      }
      
      // Crear opciones para el reporte
      const options: ReportOptions = {
        type: reportType,
        includeCharts: advancedOptions.includeCharts
      };
      
      // Agregar título personalizado si es necesario
      if (advancedOptions.title) {
        options.title = advancedOptions.title;
      }
      
      // Agregar filtros de fecha si son especificados
      if (advancedOptions.dateFrom) {
        options.dateFrom = new Date(advancedOptions.dateFrom);
      }
      
      if (advancedOptions.dateTo) {
        options.dateTo = new Date(advancedOptions.dateTo);
      }
      
      // Agregar filtros específicos
      const filters = getValidFilters(reportType);
      if (Object.keys(filters).length > 0) {
        options.filters = filters;
      }
      
      // Generar nombre descriptivo para el archivo
      const date = new Date().toISOString().slice(0, 10);
      let filename = `${reportType}-report-${date}`;
      
      if (advancedOptions.storeId && stores.length > 0) {
        const storeName = stores.find(s => s.id === advancedOptions.storeId)?.nombre;
        if (storeName) {
          filename += `-${storeName.toLowerCase().replace(/\s+/g, '-')}`;
        }
      }
      
      if (advancedOptions.gameId && games.length > 0) {
        const gameName = games.find(g => g.id === advancedOptions.gameId)?.nombre;
        if (gameName) {
          filename += `-${gameName.toLowerCase().replace(/\s+/g, '-')}`;
        }
      }
      
      options.filename = `${filename}.pdf`;
      
      // Generar y descargar el reporte
      await reportService.downloadReport(options);
      
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      toast.error('Error al generar el reporte. Intenta nuevamente.');
    } finally {
      setGenerating(false);
    }
  };
  
  /**
   * Resetea los filtros a valores por defecto
   */
  const resetFilters = () => {
    setAdvancedOptions({
      title: '',
      dateFrom: '',
      dateTo: '',
      storeId: '',
      gameId: '',
      includeCharts: true
    });
  };
  
  /**
   * Determina si mostrar el filtro de tiendas según el tipo de reporte
   */
  const showStoreFilter = () => {
    return reportType === 'dashboard' || reportType === 'activities' || reportType === 'stores';
  };
  
  /**
   * Determina si mostrar el filtro de juegos según el tipo de reporte
   */
  const showGameFilter = () => {
    return reportType === 'dashboard' || reportType === 'activities' || reportType === 'games';
  };
  
  return (
    <div className="report-generator bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Generador de Reportes
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Selecciona el tipo de reporte que deseas generar y descárgalo en formato PDF.
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Reporte
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            className={`p-4 text-left rounded-lg border ${
              reportType === 'dashboard'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setReportType('dashboard')}
          >
            <div className="font-medium">Dashboard General</div>
            <div className="text-xs text-gray-500 mt-1">
              Resumen ejecutivo con KPIs principales
            </div>
          </button>
          
          <button
            type="button"
            className={`p-4 text-left rounded-lg border ${
              reportType === 'activities'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setReportType('activities')}
          >
            <div className="font-medium">Actividades</div>
            <div className="text-xs text-gray-500 mt-1">
              Datos de todas las actividades registradas
            </div>
          </button>
          
          <button
            type="button"
            className={`p-4 text-left rounded-lg border ${
              reportType === 'stores'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setReportType('stores')}
          >
            <div className="font-medium">Tiendas</div>
            <div className="text-xs text-gray-500 mt-1">
              Información detallada de tiendas
            </div>
          </button>
          
          <button
            type="button"
            className={`p-4 text-left rounded-lg border ${
              reportType === 'games'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setReportType('games')}
          >
            <div className="font-medium">Juegos</div>
            <div className="text-xs text-gray-500 mt-1">
              Catálogo completo de juegos
            </div>
          </button>
          
          <button
            type="button"
            className={`p-4 text-left rounded-lg border ${
              reportType === 'history'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setReportType('history')}
          >
            <div className="font-medium">Historial</div>
            <div className="text-xs text-gray-500 mt-1">
              Registro de actividades realizadas
            </div>
          </button>
          
          <button
            type="button"
            className={`p-4 text-left rounded-lg border ${
              reportType === 'searches'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setReportType('searches')}
          >
            <div className="font-medium">Búsquedas</div>
            <div className="text-xs text-gray-500 mt-1">
              Análisis de términos buscados
            </div>
          </button>
          
          <button
            type="button"
            className={`p-4 text-left rounded-lg border ${
              reportType === 'users'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setReportType('users')}
          >
            <div className="font-medium">Usuarios</div>
            <div className="text-xs text-gray-500 mt-1">
              Información de usuarios registrados
            </div>
          </button>
        </div>
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-gray-600 flex items-center"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <Filter className="w-4 h-4 mr-1" />
          {showAdvancedOptions ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
        </button>
        
        {showAdvancedOptions && (
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-blue-600"
            onClick={resetFilters}
          >
            Limpiar filtros
          </button>
        )}
      </div>
      
      {showAdvancedOptions && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4 border border-gray-200">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título Personalizado
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={advancedOptions.title}
              onChange={handleOptionChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Deja en blanco para usar el título por defecto"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Desde
              </label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={advancedOptions.dateFrom}
                onChange={handleOptionChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Hasta
              </label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={advancedOptions.dateTo}
                onChange={handleOptionChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          {showStoreFilter() && (
            <div>
              <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">
                <Store className="w-4 h-4 inline mr-1" />
                Filtrar por Tienda
              </label>
              <select
                id="storeId"
                name="storeId"
                value={advancedOptions.storeId}
                onChange={handleOptionChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loadingOptions}
              >
                <option value="">Todas las tiendas</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {showGameFilter() && (
            <div>
              <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
                <GameController className="w-4 h-4 inline mr-1" />
                Filtrar por Juego
              </label>
              <select
                id="gameId"
                name="gameId"
                value={advancedOptions.gameId}
                onChange={handleOptionChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loadingOptions}
              >
                <option value="">Todos los juegos</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeCharts"
                checked={advancedOptions.includeCharts}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                onChange={(e) => {
                  // Para checkboxes, usamos el checked en lugar del value
                  const target = e.target as HTMLInputElement;
                  setAdvancedOptions({
                    ...advancedOptions,
                    includeCharts: target.checked
                  });
                }}
              />
              <span className="ml-2 text-sm text-gray-700">Incluir gráficos y análisis visuales</span>
            </label>
          </div>
          
          {advancedOptions.dateFrom && advancedOptions.dateTo && new Date(advancedOptions.dateFrom) > new Date(advancedOptions.dateTo) && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    La fecha "desde" debe ser anterior a la fecha "hasta".
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={generateReport}
          disabled={generating || (advancedOptions.dateFrom !== '' && advancedOptions.dateTo !== '' && new Date(advancedOptions.dateFrom) > new Date(advancedOptions.dateTo))}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
        >
          {generating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generar y Descargar
            </>
          )}
        </button>
      </div>
    </div>
  );
} 