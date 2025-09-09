import React, { useState, useEffect } from 'react';
import { monthlyReportService, MonthlyReportFilters, SavedReport } from '../services/monthlyReports';
import { Calendar, Download, FileText, BarChart3, TrendingUp, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MonthlyReportGeneratorProps {
  onClose?: () => void;
}

const MonthlyReportGenerator: React.FC<MonthlyReportGeneratorProps> = ({ onClose }) => {
  const { isAdmin, isClient } = useAuth();
  const [filters, setFilters] = useState<MonthlyReportFilters>({
    period: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    includeCharts: true
  });
  
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadSavedReports();
  }, []);


  const loadSavedReports = async () => {
    try {
      setIsLoading(true);
      const reports = await monthlyReportService.getSavedReports();
      setSavedReports(reports);
    } catch (err) {
      console.error('Error cargando reportes guardados:', err);
      setError('No se pudieron cargar los reportes guardados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      await monthlyReportService.generateAndDownloadMonthlyPDF(filters);
      
      // Recargar reportes guardados
      await loadSavedReports();
      
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('No se pudo generar el reporte. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      await monthlyReportService.downloadReportPDF(reportId);
    } catch (err) {
      console.error('Error descargando reporte:', err);
      setError('No se pudo descargar el reporte. Por favor, intenta nuevamente.');
    }
  };

  const handleFilterChange = (key: keyof MonthlyReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePeriodChange = (period: 'monthly' | 'quarterly' | 'semiannual' | 'annual') => {
    setFilters(prev => {
      const newFilters: MonthlyReportFilters = {
        ...prev,
        period,
        // Limpiar campos específicos del período anterior
        month: undefined,
        quarter: undefined,
        semester: undefined
      };

      // Establecer valores por defecto según el tipo de período
      switch (period) {
        case 'monthly':
          newFilters.month = new Date().getMonth() + 1;
          break;
        case 'quarterly':
          newFilters.quarter = Math.ceil((new Date().getMonth() + 1) / 3);
          break;
        case 'semiannual':
          newFilters.semester = new Date().getMonth() < 6 ? 1 : 2;
          break;
        case 'annual':
          // No necesita campos adicionales
          break;
      }

      return newFilters;
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Generador de Reportes Mensuales
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de generación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Configurar Reporte</h3>
          
          {/* Tipo de Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={filters.period}
              onChange={(e) => handlePeriodChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="semiannual">Semestral</option>
              <option value="annual">Anual</option>
            </select>
          </div>
          
          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Mes (solo para mensual) */}
          {filters.period === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                value={filters.month || 1}
                onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Trimestre (solo para trimestral) */}
          {filters.period === 'quarterly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trimestre
              </label>
              <select
                value={filters.quarter || 1}
                onChange={(e) => handleFilterChange('quarter', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Q1 (Ene-Mar)</option>
                <option value={2}>Q2 (Abr-Jun)</option>
                <option value={3}>Q3 (Jul-Sep)</option>
                <option value={4}>Q4 (Oct-Dic)</option>
              </select>
            </div>
          )}

          {/* Semestre (solo para semestral) */}
          {filters.period === 'semiannual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semestre
              </label>
              <select
                value={filters.semester || 1}
                onChange={(e) => handleFilterChange('semester', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Primer Semestre (Ene-Jun)</option>
                <option value={2}>Segundo Semestre (Jul-Dic)</option>
              </select>
            </div>
          )}


          {/* Incluir gráficos */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeCharts"
              checked={filters.includeCharts}
              onChange={(e) => handleFilterChange('includeCharts', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeCharts" className="ml-2 block text-sm text-gray-700">
              Incluir gráficos en el PDF
            </label>
          </div>

          {/* Botón de generación */}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generar y Descargar PDF
              </>
            )}
          </button>
        </div>

        {/* Reportes guardados */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-700">Reportes Guardados</h3>
              {isAdmin && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  <Shield className="w-3 h-3" />
                  Admin
                </div>
              )}
              {isClient && (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  <User className="w-3 h-3" />
                  Cliente
                </div>
              )}
            </div>
            <button
              onClick={loadSavedReports}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLoading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {savedReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay reportes guardados</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">
                          {report.parametros.period === 'monthly' && report.parametros.month ? 
                            `${getMonthName(report.parametros.month)} ${report.parametros.year}` :
                            report.parametros.period === 'quarterly' && report.parametros.quarter ?
                            `Q${report.parametros.quarter} ${report.parametros.year}` :
                            report.parametros.period === 'semiannual' && report.parametros.semester ?
                            `S${report.parametros.semester} ${report.parametros.year}` :
                            `Año ${report.parametros.year}`
                          }
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Generado: {formatDate(report.fecha_generacion)}
                      </div>
                      
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {report.parametros.includeCharts && (
                        <BarChart3 className="w-4 h-4 text-green-600" />
                      )}
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Información del Reporte</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• El reporte incluye métricas de actividades, tiendas, juegos y búsquedas</li>
          <li>• Se calculan automáticamente las tendencias de crecimiento</li>
          <li>• Los reportes se guardan automáticamente en la base de datos</li>
          <li>• Puedes filtrar por tienda, juego o categoría específica</li>
          {isAdmin && (
            <li className="text-blue-800 font-medium">• Como administrador, puedes ver todos los reportes generados</li>
          )}
          {isClient && (
            <li className="text-green-700 font-medium">• Como cliente, solo puedes ver tus propios reportes generados</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MonthlyReportGenerator;
