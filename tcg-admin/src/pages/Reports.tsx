import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BarChart2, TrendingUp, Activity, ChevronRight, Download, PieChart, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReportGenerator from '../components/ReportGenerator';

export default function Reports() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-press-start text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Reportes y Análisis
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Genera reportes personalizados y obtén análisis detallados de las actividades, tiendas y juegos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReportGenerator />
            
            <div className="mt-6 bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
              <h3 className="font-semibold text-gray-800 mb-2">
                Tip de reportes
              </h3>
              <p className="text-sm text-gray-600">
                Para obtener resultados más específicos, utiliza los filtros avanzados. 
                Puedes filtrar por fechas, tiendas y juegos específicos.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-blue-600" />
                Información de Reportes
              </h2>

              <div className="space-y-4 text-sm">
                <p>
                  Los reportes te permiten visualizar y analizar toda la información recopilada en la plataforma.
                </p>

                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Tipos de análisis disponibles
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-blue-700">
                    <li>Tendencias temporales de actividades</li>
                    <li>Distribución geográfica de tiendas</li>
                    <li>Popularidad de juegos</li>
                    <li>Estadísticas de inventario</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                  <h3 className="font-medium text-yellow-800 mb-2">Recomendaciones</h3>
                  <p className="text-yellow-700">
                    El dashboard general es ideal para obtener una visión rápida del estado actual del sistema.
                    Para análisis más detallados, utiliza los reportes específicos de cada categoría.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                Reportes Destacados
              </h2>

              <div className="space-y-3 text-sm">
                <div className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-start">
                    <PieChart className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        Dashboard General
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Visión general con todas las métricas importantes
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-start">
                    <Activity className="w-5 h-5 text-rose-500 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        Actividades por Mes
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Análisis temporal de las actividades organizadas
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-start">
                    <Database className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        Inventario de Juegos
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Catálogo completo con detalles por categoría
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-right">
                <button className="text-blue-600 hover:text-blue-800 flex items-center justify-end w-full">
                  <span>Ver todos los reportes</span>
                  <Download className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 rounded-lg shadow-md text-white">
              <h3 className="font-semibold mb-2 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-300" />
                Estadísticas Rápidas
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-md">
                  <p className="text-xs text-gray-300">Actividades</p>
                  <p className="text-xl font-bold">56</p>
                </div>
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-md">
                  <p className="text-xs text-gray-300">Tiendas</p>
                  <p className="text-xl font-bold">12</p>
                </div>
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-md">
                  <p className="text-xs text-gray-300">Juegos</p>
                  <p className="text-xl font-bold">28</p>
                </div>
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-md">
                  <p className="text-xs text-gray-300">Este mes</p>
                  <p className="text-xl font-bold">+8</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 