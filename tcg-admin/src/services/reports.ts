import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Activity, Store, Game, StoreGame } from '../types/database';
import { getActivities as realGetActivities } from './activities';
import { getStores as realGetStores } from './stores';
import { getGames as realGetGames, getStoreGames as realGetStoreGames } from './games';
import { format as formatDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { isDevModeActive } from '../lib/devModeUtils';
import { 
  createFakeActivities, createFakeStores, createFakeGames, 
  createFakeStoreInventory, createFakeStoreGame 
} from '../lib/fakeData';
import { faker } from '@faker-js/faker/locale/es_MX';
import { supabase } from '../lib/supabaseClient';

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

interface ReportMetrics {
  totalActivities: number;
  upcomingActivities: number;
  pastActivities: number;
  totalStores: number;
  totalGames: number;
  activitiesByMonth: Record<string, number>;
  storesByRegion?: Record<string, number>;
  gamesByCategory?: Record<string, number>;
}

interface DashboardData {
  activities: Activity[];
  stores: Store[];
  games: Game[];
  metrics: ReportMetrics;
}

/**
 * Servicio para generar reportes en PDF
 */
class ReportService {
  /** Constantes de layout para PDF ordenados (márgenes y zonas) */
  private readonly MARGIN = 20;
  private readonly PAGE_WIDTH = 210;
  private readonly PAGE_HEIGHT = 297;
  private readonly HEADER_START_Y = 45;
  private readonly FOOTER_Y = 285; // PAGE_HEIGHT - 12

  /**
   * FAKE DATA HELPERS
   */
  private FAKE_STORES: Store[] = [];
  private FAKE_GAMES: Game[] = [];
  private FAKE_ACTIVITIES: Activity[] = [];
  private FAKE_STORE_INVENTORY: Record<string, StoreGame[]> = {};

  private initializeFakeData() {
    if (this.FAKE_STORES.length === 0) {
      this.FAKE_STORES = createFakeStores(10);
    }
    if (this.FAKE_GAMES.length === 0) {
      this.FAKE_GAMES = createFakeGames(25);
    }
    if (this.FAKE_ACTIVITIES.length === 0) {
      this.FAKE_ACTIVITIES = createFakeActivities(50, this.FAKE_STORES, this.FAKE_GAMES);
    }
    if (Object.keys(this.FAKE_STORE_INVENTORY).length === 0) {
      this.FAKE_STORES.forEach(store => {
        const inventoryGames = this.FAKE_GAMES.filter(() => Math.random() > 0.3); // ~70% of games in inventory
        this.FAKE_STORE_INVENTORY[store.id_store] = inventoryGames.map(game => 
            createFakeStoreGame(store.id_store, game.id_game, { 
                precio: parseFloat(faker.commerce.price({ min: 5000, max: 50000, dec: 0 }))
            })
        );
      });
    }
  }
  
  private async getActivities(): Promise<Activity[]> {
    if (isDevModeActive()) {
        this.initializeFakeData();
        console.log('ReportService: Dev Mode - Using fake activities for report');
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
        return [...this.FAKE_ACTIVITIES]; // Return a copy
    }
    return realGetActivities();
  }

  private async getStores(): Promise<Store[]> {
    if (isDevModeActive()) {
        this.initializeFakeData();
        console.log('ReportService: Dev Mode - Using fake stores for report');
        await new Promise(resolve => setTimeout(resolve, 50));
        return [...this.FAKE_STORES]; // Return a copy
    }
    return realGetStores();
  }

  private async getGames(): Promise<Game[]> {
    if (isDevModeActive()) {
        this.initializeFakeData();
        console.log('ReportService: Dev Mode - Using fake games for report');
        await new Promise(resolve => setTimeout(resolve, 50));
        return [...this.FAKE_GAMES]; // Return a copy
    }
    return realGetGames();
  }

  private async getStoreGames(storeId: string): Promise<StoreGame[]> {
    if (isDevModeActive()) {
        this.initializeFakeData();
        console.log(`ReportService: Dev Mode - Using fake inventory for store ${storeId}`);
        await new Promise(resolve => setTimeout(resolve, 30));
        return this.FAKE_STORE_INVENTORY[storeId] || [];
    }
    return realGetStoreGames(storeId);
  }

  /**
   * Genera un reporte en PDF basado en las opciones proporcionadas
   */
  async generateReport(options: ReportOptions): Promise<Blob> {
    try {
      console.log('Iniciando generación de reporte:', options);
      
      // Cargar los datos según el tipo de reporte
      const data = await this.fetchData(options);
      console.log('Datos obtenidos para el reporte:', data);
      
      // Crear el documento PDF
      const doc = new jsPDF();
      
      // Añadir título y metadatos
      const title = options.title || this.getDefaultTitle(options.type);
      const now = new Date();
      const formattedDate = this.formatDateString(now, 'dd/MM/yyyy');
      
      // Configurar metadatos del documento
      doc.setProperties({
        title: title,
        subject: 'TCG Admin Report',
        author: 'TCG Admin',
        creator: 'TCG Admin System'
      });
      
      // Añadir cabecera (usando constantes de layout)
      doc.setFontSize(18);
      doc.text(title, this.MARGIN, 22);
      
      doc.setFontSize(10);
      doc.text(`Generado el: ${formattedDate}`, this.MARGIN, 32);
      
      // Añadir contenido según el tipo de reporte
      await this.addReportContent(doc, options, data);
      
      // Añadir pie de página en todas las hojas
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount} - TCG Admin`, this.MARGIN, this.FOOTER_Y);
      }
      
      // Exportar como blob
      const pdfBlob = doc.output('blob');
      console.log('PDF generado exitosamente, tamaño:', pdfBlob.size);
      return pdfBlob;
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      console.error('Opciones del reporte:', options);
      throw new Error(`No se pudo generar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
  
  /**
   * Descarga un reporte como archivo PDF
   */
  async downloadReport(options: ReportOptions): Promise<void> {
    try {
      const blob = await this.generateReport(options);
      // Verificar que el blob es válido y tiene un tamaño
      if (!blob || blob.size === 0) {
        throw new Error('El reporte generado está vacío');
      }
      
      const filename = options.filename || `${options.type}-report-${this.formatDateString(new Date(), 'yyyy-MM-dd')}.pdf`;
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error al descargar el reporte:', error);
      let errorMessage = 'No se pudo descargar el reporte';
      
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('network')) {
          errorMessage = 'Error de red al generar el reporte. Verifica tu conexión.';
        } else if (error.message.includes('empty') || error.message.includes('vacío')) {
          errorMessage = 'El reporte generado está vacío. No hay datos suficientes.';
        }
      }
      
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Obtiene un título por defecto según el tipo de reporte
   */
  private getDefaultTitle(type: ReportType): string {
    switch (type) {
      case 'activities':
        return 'Reporte de Actividades';
      case 'stores':
        return 'Reporte de Tiendas';
      case 'games':
        return 'Reporte de Juegos';
      case 'dashboard':
        return 'Dashboard General';
      case 'history':
        return 'Reporte de Historial de Actividades';
      case 'searches':
        return 'Reporte de Búsquedas';
      case 'users':
        return 'Reporte de Usuarios';
      default:
        return 'Reporte TCG Admin';
    }
  }
  
  /**
   * Obtiene los datos necesarios para el reporte
   */
  private async fetchData(options: ReportOptions): Promise<any> {
    try {
      switch (options.type) {
        case 'activities':
          return this.fetchActivitiesData(options);
        case 'stores':
          return this.fetchStoresData(options);
        case 'games':
          return this.fetchGamesData(options);
        case 'dashboard':
          return this.fetchDashboardData(options);
        case 'history':
          return this.fetchHistoryData(options);
        case 'searches':
          return this.fetchSearchesData(options);
        case 'users':
          return this.fetchUsersData(options);
        default:
          throw new Error('Tipo de reporte no soportado');
      }
    } catch (error) {
      console.error(`Error al obtener datos para el reporte ${options.type}:`, error);
      throw new Error(`No se pudieron cargar los datos para el reporte ${options.type}`);
    }
  }
  
  /**
   * Obtiene datos de actividades con filtros aplicados
   */
  private async fetchActivitiesData(options: ReportOptions): Promise<Activity[]> {
    let activities = await this.getActivities();
    
    // Aplicar filtros
    if (options.dateFrom || options.dateTo || options.filters) {
      activities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        
        // Filtro por fecha desde
        if (options.dateFrom && activityDate < options.dateFrom) {
          return false;
        }
        
        // Filtro por fecha hasta
        if (options.dateTo && activityDate > options.dateTo) {
          return false;
        }
        
        // Filtros específicos
        if (options.filters) {
          for (const [key, value] of Object.entries(options.filters)) {
            if (activity[key as keyof Activity] !== value) {
              return false;
            }
          }
        }
        
        return true;
      });
    }
    
    // Ordenar por fecha
    return activities.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }
  
  /**
   * Obtiene datos de tiendas con filtros aplicados
   */
  private async fetchStoresData(options: ReportOptions): Promise<Store[]> {
    let stores = await this.getStores();
    
    // Aplicar filtros específicos
    if (options.filters) {
      stores = stores.filter(store => {
        for (const [key, value] of Object.entries(options.filters || {})) {
          if (store[key as keyof Store] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Ordenar por nombre
    return stores.sort((a, b) => a.name_store.localeCompare(b.name_store));
  }
  
  /**
   * Obtiene datos de juegos con filtros aplicados
   */
  private async fetchGamesData(options: ReportOptions): Promise<Game[]> {
    let games = await this.getGames();
    
    // Aplicar filtros específicos
    if (options.filters) {
      games = games.filter(game => {
        for (const [key, value] of Object.entries(options.filters || {})) {
          if (game[key as keyof Game] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Ordenar por nombre
    return games.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  /**
   * Obtiene datos para el dashboard
   */
  private async fetchDashboardData(options: ReportOptions): Promise<DashboardData> {
    try {
      // Para el dashboard, necesitamos datos de todas las entidades
      const activitiesOptions: ReportOptions = { ...options };
      activitiesOptions.type = 'activities';
      
      const storesOptions: ReportOptions = { ...options };
      storesOptions.type = 'stores';
      
      const gamesOptions: ReportOptions = { ...options };
      gamesOptions.type = 'games';
      
      const [activities, stores, games] = await Promise.all([
        this.fetchActivitiesData(activitiesOptions),
        this.fetchStoresData(storesOptions),
        this.fetchGamesData(gamesOptions)
      ]);
      
      // Calcular métricas clave
      const now = new Date();
      const upcomingActivities = activities.filter(a => new Date(a.date) > now);
      const pastActivities = activities.filter(a => new Date(a.date) <= now);
      
      // Agrupar actividades por mes
      const activitiesByMonth = this.groupActivitiesByMonth(activities);
      
      // Agrupar tiendas por región
      const storesByRegion: Record<string, number> = {};
      stores.forEach(store => {
        const region = 'Región General'; // Placeholder since region is not in Store interface
        if (!storesByRegion[region]) {
          storesByRegion[region] = 0;
        }
        storesByRegion[region]++;
      });
      
      // Agrupar juegos por categoría
      const gamesByCategory: Record<string, number> = {};
      games.forEach(game => {
        const category = game.category || 'Sin categoría';
        if (!gamesByCategory[category]) {
          gamesByCategory[category] = 0;
        }
        gamesByCategory[category]++;
      });
      
      return {
        activities,
        stores,
        games,
        metrics: {
          totalActivities: activities.length,
          upcomingActivities: upcomingActivities.length,
          pastActivities: pastActivities.length,
          totalStores: stores.length,
          totalGames: games.length,
          activitiesByMonth,
          storesByRegion,
          gamesByCategory
        }
      };
    } catch (error) {
      console.error('Error al obtener datos para el dashboard:', error);
      throw new Error('No se pudieron cargar los datos para el dashboard');
    }
  }
  
  /**
   * Agrupa actividades por mes para análisis de tendencias
   */
  private groupActivitiesByMonth(activities: Activity[]): Record<string, number> {
    const result: Record<string, number> = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const monthYear = this.formatDateString(date, 'yyyy-MM');
      
      if (!result[monthYear]) {
        result[monthYear] = 0;
      }
      
      result[monthYear]++;
    });
    
    return result;
  }
  
  /**
   * Añade el contenido específico según el tipo de reporte
   */
  private async addReportContent(doc: jsPDF, options: ReportOptions, data: any): Promise<void> {
    try {
      console.log(`Generando contenido para reporte ${options.type}:`, data);
      
      switch (options.type) {
        case 'activities':
          this.addActivitiesContent(doc, data);
          break;
        case 'stores':
          this.addStoresContent(doc, data);
          break;
        case 'games':
          this.addGamesContent(doc, data);
          break;
        case 'dashboard':
          this.addDashboardContent(doc, data);
          break;
        case 'history':
          this.addHistoryContent(doc, data);
          break;
        case 'searches':
          this.addSearchesContent(doc, data);
          break;
        case 'users':
          this.addUsersContent(doc, data);
          break;
        default:
          throw new Error(`Tipo de reporte no soportado: ${options.type}`);
      }
    } catch (error) {
      console.error(`Error al añadir contenido al reporte ${options.type}:`, error);
      console.error('Datos recibidos:', data);
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error al generar el contenido del reporte ${options.type}.`, this.MARGIN, 100);
      doc.text('Detalles del error:', this.MARGIN, 110);
      doc.setFontSize(10);
      doc.text(error instanceof Error ? error.message : 'Error desconocido', this.MARGIN, 120);
      doc.setTextColor(0, 0, 0);
    }
  }
  
  /**
   * Añade contenido de actividades al PDF
   */
  private addActivitiesContent(doc: jsPDF, activities: Activity[]): void {
    const y = this.HEADER_START_Y;
    if (!activities || activities.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay actividades para mostrar con los filtros seleccionados.', this.MARGIN, y);
      return;
    }
    
    // Añadir tabla de actividades
    const tableColumn = ['Nombre', 'Fecha', 'Ubicación', 'Juego ID', 'Tienda ID'];
    const tableRows = activities.map(activity => {
      const formattedDate = this.formatDateString(new Date(activity.date), 'dd/MM/yyyy HH:mm');
      
      return [
        activity.name_activity,
        formattedDate, 
        activity.adress_activity,
        activity.id_game || 'N/A',
        activity.id_store || 'N/A'
      ];
    });
    
    // Añadir estadísticas
    doc.setFontSize(12);
    doc.text('Resumen de Actividades', this.MARGIN, y);
    doc.setFontSize(10);
    doc.text(`Total de actividades: ${activities.length}`, this.MARGIN, y + 8);
    
    const now = new Date();
    const upcomingActivities = activities.filter(a => new Date(a.date) > now);
    const pastActivities = activities.filter(a => new Date(a.date) <= now);
    
    doc.text(`Actividades futuras: ${upcomingActivities.length}`, this.MARGIN, y + 14);
    doc.text(`Actividades pasadas: ${pastActivities.length}`, this.MARGIN, y + 20);
    
    const tableStartY = y + 28;
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: tableStartY,
      margin: { left: this.MARGIN, right: this.MARGIN },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: 'middle',
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Nombre
        1: { cellWidth: 30 }, // Fecha
        2: { cellWidth: 50 }, // Ubicación
        3: { cellWidth: 20 }, // Juego ID
        4: { cellWidth: 20 }  // Tienda ID
      },
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
  }
  
  /**
   * Añade contenido de tiendas al PDF
   */
  private addStoresContent(doc: jsPDF, stores: Store[]): void {
    const startY = this.HEADER_START_Y;
    if (!stores || stores.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay tiendas para mostrar con los filtros seleccionados.', this.MARGIN, startY);
      return;
    }
    
    doc.setFontSize(12);
    doc.text('Resumen de Tiendas', this.MARGIN, startY);
    doc.setFontSize(10);
    doc.text(`Total de tiendas: ${stores.length}`, this.MARGIN, startY + 8);
    
    const storesByRegion: Record<string, number> = {};
    stores.forEach(store => {
      const region = 'Región General';
      if (!storesByRegion[region]) {
        storesByRegion[region] = 0;
      }
      storesByRegion[region]++;
    });
    
    let y = startY + 14;
    doc.text('Tiendas por región:', this.MARGIN, y);
    y += 6;
    
    Object.entries(storesByRegion).forEach(([region, count], index) => {
      doc.text(`- ${region}: ${count}`, this.MARGIN + 6, y + (index * 6));
    });
    
    y += (Object.keys(storesByRegion).length * 6) + 12;
    
    const tableColumn = ['Nombre', 'Dirección', 'Teléfono', 'Email'];
    const tableRows = stores.map(store => [
      store.name_store,
      String(store.adress ?? 'N/A'),
      store.phone != null ? String(store.phone) : 'N/A',
      store.email || 'N/A'
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: y,
      margin: { left: this.MARGIN, right: this.MARGIN },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: 'middle',
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Nombre
        1: { cellWidth: 65 }, // Dirección
        2: { cellWidth: 35 }, // Teléfono
        3: { cellWidth: 45 }  // Email
      },
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
  }
  
  /**
   * Añade contenido de juegos al PDF
   */
  private addGamesContent(doc: jsPDF, games: Game[]): void {
    const startY = this.HEADER_START_Y;
    if (!games || games.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay juegos para mostrar con los filtros seleccionados.', this.MARGIN, startY);
      return;
    }
    
    doc.setFontSize(12);
    doc.text('Resumen de Juegos', this.MARGIN, startY);
    doc.setFontSize(10);
    doc.text(`Total de juegos: ${games.length}`, this.MARGIN, startY + 8);
    
    const gamesByCategory: Record<string, number> = {};
    games.forEach(game => {
      const category = game.category || 'Sin categoría';
      if (!gamesByCategory[category]) {
        gamesByCategory[category] = 0;
      }
      gamesByCategory[category]++;
    });
    
    let y = startY + 14;
    doc.text('Juegos por categoría:', this.MARGIN, y);
    y += 6;
    
    Object.entries(gamesByCategory).forEach(([category, count], index) => {
      doc.text(`- ${category}: ${count}`, this.MARGIN + 6, y + (index * 6));
    });
    
    y += (Object.keys(gamesByCategory).length * 6) + 12;
    
    const tableColumn = ['Nombre', 'Descripción', 'Categoría'];
    const tableRows = games.map(game => [
      game.name,
      game.description?.substring(0, 80) + (game.description && game.description.length > 80 ? '...' : '') || 'N/A',
      game.category || 'Sin categoría'
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: y,
      margin: { left: this.MARGIN, right: this.MARGIN },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: 'middle',
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 40 },  // Nombre
        1: { cellWidth: 110 }, // Descripción
        2: { cellWidth: 30 }   // Categoría
      },
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
  }
  
  /**
   * Añade contenido de dashboard al PDF
   */
  private addDashboardContent(doc: jsPDF, data: DashboardData): void {
    const m = this.MARGIN;
    const startY = this.HEADER_START_Y;
    const chartStartY = startY + 65;
    const barHeight = 100;
    const minYForNewPage = this.PAGE_HEIGHT - 100;

    try {
      const { metrics } = data;

      doc.setFontSize(12);
      doc.text('Resumen Ejecutivo', m, startY);

      doc.setFontSize(10);
      doc.text('Métricas Generales:', m, startY + 10);

      const metricsTable = [
        ['Total de Actividades', metrics.totalActivities.toString()],
        ['Actividades Futuras', metrics.upcomingActivities.toString()],
        ['Actividades Pasadas', metrics.pastActivities.toString()],
        ['Total de Tiendas', metrics.totalStores.toString()],
        ['Total de Juegos', metrics.totalGames.toString()]
      ];

      (doc as any).autoTable({
        body: metricsTable,
        startY: startY + 18,
        margin: { left: m, right: m },
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 4
        }
      });

      let y = chartStartY;

      if (Object.keys(metrics.activitiesByMonth || {}).length > 0) {
        doc.setFontSize(12);
        doc.text('Tendencia de Actividades por Mes', m, y);

        const monthsData = Object.entries(metrics.activitiesByMonth || {}).sort();
        const monthLabels = monthsData.map(([month]) => {
          try {
            const [year, monthNum] = month.split('-');
            return `${monthNum}/${year.slice(2)}`;
          } catch (e) {
            return month;
          }
        });

        const activityCounts = monthsData.map(([_, count]) => Number(count) || 0);

        if (activityCounts.length > 0 && Math.max(...activityCounts) > 0) {
          let barX = m;
          const barWidth = 15;
          const maxCount = Math.max(...activityCounts);
          const barBaseY = y + 25;

          doc.setFontSize(8);
          for (let i = 0; i < monthsData.length; i++) {
            const count = activityCounts[i];
            const height = count > 0 ? Math.max((count / maxCount) * barHeight, 1) : 0;

            doc.setFillColor(80, 80, 80);
            doc.rect(barX, barBaseY + (barHeight - height), barWidth, height, 'F');

            doc.text(monthLabels[i], barX + barWidth / 2 - 4, barBaseY + barHeight + 5);
            doc.text(count.toString(), barX + barWidth / 2 - 2, barBaseY + (barHeight - height) - 2);

            barX += barWidth + 10;
          }

          doc.setFontSize(8);
          doc.text('* El gráfico muestra la distribución de actividades por mes', m, barBaseY + barHeight + 18);

          y = barBaseY + barHeight + 28;
        } else {
          doc.setFontSize(10);
          doc.text('No hay suficientes datos para mostrar el gráfico.', m, y + 20);
          y += 30;
        }
      } else {
        doc.setFontSize(10);
        doc.text('No hay datos suficientes para mostrar la tendencia de actividades.', m, y + 10);
        y += 20;
      }

      if (metrics.storesByRegion && Object.keys(metrics.storesByRegion).length > 0) {
        if (y > minYForNewPage) {
          doc.addPage();
          y = this.MARGIN + 5;
        }

        doc.setFontSize(12);
        doc.text('Distribución de Tiendas por Plan', m, y);
        y += 20;

        try {
          const regions = Object.keys(metrics.storesByRegion);
          const storesCounts = regions.map(region => metrics.storesByRegion![region] || 0);
          const total = storesCounts.reduce((sum, count) => sum + count, 0);

          if (total > 0) {
            let startAngle = 0;
            const centerX = this.PAGE_WIDTH / 2;
            const centerY = y + 35;
            const radius = 40;
            const colors = [[41, 128, 185], [39, 174, 96], [192, 57, 43], [142, 68, 173]];

            doc.setFontSize(10);
            doc.text('Leyenda:', m, y);

            regions.forEach((region, index) => {
              const count = metrics.storesByRegion![region] || 0;
              const percentage = (count / total) * 100;
              const angle = (percentage / 100) * 2 * Math.PI;
              const endAngle = startAngle + angle;

              const color = colors[index % colors.length];
              doc.setFillColor(color[0], color[1], color[2]);

              try {
                this.drawSector(doc, centerX, centerY, radius, startAngle, endAngle);
              } catch (e) {
                console.error('Error al dibujar sector:', e);
              }

              doc.setFillColor(color[0], color[1], color[2]);
              doc.rect(m, y + 5 + (index * 10), 5, 5, 'F');
              doc.text(`${region}: ${count} (${percentage.toFixed(1)}%)`, m + 10, y + 10 + (index * 10));

              startAngle = endAngle;
            });
          } else {
            doc.setFontSize(10);
            doc.text('No hay datos suficientes para mostrar la distribución de tiendas.', m, y + 10);
          }
        } catch (e) {
          console.error('Error al generar gráfico de tiendas:', e);
          doc.setFontSize(10);
          doc.text('No se pudo generar el gráfico de distribución de tiendas.', m, y + 10);
        }
      }
    } catch (error) {
      console.error('Error al generar dashboard:', error);
      doc.setFontSize(12);
      doc.text('Resumen Ejecutivo', m, startY);
      doc.setFontSize(10);
      doc.text('No se pudieron cargar todos los datos para el dashboard.', m, startY + 10);

      doc.text('Recomendaciones:', m, startY + 30);
      doc.text('- Verifica que existan actividades en el sistema', m, startY + 40);
      doc.text('- Intenta generar reportes específicos (Actividades, Tiendas, Juegos)', m, startY + 50);
      doc.text('- Si el problema persiste, contacta al administrador', m, startY + 60);
    }
  }
  
  /**
   * Dibuja un sector para un gráfico de pastel
   */
  private drawSector(doc: any, x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
    // Empezar en el centro
    doc.moveTo(x, y);
    
    // Moverse al punto inicial del arco
    const x1 = x + radius * Math.cos(startAngle);
    const y1 = y + radius * Math.sin(startAngle);
    doc.lineTo(x1, y1);
    
    // Dibujar arco
    for (let angle = startAngle; angle <= endAngle; angle += 0.01) {
      const x2 = x + radius * Math.cos(angle);
      const y2 = y + radius * Math.sin(angle);
      doc.lineTo(x2, y2);
    }
    
    // Volver al centro
    doc.lineTo(x, y);
    doc.fill();
  }

  /**
   * Obtiene datos de historial con filtros aplicados
   */
  private async fetchHistoryData(options: ReportOptions): Promise<any[]> {
    try {
      let query = supabase
        .from('history')
        .select(`
          *,
          stores(name_store),
          activities(name_activity),
          users(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros de fecha
      if (options.dateFrom) {
        query = query.gte('created_at', options.dateFrom.toISOString());
      }
      if (options.dateTo) {
        query = query.lte('created_at', options.dateTo.toISOString());
      }

      // Aplicar filtros específicos
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value) {
            query = query.eq(key, value);
          }
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error en consulta de historial:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo datos de historial:', error);
      return [];
    }
  }

  /**
   * Obtiene datos de búsquedas con filtros aplicados
   */
  private async fetchSearchesData(options: ReportOptions): Promise<any[]> {
    try {
      let query = supabase
        .from('searches')
        .select(`
          *,
          users(first_name, last_name)
        `)
        .order('date_time', { ascending: false });

      // Aplicar filtros de fecha
      if (options.dateFrom) {
        query = query.gte('date_time', options.dateFrom.toISOString());
      }
      if (options.dateTo) {
        query = query.lte('date_time', options.dateTo.toISOString());
      }

      // Aplicar filtros específicos
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value) {
            query = query.eq(key, value);
          }
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error en consulta de búsquedas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo datos de búsquedas:', error);
      return [];
    }
  }


  /**
   * Obtiene datos de usuarios con filtros aplicados
   */
  private async fetchUsersData(options: ReportOptions): Promise<any[]> {
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          roles(role_name),
          plans(plan_name)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros de fecha
      if (options.dateFrom) {
        query = query.gte('created_at', options.dateFrom.toISOString());
      }
      if (options.dateTo) {
        query = query.lte('created_at', options.dateTo.toISOString());
      }

      // Aplicar filtros específicos
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value) {
            query = query.eq(key, value);
          }
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error en consulta de usuarios:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo datos de usuarios:', error);
      return [];
    }
  }

  /**
   * Añade contenido de historial al PDF
   */
  private addHistoryContent(doc: jsPDF, history: any[]): void {
    const y = this.HEADER_START_Y;
    if (history.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay datos de historial disponibles.', this.MARGIN, y);
      return;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Actividades', this.MARGIN, y);

    const tableData = history.map((item, index) => [
      index + 1,
      item.stores?.name_store || 'N/A',
      item.activities?.name_activity || 'N/A',
      item.tipe_activity || 'N/A',
      item.users ? `${item.users.first_name} ${item.users.last_name}` : 'N/A',
      this.formatDateString(new Date(item.created_at), 'dd/MM/yyyy HH:mm')
    ]);

    (doc as any).autoTable({
      head: [['#', 'Tienda', 'Actividad', 'Tipo', 'Usuario', 'Fecha']],
      body: tableData,
      startY: y + 15,
      margin: { left: this.MARGIN, right: this.MARGIN },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
  }

  /**
   * Añade contenido de búsquedas al PDF
   */
  private addSearchesContent(doc: jsPDF, searches: any[]): void {
    const y = this.HEADER_START_Y;
    if (searches.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay datos de búsquedas disponibles.', this.MARGIN, y);
      return;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Búsquedas', this.MARGIN, y);

    const tableData = searches.map((item, index) => [
      index + 1,
      item.search_type || 'N/A',
      item.search_term || 'N/A',
      item.users ? `${item.users.first_name} ${item.users.last_name}` : 'N/A',
      item.total_searches || 0,
      this.formatDateString(new Date(item.date_time), 'dd/MM/yyyy HH:mm')
    ]);

    (doc as any).autoTable({
      head: [['#', 'Tipo', 'Término', 'Usuario', 'Total', 'Fecha']],
      body: tableData,
      startY: y + 15,
      margin: { left: this.MARGIN, right: this.MARGIN },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
  }


  /**
   * Añade contenido de usuarios al PDF
   */
  private addUsersContent(doc: jsPDF, users: any[]): void {
    const y = this.HEADER_START_Y;
    if (users.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay datos de usuarios disponibles.', this.MARGIN, y);
      return;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Usuarios', this.MARGIN, y);

    const tableData = users.map((item, index) => [
      index + 1,
      item.first_name || 'N/A',
      item.last_name || 'N/A',
      item.email || 'N/A',
      item.roles?.role_name || 'N/A',
      item.plans?.plan_name || 'N/A',
      item.city || 'N/A',
      item.region || 'N/A',
      this.formatDateString(new Date(item.created_at), 'dd/MM/yyyy')
    ]);

    (doc as any).autoTable({
      head: [['#', 'Nombre', 'Apellido', 'Email', 'Rol', 'Plan', 'Ciudad', 'Región', 'Fecha Registro']],
      body: tableData,
      startY: y + 15,
      margin: { left: this.MARGIN, right: this.MARGIN },
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 8 },   // #
        1: { cellWidth: 22 },  // Nombre
        2: { cellWidth: 22 },  // Apellido
        3: { cellWidth: 38 },  // Email
        4: { cellWidth: 18 },  // Rol
        5: { cellWidth: 18 },  // Plan
        6: { cellWidth: 22 },  // Ciudad
        7: { cellWidth: 22 },  // Región
        8: { cellWidth: 22 }   // Fecha
      },
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
  }

  /**
   * Formatea una fecha en string con formato específico
   */
  private formatDateString(date: Date, formatStr: string): string {
    try {
      return formatDate(date, formatStr);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return date.toLocaleDateString('es-ES');
    }
  }
}

export const reportService = new ReportService(); 