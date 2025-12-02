/**
 * Tipo de reporte a generar
 */
export type ReportType = 'activities' | 'stores' | 'games' | 'dashboard' | 'history' | 'searches' | 'users';

/**
 * Opciones para generar un reporte
 */
export interface ReportOptions {
  // Tipo de reporte a generar
  type: ReportType;
  
  // Título personalizado para el reporte
  title?: string;
  
  // Nombre del archivo a descargar
  filename?: string;
  
  // Filtro por fecha: desde
  dateFrom?: Date;
  
  // Filtro por fecha: hasta
  dateTo?: Date;
  
  // Filtros específicos (id_tienda, id_juego, etc)
  filters?: Record<string, any>;
  
  // Incluir gráficos en el reporte
  includeCharts?: boolean;
}

export interface ReportMetrics {
  totalActivities: number;
  upcomingActivities: number;
  pastActivities: number;
  totalStores: number;
  totalGames: number;
  activitiesByMonth: Record<string, number>;
  storesByRegion?: Record<string, number>;
  gamesByCategory?: Record<string, number>;
}

export interface DashboardData {
  activities: any[];
  stores: any[];
  games: any[];
  metrics: ReportMetrics;
}

