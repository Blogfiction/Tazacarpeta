import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReportAnalytics from '../components/ReportAnalytics';
import MonthlyReportGenerator from '../components/MonthlyReportGenerator';
import { DashboardMetrics } from '../services/analytics';
import { reportService, ReportOptions } from '../services/reports';
import toast from 'react-hot-toast';

export default function Reports() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'monthly'>('analytics');

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  if (!session) return null;

  const handleExportAnalyticsPDF = async (_data: DashboardMetrics) => {
    try {
      const options: ReportOptions = {
        type: 'dashboard',
        title: 'Reporte de Analíticas TCG Admin',
        includeCharts: true,
        filename: `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`
      };

      await reportService.downloadReport(options);
      toast.success('Reporte de analíticas exportado exitosamente');
    } catch (error) {
      console.error('Error exportando analíticas:', error);
      toast.error('Error al exportar el reporte de analíticas');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-press-start text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Reportes y Análisis
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Visualiza analíticas en tiempo real y genera reportes mensuales detallados.
          </p>
        </div>

        {/* Tabs de navegación */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analíticas en Tiempo Real
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'monthly'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Reportes Mensuales
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según tab activo */}
        {activeTab === 'monthly' ? (
          <div className="w-full">
            <MonthlyReportGenerator />
          </div>
        ) : (
          <div className="w-full">
            <ReportAnalytics onExportPDF={handleExportAnalyticsPDF} />
          </div>
        )}
      </div>
    </div>
  );
} 