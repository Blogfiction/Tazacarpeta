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

/**
 * Tipo de reporte a generar
 */
export type ReportType = 'activities' | 'stores' | 'games' | 'dashboard';

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
  storesByPlan?: Record<string, number>;
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
        this.FAKE_STORE_INVENTORY[store.id_tienda] = inventoryGames.map(game => 
            createFakeStoreGame(store.id_tienda, game.id_juego, { 
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
      // Cargar los datos según el tipo de reporte
      const data = await this.fetchData(options);
      
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
      
      // Añadir cabecera
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Generado el: ${formattedDate}`, 14, 30);
      
      // Añadir contenido según el tipo de reporte
      await this.addReportContent(doc, options, data);
      
      // Añadir pie de página
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount} - TCG Admin`, 14, doc.internal.pageSize.height - 10);
      }
      
      // Exportar como blob
      const pdfBlob = doc.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      throw new Error('No se pudo generar el reporte');
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
        const activityDate = new Date(activity.fecha);
        
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
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
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
    return stores.sort((a, b) => a.nombre.localeCompare(b.nombre));
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
    return games.sort((a, b) => a.nombre.localeCompare(b.nombre));
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
      const upcomingActivities = activities.filter(a => new Date(a.fecha) > now);
      const pastActivities = activities.filter(a => new Date(a.fecha) <= now);
      
      // Agrupar actividades por mes
      const activitiesByMonth = this.groupActivitiesByMonth(activities);
      
      // Agrupar tiendas por plan
      const storesByPlan: Record<string, number> = {};
      stores.forEach(store => {
        if (!storesByPlan[store.plan]) {
          storesByPlan[store.plan] = 0;
        }
        storesByPlan[store.plan]++;
      });
      
      // Agrupar juegos por categoría
      const gamesByCategory: Record<string, number> = {};
      games.forEach(game => {
        const category = game.categoria || 'Sin categoría';
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
          storesByPlan,
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
      const date = new Date(activity.fecha);
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
      }
    } catch (error) {
      console.error(`Error al añadir contenido al reporte ${options.type}:`, error);
      // Añadir mensaje de error al documento
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text('Error al generar el contenido del reporte. Inténtalo de nuevo más tarde.', 14, 100);
      doc.setTextColor(0, 0, 0);
    }
  }
  
  /**
   * Añade contenido de actividades al PDF
   */
  private addActivitiesContent(doc: jsPDF, activities: Activity[]): void {
    if (!activities || activities.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay actividades para mostrar con los filtros seleccionados.', 14, 40);
      return;
    }
    
    // Añadir tabla de actividades
    const tableColumn = ['Nombre', 'Fecha', 'Ubicación', 'Juego ID', 'Tienda ID'];
    const tableRows = activities.map(activity => {
      const formattedDate = this.formatDateString(new Date(activity.fecha), 'dd/MM/yyyy HH:mm');
      
      return [
        activity.nombre,
        formattedDate, 
        activity.ubicacion,
        activity.id_juego || 'N/A',
        activity.id_tienda || 'N/A'
      ];
    });
    
    // Añadir estadísticas
    doc.setFontSize(12);
    doc.text('Resumen de Actividades', 14, 40);
    doc.setFontSize(10);
    doc.text(`Total de actividades: ${activities.length}`, 14, 48);
    
    const now = new Date();
    const upcomingActivities = activities.filter(a => new Date(a.fecha) > now);
    const pastActivities = activities.filter(a => new Date(a.fecha) <= now);
    
    doc.text(`Actividades futuras: ${upcomingActivities.length}`, 14, 54);
    doc.text(`Actividades pasadas: ${pastActivities.length}`, 14, 60);
    
    // Añadir tabla
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
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
    if (!stores || stores.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay tiendas para mostrar con los filtros seleccionados.', 14, 40);
      return;
    }
    
    // Añadir estadísticas
    doc.setFontSize(12);
    doc.text('Resumen de Tiendas', 14, 40);
    doc.setFontSize(10);
    doc.text(`Total de tiendas: ${stores.length}`, 14, 48);
    
    // Agrupar por plan
    const storesByPlan: Record<string, number> = {};
    stores.forEach(store => {
      if (!storesByPlan[store.plan]) {
        storesByPlan[store.plan] = 0;
      }
      storesByPlan[store.plan]++;
    });
    
    let y = 54;
    doc.text('Tiendas por plan:', 14, y);
    y += 6;
    
    Object.entries(storesByPlan).forEach(([plan, count], index) => {
      doc.text(`- ${plan}: ${count}`, 20, y + (index * 6));
    });
    
    y += (Object.keys(storesByPlan).length * 6) + 6;
    
    // Añadir tabla de tiendas
    const tableColumn = ['Nombre', 'Dirección', 'Ciudad', 'Plan'];
    const tableRows = stores.map(store => {
      return [
        store.nombre,
        `${store.direccion.calle} ${store.direccion.numero}`,
        store.direccion.ciudad,
        store.plan
      ];
    });
    
    // Añadir tabla
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: 'middle',
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Nombre
        1: { cellWidth: 60 }, // Dirección
        2: { cellWidth: 40 }, // Ciudad
        3: { cellWidth: 30 }  // Plan
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
    if (!games || games.length === 0) {
      doc.setFontSize(12);
      doc.text('No hay juegos para mostrar con los filtros seleccionados.', 14, 40);
      return;
    }
    
    // Añadir estadísticas
    doc.setFontSize(12);
    doc.text('Resumen de Juegos', 14, 40);
    doc.setFontSize(10);
    doc.text(`Total de juegos: ${games.length}`, 14, 48);
    
    // Agrupar por categoría
    const gamesByCategory: Record<string, number> = {};
    games.forEach(game => {
      const category = game.categoria || 'Sin categoría';
      if (!gamesByCategory[category]) {
        gamesByCategory[category] = 0;
      }
      gamesByCategory[category]++;
    });
    
    let y = 54;
    doc.text('Juegos por categoría:', 14, y);
    y += 6;
    
    Object.entries(gamesByCategory).forEach(([category, count], index) => {
      doc.text(`- ${category}: ${count}`, 20, y + (index * 6));
    });
    
    y += (Object.keys(gamesByCategory).length * 6) + 6;
    
    // Añadir tabla de juegos
    const tableColumn = ['Nombre', 'Descripción', 'Categoría'];
    const tableRows = games.map(game => {
      return [
        game.nombre,
        game.descripcion?.substring(0, 80) + (game.descripcion && game.descripcion.length > 80 ? '...' : '') || 'N/A',
        game.categoria || 'Sin categoría'
      ];
    });
    
    // Añadir tabla
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: 'middle',
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Nombre
        1: { cellWidth: 110 }, // Descripción
        2: { cellWidth: 30 }  // Categoría
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
    try {
      const { metrics } = data;
      
      // Añadir resumen ejecutivo
      doc.setFontSize(12);
      doc.text('Resumen Ejecutivo', 14, 40);
      
      doc.setFontSize(10);
      doc.text('Métricas Generales:', 14, 50);
      
      // Crear una tabla de métricas
      const metricsTable = [
        ['Total de Actividades', metrics.totalActivities.toString()],
        ['Actividades Futuras', metrics.upcomingActivities.toString()],
        ['Actividades Pasadas', metrics.pastActivities.toString()],
        ['Total de Tiendas', metrics.totalStores.toString()],
        ['Total de Juegos', metrics.totalGames.toString()]
      ];
      
      // Añadir tabla de métricas
      (doc as any).autoTable({
        body: metricsTable,
        startY: 55,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 4
        }
      });
      
      let y = 110;
      
      // Verificar si hay datos para el gráfico
      if (Object.keys(metrics.activitiesByMonth || {}).length > 0) {
        // Actividades por mes
        doc.setFontSize(12);
        doc.text('Tendencia de Actividades por Mes', 14, y);
        
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
        
        // Si hay datos, dibujar gráfico
        if (activityCounts.length > 0 && Math.max(...activityCounts) > 0) {
          // Crear gráfico simple de barras
          let barX = 20;
          const barWidth = 15;
          const maxCount = Math.max(...activityCounts);
          const barHeight = 100; // altura máxima
          
          doc.setFontSize(8);
          for (let i = 0; i < monthsData.length; i++) {
            const count = activityCounts[i];
            // Asegurar que la altura de la barra sea al menos 1 si hay al menos una actividad
            const height = count > 0 ? Math.max((count / maxCount) * barHeight, 1) : 0;
            
            // Dibujar barra
            doc.setFillColor(80, 80, 80);
            doc.rect(barX, 120 + (barHeight - height), barWidth, height, 'F');
            
            // Añadir etiqueta
            doc.text(monthLabels[i], barX + barWidth/2 - 4, 125 + barHeight);
            
            // Añadir valor
            doc.text(count.toString(), barX + barWidth/2 - 2, 115 + (barHeight - height));
            
            barX += barWidth + 10;
          }
          
          // Añadir leyenda
          doc.setFontSize(8);
          doc.text('* El gráfico muestra la distribución de actividades por mes', 14, 240);
          
          y = 250;
        } else {
          doc.setFontSize(10);
          doc.text('No hay suficientes datos para mostrar el gráfico.', 14, y + 20);
          y += 30;
        }
      } else {
        doc.setFontSize(10);
        doc.text('No hay datos suficientes para mostrar la tendencia de actividades.', 14, y + 10);
        y += 20;
      }
      
      // Verificar si hay datos para el gráfico de tiendas por plan
      if (metrics.storesByPlan && Object.keys(metrics.storesByPlan).length > 0) {
        // Si estamos muy abajo en la página, añadir una nueva
        if (y > 200) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFontSize(12);
        doc.text('Distribución de Tiendas por Plan', 14, y);
        y += 20;
        
        try {
          // Crear un gráfico de pastel simple
          const plans = Object.keys(metrics.storesByPlan);
          const storesCounts = plans.map(plan => metrics.storesByPlan![plan] || 0);
          const total = storesCounts.reduce((sum, count) => sum + count, 0);
          
          if (total > 0) {
            let startAngle = 0;
            const centerX = 105;
            const centerY = y + 30;
            const radius = 40;
            const colors = [[41, 128, 185], [39, 174, 96], [192, 57, 43], [142, 68, 173]];
            
            // Leyenda
            doc.setFontSize(10);
            doc.text('Leyenda:', 14, y);
            
            plans.forEach((plan, index) => {
              const count = metrics.storesByPlan![plan] || 0;
              const percentage = (count / total) * 100;
              const angle = (percentage / 100) * 2 * Math.PI;
              const endAngle = startAngle + angle;
              
              // Corregir el spread operator para colores
              const color = colors[index % colors.length];
              doc.setFillColor(color[0], color[1], color[2]);
              
              try {
                this.drawSector(doc, centerX, centerY, radius, startAngle, endAngle);
              } catch (e) {
                console.error('Error al dibujar sector:', e);
              }
              
              // Añadir a leyenda
              doc.setFillColor(color[0], color[1], color[2]);
              doc.rect(14, y + 5 + (index * 10), 5, 5, 'F');
              doc.text(`${plan}: ${count} (${percentage.toFixed(1)}%)`, 24, y + 10 + (index * 10));
              
              startAngle = endAngle;
            });
          } else {
            doc.setFontSize(10);
            doc.text('No hay datos suficientes para mostrar la distribución de tiendas.', 14, y + 10);
          }
        } catch (e) {
          console.error('Error al generar gráfico de tiendas:', e);
          doc.setFontSize(10);
          doc.text('No se pudo generar el gráfico de distribución de tiendas.', 14, y + 10);
        }
      }
    } catch (error) {
      console.error('Error al generar dashboard:', error);
      doc.setFontSize(12);
      doc.text('Resumen Ejecutivo', 14, 40);
      doc.setFontSize(10);
      doc.text('No se pudieron cargar todos los datos para el dashboard.', 14, 50);
      
      // Agregar información básica al menos
      doc.setFontSize(10);
      doc.text('Recomendaciones:', 14, 70);
      doc.text('- Verifica que existan actividades en el sistema', 14, 80);
      doc.text('- Intenta generar reportes específicos (Actividades, Tiendas, Juegos)', 14, 90);
      doc.text('- Si el problema persiste, contacta al administrador', 14, 100);
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