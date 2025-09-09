import { supabase } from '../lib/supabaseClient';
import { analyticsService, ReportFilters } from './analytics';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { format as formatDate } from 'date-fns';
// import html2canvas from 'html2canvas'; // Ya no se usa

// Tipos para reportes
export type ReportPeriod = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export interface MonthlyReportFilters {
  period: ReportPeriod;
  year: number;
  month?: number; // 1-12 (solo para mensual)
  quarter?: number; // 1, 2, 3, 4 (solo para trimestral)
  semester?: number; // 1, 2 (solo para semestral)
  storeName?: string;
  gameName?: string;
  category?: string;
  includeCharts?: boolean;
}

export interface MonthlyReportData {
  period: string; // "Enero 2025"
  totalActivities: number;
  totalStores: number;
  totalGames: number;
  totalSearches: number;
  topStores: any[];
  topGames: any[];
  topPlayedGames: any[];
  topActivities: any[];
  activityTypes: any[];
  gameCategoryParticipation: any[];
  trends: any[];
  growthMetrics: {
    activitiesGrowth: number;
    searchesGrowth: number;
    storesGrowth: number;
  };
}

export interface SavedReport {
  id: string;
  tipo_informe: string;
  fecha_generacion: string;
  parametros: MonthlyReportFilters;
  data: MonthlyReportData;
}

/**
 * Servicio para generar reportes mensuales
 */
class MonthlyReportService {
  
  constructor() {
    // Ya no necesitamos inicializar tienda sistema
  }
  
  /**
   * Calcula las fechas de inicio y fin según el tipo de período
   */
  private calculatePeriodDates(filters: MonthlyReportFilters): { startDate: Date; endDate: Date; periodLabel: string } {
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    switch (filters.period) {
      case 'monthly':
        startDate = new Date(filters.year, filters.month! - 1, 1);
        endDate = new Date(filters.year, filters.month!, 0, 23, 59, 59);
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        periodLabel = `${monthNames[filters.month! - 1]} ${filters.year}`;
        break;

      case 'quarterly':
        const quarterStartMonth = (filters.quarter! - 1) * 3;
        startDate = new Date(filters.year, quarterStartMonth, 1);
        endDate = new Date(filters.year, quarterStartMonth + 3, 0, 23, 59, 59);
        const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];
        periodLabel = `${quarterNames[filters.quarter! - 1]} ${filters.year}`;
        break;

      case 'semiannual':
        const semesterStartMonth = (filters.semester! - 1) * 6;
        startDate = new Date(filters.year, semesterStartMonth, 1);
        endDate = new Date(filters.year, semesterStartMonth + 6, 0, 23, 59, 59);
        const semesterNames = ['Primer Semestre', 'Segundo Semestre'];
        periodLabel = `${semesterNames[filters.semester! - 1]} ${filters.year}`;
        break;

      case 'annual':
        startDate = new Date(filters.year, 0, 1);
        endDate = new Date(filters.year, 11, 31, 23, 59, 59);
        periodLabel = `Año ${filters.year}`;
        break;

      default:
        throw new Error('Tipo de período no válido');
    }

    return { startDate, endDate, periodLabel };
  }

  /**
   * Genera un reporte del período especificado (mensual, trimestral, semestral, anual)
   */
  async generateMonthlyReport(filters: MonthlyReportFilters): Promise<MonthlyReportData> {
    try {
      // Calcular fechas según el tipo de período
      const { startDate, endDate, periodLabel } = this.calculatePeriodDates(filters);
      
      // Crear filtros para analytics
      const storeId = filters.storeName ? await this.getStoreIdByName(filters.storeName) : undefined;
      const gameId = filters.gameName ? await this.getGameIdByName(filters.gameName) : undefined;
      
      const analyticsFilters: ReportFilters = {
        dateFrom: startDate,
        dateTo: endDate,
        storeId: storeId || undefined,
        gameId: gameId || undefined,
        category: filters.category,
        limit: 1000 // Límite alto para obtener todos los datos
      };

      // Obtener datos del período actual
      const currentPeriodData = await analyticsService.getDashboardMetrics(analyticsFilters);
      
      // Obtener datos del período anterior para comparación
      const previousPeriodStart = new Date(startDate);
      const previousPeriodEnd = new Date(endDate);
      
      // Calcular el período anterior según el tipo
      switch (filters.period) {
        case 'monthly':
          previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
          previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1);
          break;
        case 'quarterly':
          previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3);
          previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 3);
          break;
        case 'semiannual':
          previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 6);
          previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 6);
          break;
        case 'annual':
          previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
          previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1);
          break;
      }
      
      const previousFilters: ReportFilters = {
        dateFrom: previousPeriodStart,
        dateTo: previousPeriodEnd,
        storeId: storeId || undefined,
        gameId: gameId || undefined,
        category: filters.category,
        limit: 1000 // Límite alto para obtener todos los datos
      };
      
      const previousPeriodData = await analyticsService.getDashboardMetrics(previousFilters);
      
      // Calcular métricas de crecimiento
      const growthMetrics = {
        activitiesGrowth: this.calculateGrowth(currentPeriodData.totalActivities, previousPeriodData.totalActivities),
        searchesGrowth: this.calculateGrowth(currentPeriodData.totalSearches, previousPeriodData.totalSearches),
        storesGrowth: this.calculateGrowth(currentPeriodData.totalStores, previousPeriodData.totalStores)
      };
      
      return {
        period: periodLabel,
        totalActivities: currentPeriodData.totalActivities,
        totalStores: currentPeriodData.totalStores,
        totalGames: currentPeriodData.totalGames,
        totalSearches: currentPeriodData.totalSearches,
        topStores: currentPeriodData.topStores,
        topGames: currentPeriodData.topGames,
        topPlayedGames: currentPeriodData.topPlayedGames,
        topActivities: currentPeriodData.topActivities,
        activityTypes: currentPeriodData.activityTypes,
        gameCategoryParticipation: currentPeriodData.gameCategoryParticipation,
        trends: currentPeriodData.trends,
        growthMetrics
      };
      
    } catch (error) {
      console.error('Error generando reporte mensual:', error);
      throw new Error('No se pudo generar el reporte mensual');
    }
  }

  /**
   * Genera y descarga un reporte mensual en PDF
   */
  async generateAndDownloadMonthlyPDF(filters: MonthlyReportFilters): Promise<void> {
    try {
      const reportData = await this.generateMonthlyReport(filters);
      const pdfBlob = await this.createMonthlyPDF(reportData, filters);
      
      const periodSuffix = filters.period === 'monthly' ? `${filters.month!.toString().padStart(2, '0')}` :
                          filters.period === 'quarterly' ? `Q${filters.quarter}` :
                          filters.period === 'semiannual' ? `S${filters.semester}` :
                          'anual';
      const filename = `reporte-${filters.period}-${filters.year}-${periodSuffix}.pdf`;
      saveAs(pdfBlob, filename);
      
      // Guardar reporte en la base de datos con PDF incluido
      await this.saveReportToDatabase(filters, reportData, pdfBlob);
      
    } catch (error) {
      console.error('Error generando PDF mensual:', error);
      throw new Error('No se pudo generar el reporte mensual');
    }
  }

  /**
   * Crea el PDF del reporte mensual
   */
  private async createMonthlyPDF(data: MonthlyReportData, filters: MonthlyReportFilters): Promise<Blob> {
    const doc = new jsPDF();
    
    // Configurar página A4 (por defecto)
    // Los márgenes se manejan en cada tabla individualmente
    
    // Configurar metadatos
    doc.setProperties({
      title: `Reporte Mensual - ${data.period}`,
      subject: 'TCG Admin Monthly Report',
      author: 'TCG Admin',
      creator: 'TCG Admin System'
    });

    // Portada
    this.addCoverPage(doc, data, filters);
    
    // Resumen ejecutivo
    this.addExecutiveSummary(doc, data);
    
    // Tablas detalladas (sin gráficos)
    this.addDetailedTables(doc, data);
    
    // Sección de gráficos separada (si está habilitada)
    if (filters.includeCharts) {
      this.addChartsSection(doc, data, filters);
    }
    
    // Análisis de tendencias
    this.addTrendsAnalysis(doc, data);
    
    // Pie de página
    this.addFooter(doc);
    
    return doc.output('blob');
  }

  /**
   * Añade la portada del reporte
   */
  private addCoverPage(doc: jsPDF, data: MonthlyReportData, filters: MonthlyReportFilters): void {
    // Logo de la empresa en la esquina superior derecha
    this.addCompanyLogo(doc);
    
    // Título principal
    doc.setFontSize(24);
    doc.text('REPORTE MENSUAL', 105, 50, { align: 'center' });
    
    // Período
    doc.setFontSize(18);
    doc.text(data.period, 105, 70, { align: 'center' });
    
    // Información adicional
    doc.setFontSize(12);
    doc.text(`Generado el: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 90, { align: 'center' });
    
    // Filtros aplicados
    if (filters.storeName || filters.gameName || filters.category) {
      doc.setFontSize(10);
      doc.text('Filtros aplicados:', 20, 120);
      
      let y = 130;
      if (filters.storeName) {
        doc.text(`• Tienda: ${filters.storeName}`, 30, y);
        y += 10;
      }
      if (filters.gameName) {
        doc.text(`• Juego: ${filters.gameName}`, 30, y);
        y += 10;
      }
      if (filters.category) {
        doc.text(`• Categoría: ${filters.category}`, 30, y);
        y += 10;
      }
    }
  }

  /**
   * Añade el resumen ejecutivo
   */
  private addExecutiveSummary(doc: jsPDF, data: MonthlyReportData): void {
    doc.addPage();
    
    // Título
    doc.setFontSize(16);
    doc.text('RESUMEN EJECUTIVO', 20, 30);
    
    // Métricas principales
    const metrics = [
      ['Total de Actividades', data.totalActivities.toString()],
      ['Total de Juegos', data.totalGames.toString()]
    ];
    
    // Tabla de métricas
    autoTable(doc, {
      body: metrics,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 12,
        cellPadding: 8
      },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'center' }
      }
    });
    
    // Métricas de crecimiento
    doc.setFontSize(14);
    doc.text('CRECIMIENTO RESPECTO AL MES ANTERIOR', 20, 100);
    
    const growthData = [
      ['Actividades', `${data.growthMetrics.activitiesGrowth > 0 ? '+' : ''}${data.growthMetrics.activitiesGrowth.toFixed(1)}%`]
    ];
    
    autoTable(doc, {
      body: growthData,
      startY: 110,
      theme: 'grid',
      styles: {
        fontSize: 12,
        cellPadding: 6
      },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'center' }
      }
    });
  }

  /**
   * Añade la sección de gráficos en páginas separadas
   */
  private addChartsSection(doc: jsPDF, data: MonthlyReportData, filters: MonthlyReportFilters): void {
    console.log('addChartsSection: Iniciando sección de gráficos');
    console.log('addChartsSection - includeCharts:', filters.includeCharts);
    
    // Página de gráficos de tiendas
    this.addStoresChartPage(doc, data, filters);
    
    // Página de gráficos de juegos
    this.addGamesChartPage(doc, data, filters);
    
    // Página de gráficos de categorías
    this.addCategoriesChartPage(doc, data, filters);
  }

  /**
   * Página dedicada a gráficos de tiendas (horizontal)
   */
  private addStoresChartPage(doc: jsPDF, data: MonthlyReportData, filters: MonthlyReportFilters): void {
    // Crear nueva página en landscape
    doc.addPage([297, 210], 'landscape'); // A4 landscape: 297mm x 210mm
    
    // Logo de la empresa
    this.addCompanyLogo(doc);
    
    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS VISUAL DE TIENDAS', 20, 25);
    
    // Subtítulo con período
    const periodText = this.getPeriodText(filters);
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${periodText}`, 20, 35);
    
    // Gráfico de torta para tiendas (izquierda, más arriba)
    if (data.topStores.length > 0) {
      this.addPieChart(
        doc, 
        data.topStores, 
        'name_store', 
        'visits', 
        20, 
        45, 
        150, 
        100, 
        'RANKING DE TIENDAS MÁS VISITADAS'
      );
    }
    
    // Análisis de tiendas (lado derecho del gráfico)
    const storesAnalysis = this.generateStoresAnalysis(data, filters);
    
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS DE TIENDAS:', 190, 45);
    
    // Análisis en dos columnas que continúa abajo cuando llega al borde
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    let currentY = 60;
    const columnWidth = 120; // Ancho de columna
    const leftColumnX = 190;
    const rightColumnX = 320;
    const maxY = 280; // Usar más espacio vertical (página landscape es 210mm de alto)
    const lineHeight = 4;
    const itemSpacing = 2;
    
    storesAnalysis.forEach((analysis, index) => {
      const isLeftColumn = index % 2 === 0;
      const x = isLeftColumn ? leftColumnX : rightColumnX;
      
      // Si llegamos al borde de la columna, continuar abajo
      if (currentY > maxY) {
        currentY = 60; // Resetear Y para continuar abajo
      }
      
      const lines = doc.splitTextToSize(analysis, columnWidth);
      lines.forEach((line: string) => {
        if (currentY <= maxY) { // Solo dibujar si no se sale de la página
          doc.text(line, x, currentY);
          currentY += lineHeight;
        }
      });
      
      // Solo avanzar Y si es columna izquierda
      if (isLeftColumn) {
        currentY += itemSpacing;
      }
    });
    
    // Si hay más análisis, mostrar indicador al final
    if (storesAnalysis.length > 0) {
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'italic');
      doc.text(`Total: ${storesAnalysis.length} análisis generados`, leftColumnX, currentY + 10);
    }
  }

  /**
   * Página dedicada a gráficos de juegos (horizontal)
   */
  private addGamesChartPage(doc: jsPDF, data: MonthlyReportData, filters: MonthlyReportFilters): void {
    // Crear nueva página en landscape
    doc.addPage([297, 210], 'landscape'); // A4 landscape: 297mm x 210mm
    
    // Logo de la empresa
    this.addCompanyLogo(doc);
    
    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS VISUAL DE JUEGOS', 20, 25);
    
    // Subtítulo con período
    const periodText = this.getPeriodText(filters);
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${periodText}`, 20, 35);
    
    // Gráfico de torta para juegos (izquierda, más arriba)
    if (data.topGames.length > 0) {
      this.addPieChart(
        doc, 
        data.topGames, 
        'name', 
        'clicks', 
        20, 
        45, 
        150, 
        100, 
        'RANKING DE JUEGOS MÁS CLICKEADOS'
      );
    }
    
    // Análisis de juegos (lado derecho del gráfico)
    const gamesAnalysis = this.generateGamesAnalysis(data, filters);
    
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS DE JUEGOS:', 190, 45);
    
    // Análisis en dos columnas que continúa abajo cuando llega al borde
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    let currentY = 60;
    const columnWidth = 120; // Ancho de columna
    const leftColumnX = 190;
    const rightColumnX = 320;
    const maxY = 280; // Usar más espacio vertical (página landscape es 210mm de alto)
    const lineHeight = 4;
    const itemSpacing = 2;
    
    gamesAnalysis.forEach((analysis, index) => {
      const isLeftColumn = index % 2 === 0;
      const x = isLeftColumn ? leftColumnX : rightColumnX;
      
      // Si llegamos al borde de la columna, continuar abajo
      if (currentY > maxY) {
        currentY = 60; // Resetear Y para continuar abajo
      }
      
      const lines = doc.splitTextToSize(analysis, columnWidth);
      lines.forEach((line: string) => {
        if (currentY <= maxY) { // Solo dibujar si no se sale de la página
          doc.text(line, x, currentY);
          currentY += lineHeight;
        }
      });
      
      // Solo avanzar Y si es columna izquierda
      if (isLeftColumn) {
        currentY += itemSpacing;
      }
    });
    
    // Si hay más análisis, mostrar indicador al final
    if (gamesAnalysis.length > 0) {
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'italic');
      doc.text(`Total: ${gamesAnalysis.length} análisis generados`, leftColumnX, currentY + 10);
    }
  }

  /**
   * Página dedicada a gráficos de categorías (horizontal)
   */
  private addCategoriesChartPage(doc: jsPDF, data: MonthlyReportData, filters: MonthlyReportFilters): void {
    console.log('addCategoriesChartPage: Iniciando página de categorías');
    console.log('addCategoriesChartPage - Datos de categorías:', data.gameCategoryParticipation);
    
    // Crear nueva página en landscape
    doc.addPage([297, 210], 'landscape'); // A4 landscape: 297mm x 210mm
    
    // Logo de la empresa
    this.addCompanyLogo(doc);
    
    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS VISUAL DE CATEGORÍAS', 20, 25);
    
    // Subtítulo con período
    const periodText = this.getPeriodText(filters);
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${periodText}`, 20, 35);
    
    // Gráfico de torta para categorías (izquierda, más arriba)
    if (data.gameCategoryParticipation.length > 0) {
      this.addPieChart(
        doc, 
        data.gameCategoryParticipation, 
        'category', 
        'participation_count', 
        20, 
        45, 
        150, 
        100, 
        'RANKING DE CATEGORÍAS MÁS PARTICIPADAS'
      );
    }
    
    // Análisis de categorías (lado derecho del gráfico)
    const categoriesAnalysis = this.generateCategoriesAnalysis(data, filters);
    
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS DE CATEGORÍAS:', 190, 45);
    
    // Análisis en dos columnas que continúa abajo cuando llega al borde
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    let currentY = 60;
    const columnWidth = 140; // Ancho de columna aumentado para evitar cortes
    const leftColumnX = 190;
    const rightColumnX = 320;
    const maxY = 280; // Usar más espacio vertical (página landscape es 210mm de alto)
    const lineHeight = 4;
    const itemSpacing = 2;
    
    categoriesAnalysis.forEach((analysis, index) => {
      const isLeftColumn = index % 2 === 0;
      const x = isLeftColumn ? leftColumnX : rightColumnX;
      
      // Si llegamos al borde de la columna, continuar abajo
      if (currentY > maxY) {
        currentY = 60; // Resetear Y para continuar abajo
      }
      
      const lines = doc.splitTextToSize(analysis, columnWidth);
      lines.forEach((line: string) => {
        if (currentY <= maxY) { // Solo dibujar si no se sale de la página
          doc.text(line, x, currentY);
          currentY += lineHeight;
        }
      });
      
      // Solo avanzar Y si es columna izquierda
      if (isLeftColumn) {
        currentY += itemSpacing;
      }
    });
    
    // Si hay más análisis, mostrar indicador al final
    if (categoriesAnalysis.length > 0) {
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'italic');
      doc.text(`Total: ${categoriesAnalysis.length} análisis generados`, leftColumnX, currentY + 10);
    }
  }


  /**
   * Añade las tablas detalladas (SOLO TABLAS, SIN GRÁFICOS)
   */
  private addDetailedTables(doc: jsPDF, data: MonthlyReportData): void {
    // Página 1: Tiendas y Juegos
    doc.addPage();
    this.addCompanyLogo(doc);
    
    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('TABLAS DETALLADAS', 20, 40);
    
    // Ranking de Tiendas - Optimizado
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('RANKING DE TIENDAS MÁS VISITADAS', 20, 60);
    
    // Debug: Verificar datos de tiendas
    console.log('Datos de tiendas:', data.topStores);
    
    const allStoresData = data.topStores.map((store, index) => [
      (index + 1).toString(),
      store.name_store || 'Sin nombre',
      store.visits?.toString() || '0', // Cambiar de total_visits a visits
      store.unique_users?.toString() || '0' // Cambiar de unique_visitors a unique_users
    ]);
    
    autoTable(doc, {
      head: [['#', 'Tienda', 'Visitas', 'Usuarios Únicos']],
      body: allStoresData,
      startY: 70,
      theme: 'grid',
      headStyles: { 
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { cellWidth: 80, halign: 'left' },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 30 }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 170
    });
    
    // Ranking de Juegos - Optimizado
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('RANKING DE JUEGOS MÁS CLICKEADOS', 20, 140);
    
    const allGamesData = data.topGames.map((game, index) => [
      (index + 1).toString(),
      game.name || 'Sin nombre',
      game.clicks?.toString() || '0',
      game.category || 'Sin categoría'
    ]);
    
    autoTable(doc, {
      head: [['#', 'Juego', 'Clics', 'Categoría']],
      body: allGamesData,
      startY: 150,
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { cellWidth: 80, halign: 'left' },
        2: { halign: 'center', cellWidth: 30 },
        3: { cellWidth: 40, halign: 'left' }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 170
    });
    
    // Página 2: Actividades
    doc.addPage();
    this.addCompanyLogo(doc);
    
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('RANKING DE ACTIVIDADES MÁS CONCURRIDAS', 20, 40);
    
    const allActivitiesData = data.topActivities.map((activity, index) => [
      (index + 1).toString(),
      activity.name_activity || 'Sin nombre',
      activity.store_name || 'Sin tienda',
      activity.game_name || 'Sin juego',
      activity.inscriptions_count?.toString() || '0'
    ]);
    
    autoTable(doc, {
      head: [['#', 'Actividad', 'Tienda', 'Juego', 'Participaciones']],
      body: allActivitiesData,
      startY: 50,
      theme: 'grid',
      headStyles: { 
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 50, halign: 'left' },
        2: { cellWidth: 40, halign: 'left' },
        3: { cellWidth: 40, halign: 'left' },
        4: { halign: 'center', cellWidth: 25 }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 170
    });
    
    // Página 3: Categorías
    doc.addPage();
    this.addCompanyLogo(doc);
    
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.text('RANKING DE CATEGORÍAS MÁS PARTICIPADAS', 20, 40);
    
    const allCategoriesData = data.gameCategoryParticipation.map((category, index) => [
      (index + 1).toString(),
      category.category || 'Sin categoría',
      category.participation_count?.toString() || '0',
      `${category.percentage?.toFixed(1) || '0'}%`
    ]);
    
    autoTable(doc, {
      head: [['#', 'Categoría', 'Participaciones', 'Porcentaje']],
      body: allCategoriesData,
      startY: 50,
      theme: 'grid',
      headStyles: { 
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { cellWidth: 90, halign: 'left' },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 30 }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 170
    });
  }

  /**
   * Añade el análisis de tendencias
   */
  private addTrendsAnalysis(doc: jsPDF, data: MonthlyReportData): void {
    doc.addPage();
    
    // Logo de la empresa
    this.addCompanyLogo(doc);
    
    // Título
    doc.setFontSize(16);
    doc.text('ANÁLISIS DE TENDENCIAS', 20, 50);
    
    // Análisis de crecimiento
    const analysis = this.generateTrendAnalysis(data);
    
    let y = 70; // Empezar directamente sin el título "Tendencias del período:"
    analysis.forEach(line => {
      // Dividir el texto en líneas que caben en el ancho de la página
      const maxWidth = doc.internal.pageSize.width - 60; // 30px margen izquierdo + 30px margen derecho
      const lines = doc.splitTextToSize(`• ${line}`, maxWidth);
      
      lines.forEach((lineText: string) => {
        doc.text(lineText, 30, y);
        y += 10; // Espaciado normal entre líneas
      });
      y += 8; // Espacio entre párrafos
    });
    
    // Recomendaciones
    doc.setFontSize(14);
    doc.text('RECOMENDACIONES', 20, y + 20);
    
    const recommendations = this.generateRecommendations(data);
    
    y += 40;
    recommendations.forEach(rec => {
      // Dividir el texto en líneas que caben en el ancho de la página
      const maxWidth = doc.internal.pageSize.width - 60; // 30px margen izquierdo + 30px margen derecho
      const lines = doc.splitTextToSize(`• ${rec}`, maxWidth);
      
      lines.forEach((line: string) => {
        doc.text(line, 30, y);
        y += 10; // Espaciado normal entre líneas
      });
      y += 8; // Espacio entre recomendaciones
    });
  }

  /**
   * Añade el pie de página
   */
  private addFooter(doc: jsPDF): void {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} - TCG Admin`, 14, doc.internal.pageSize.height - 10);
    }
  }

  /**
   * Convierte Blob a base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convierte base64 a Blob
   */
  private base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/pdf' });
  }

  /**
   * Guarda el reporte en la base de datos con PDF incluido
   */
  private async saveReportToDatabase(filters: MonthlyReportFilters, data: MonthlyReportData, pdfBlob: Blob): Promise<void> {
    try {
      const reportParams = {
        year: filters.year,
        month: filters.month,
        storeName: filters.storeName,
        gameName: filters.gameName,
        category: filters.category,
        includeCharts: filters.includeCharts,
        data: data
      };

      // Ya no necesitamos manejar id_store ya que se eliminó de la tabla

      // Obtener ID del usuario actual
      const currentUserId = await this.getCurrentUserId();

      // Convertir PDF a base64
      const pdfBase64 = await this.blobToBase64(pdfBlob);

      const { error } = await supabase
        .from('reports')
        .insert({
          id_users: currentUserId,
          report_type: `${filters.period}_report`,
          parameters: JSON.stringify(reportParams),
          pdf_data: pdfBase64 // Guardar PDF en el nuevo campo
        });

      if (error) {
        console.error('Error guardando reporte:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error guardando reporte en base de datos:', error);
      // No lanzar error para no interrumpir la descarga del PDF
    }
  }

  /**
   * Descarga un PDF desde la base de datos
   */
  async downloadReportPDF(reportId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('pdf_data, report_type, parameters')
        .eq('id_report', reportId)
        .single();

      if (error) throw error;

      if (!data.pdf_data) {
        throw new Error('No se encontró PDF en este reporte');
      }

      // Convertir base64 a Blob
      const pdfBlob = this.base64ToBlob(data.pdf_data);
      
      // Crear nombre de archivo basado en el tipo de reporte y fecha
      const params = JSON.parse(data.parameters);
      const periodSuffix = params.month ? `${params.month.toString().padStart(2, '0')}` :
                          params.quarter ? `Q${params.quarter}` :
                          params.semester ? `S${params.semester}` :
                          'anual';
      const filename = `reporte-${data.report_type.replace('_report', '')}-${params.year}-${periodSuffix}.pdf`;
      
      // Crear URL para descarga
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw new Error('No se pudo descargar el PDF del reporte');
    }
  }

  /**
   * Obtiene reportes guardados según el rol del usuario
   */
  async getSavedReports(limit: number = 50): Promise<SavedReport[]> {
    try {
      // Verificar si el usuario es admin
      const isAdmin = await this.isAdmin();
      const currentUserId = await this.getCurrentUserId();

      let query = supabase
        .from('reports')
        .select('*')
        .in('report_type', ['monthly_report', 'quarterly_report', 'semiannual_report', 'annual_report'])
        .order('date', { ascending: false })
        .limit(limit);

      // Si no es admin, solo mostrar reportes del usuario actual
      if (!isAdmin && currentUserId) {
        query = query.eq('id_users', currentUserId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(report => ({
        id: report.id_report,
        tipo_informe: report.report_type,
        fecha_generacion: report.date,
        parametros: JSON.parse(report.parameters || '{}'),
        data: JSON.parse(report.parameters || '{}').data
      })) || [];
    } catch (error) {
      console.error('Error obteniendo reportes guardados:', error);
      throw new Error('No se pudieron cargar los reportes guardados');
    }
  }

  /**
   * Obtiene el ID del usuario actual
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario actual es admin
   */
  private async isAdmin(): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const { data: userData } = await supabase
        .from('users')
        .select('id_role, roles(role_name)')
        .eq('id_user', userId)
        .single();

      return (userData?.roles as any)?.role_name === 'Admin';
    } catch (error) {
      console.error('Error verificando rol de admin:', error);
      return false;
    }
  }



  /**
   * Obtiene el ID de una tienda por su nombre
   */
  private async getStoreIdByName(storeName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id_store')
        .eq('name_store', storeName)
        .single();

      if (error) return null;
      return data?.id_store || null;
    } catch (error) {
      console.error('Error obteniendo ID de tienda:', error);
      return null;
    }
  }

  /**
   * Obtiene el ID de un juego por su nombre
   */
  private async getGameIdByName(gameName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id_game')
        .eq('name', gameName)
        .single();

      if (error) return null;
      return data?.id_game || null;
    } catch (error) {
      console.error('Error obteniendo ID de juego:', error);
      return null;
    }
  }

  /**
   * Obtiene lista de tiendas para filtros
   */
  async getStoresList(): Promise<{ id: string; name: string }[]> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id_store, name_store')
        .order('name_store');

      if (error) throw error;
      return data?.map(store => ({
        id: store.id_store,
        name: store.name_store || 'Sin nombre'
      })) || [];
    } catch (error) {
      console.error('Error obteniendo lista de tiendas:', error);
      return [];
    }
  }

  /**
   * Obtiene lista de juegos para filtros
   */
  async getGamesList(): Promise<{ id: string; name: string }[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id_game, name')
        .order('name');

      if (error) throw error;
      return data?.map(game => ({
        id: game.id_game,
        name: game.name || 'Sin nombre'
      })) || [];
    } catch (error) {
      console.error('Error obteniendo lista de juegos:', error);
      return [];
    }
  }

  /**
   * Calcula el porcentaje de crecimiento
   */
  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Genera análisis de tendencias
   */
  private generateTrendAnalysis(data: MonthlyReportData): string[] {
    const analysis: string[] = [];
    
    if (data.growthMetrics.activitiesGrowth > 0) {
      analysis.push(`Las actividades crecieron un ${data.growthMetrics.activitiesGrowth.toFixed(1)}% respecto al mes anterior`);
    } else if (data.growthMetrics.activitiesGrowth < 0) {
      analysis.push(`Las actividades disminuyeron un ${Math.abs(data.growthMetrics.activitiesGrowth).toFixed(1)}% respecto al mes anterior`);
    } else {
      analysis.push('Las actividades se mantuvieron estables respecto al mes anterior');
    }
    
    if (data.growthMetrics.searchesGrowth > 0) {
      analysis.push(`Las búsquedas crecieron un ${data.growthMetrics.searchesGrowth.toFixed(1)}% respecto al mes anterior`);
    } else if (data.growthMetrics.searchesGrowth < 0) {
      analysis.push(`Las búsquedas disminuyeron un ${Math.abs(data.growthMetrics.searchesGrowth).toFixed(1)}% respecto al mes anterior`);
    }
    
    return analysis;
  }

  /**
   * Genera recomendaciones basadas en los datos
   */
  private generateRecommendations(data: MonthlyReportData): string[] {
    const recommendations: string[] = [];
    
    if (data.growthMetrics.activitiesGrowth < -10) {
      recommendations.push('Considera aumentar la promoción de actividades para revertir la tendencia negativa');
    }
    
    if (data.topStores.length > 0) {
      const topStore = data.topStores[0];
      recommendations.push(`La tienda "${topStore.name_store}" es la más popular con ${topStore.visits} visitas`);
    }
    
    if (data.topGames.length > 0) {
      const topGame = data.topGames[0];
      recommendations.push(`El juego "${topGame.name}" es el más buscado con ${topGame.clicks} clics`);
    }
    
    if (data.activityTypes.length > 0) {
      const topCategory = data.activityTypes[0];
      recommendations.push(`La categoría "${topCategory.category}" representa el ${topCategory.percentage.toFixed(1)}% de las actividades`);
    }
    
    return recommendations;
  }

  /**
   * Crea un gráfico de torta usando jsPDF nativo (más confiable)
   */
  private addPieChart(doc: jsPDF, data: any[], labelKey: string, valueKey: string, x: number, y: number, width: number, height: number, title: string): void {
    if (!data || data.length === 0) {
      console.log('addPieChart: No hay datos disponibles');
      return;
    }

    try {
      // Debug: Verificar datos
      console.log('addPieChart - Datos recibidos:', data);
      console.log('addPieChart - labelKey:', labelKey, 'valueKey:', valueKey);
      
      // Título del gráfico
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text(title, x, y);
      
      // Calcular total para porcentajes
      const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
      console.log('addPieChart - Total calculado:', total);
      
      if (total === 0) {
        console.log('addPieChart: Total es 0, mostrando mensaje de no datos');
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'normal');
        doc.text('No hay datos disponibles', x, y + 30);
        return;
      }
      
      // Colores profesionales y vibrantes
      const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
        '#F43F5E', '#8B5A2B', '#059669', '#DC2626', '#7C3AED'
      ];
      
      // Configuración del gráfico
      const centerX = x + width / 2;
      const centerY = y + 30 + height / 2;
      const radius = Math.min(width, height) / 2 - 15;
      
      let currentAngle = -Math.PI / 2; // Empezar desde arriba
      
      // Dibujar cada segmento del gráfico de torta
      data.forEach((item, index) => {
        const value = item[valueKey] || 0;
        const percentage = value / total;
        const angle = percentage * 2 * Math.PI;
        
        if (angle > 0) { // Solo dibujar si hay valor
          // Color del segmento
          const color = colors[index % colors.length];
          const rgb = this.hexToRgb(color);
          doc.setFillColor(rgb.r, rgb.g, rgb.b);
          
          // Crear path para el segmento
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          // Dibujar el segmento usando path
          this.drawPieSegment(doc, centerX, centerY, radius, startAngle, endAngle);
          
          // Agregar porcentaje dentro del segmento si es lo suficientemente grande
          if (percentage > 0.05) { // Solo si el segmento es mayor al 5%
            const midAngle = (startAngle + endAngle) / 2;
            const labelRadius = radius * 0.6; // Posición del texto
            const labelX = centerX + labelRadius * Math.cos(midAngle);
            const labelY = centerY + labelRadius * Math.sin(midAngle);
            
            // Configurar texto para el porcentaje
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255); // Texto blanco
            doc.setFont('helvetica', 'bold');
            
            // Centrar el texto
            const percentageText = `${(percentage * 100).toFixed(1)}%`;
            const textWidth = doc.getTextWidth(percentageText);
            doc.text(percentageText, labelX - textWidth / 2, labelY + 2);
          }
          
          currentAngle += angle;
        }
      });
      
      // Dibujar círculo central blanco para efecto dona
      doc.setFillColor(255, 255, 255);
      doc.circle(centerX, centerY, radius * 0.35, 'F');
      
      // Borde del círculo central
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.circle(centerX, centerY, radius * 0.35, 'S');
      
      // Agregar leyenda compacta y clara
      const legendY = y + height + 15;
      const maxItemsPerRow = 3; // 3 columnas para mejor uso del espacio
      const legendItemWidth = width / maxItemsPerRow;
      
      // Título de la leyenda
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE DATOS:', x, legendY);
      
      data.slice(0, 6).forEach((item, index) => { // Limitar a 6 elementos para evitar sobrecarga
        const color = colors[index % colors.length];
        const rgb = this.hexToRgb(color);
        const legendX = x + (index % maxItemsPerRow) * legendItemWidth;
        const legendYPos = legendY + 10 + Math.floor(index / maxItemsPerRow) * 15;
        
        // Círculo de color
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.circle(legendX + 6, legendYPos + 3, 3, 'F');
        
        // Borde del círculo
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(1);
        doc.circle(legendX + 6, legendYPos + 3, 3, 'S');
        
        // Texto compacto
        doc.setFontSize(8);
        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'bold');
        const label = item[labelKey]?.length > 12 ? item[labelKey].substring(0, 12) + '...' : (item[labelKey] || 'Sin nombre');
        doc.text(`${index + 1}. ${label}`, legendX + 12, legendYPos + 1);
        
        // Valores compactos
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        const value = item[valueKey] || 0;
        const percentage = ((value / total) * 100).toFixed(1);
        doc.text(`${value} (${percentage}%)`, legendX + 12, legendYPos + 6);
      });
      
      // Si hay más de 6 elementos, mostrar indicador
      if (data.length > 6) {
        const moreItemsY = legendY + 10 + Math.ceil(6 / maxItemsPerRow) * 15;
        doc.setFontSize(7);
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'italic');
        doc.text(`... y ${data.length - 6} elementos más`, x, moreItemsY);
      }
      
    } catch (error) {
      console.error('Error creando gráfico de torta:', error);
      
      // Fallback: crear barras horizontales atractivas
      this.createHorizontalBarChart(doc, data, labelKey, valueKey, x, y, width, height, title);
    }
  }

  /**
   * Dibuja un segmento de torta correctamente
   */
  private drawPieSegment(doc: jsPDF, centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number): void {
    const steps = Math.max(10, Math.floor((endAngle - startAngle) * 10)); // Más pasos para segmentos más suaves
    const angleStep = (endAngle - startAngle) / steps;
    
    // Iniciar el path
    doc.moveTo(centerX, centerY);
    
    // Línea al inicio del arco
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    doc.lineTo(startX, startY);
    
    // Dibujar el arco
    for (let i = 1; i <= steps; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      doc.lineTo(x, y);
    }
    
    // Cerrar el segmento volviendo al centro
    doc.lineTo(centerX, centerY);
    
    // Rellenar el segmento
    doc.fill();
    
    // Dibujar borde del segmento
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.moveTo(centerX, centerY);
    doc.lineTo(startX, startY);
    
    for (let i = 1; i <= steps; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      doc.lineTo(x, y);
    }
    
    doc.lineTo(centerX, centerY);
    doc.stroke();
  }

  /**
   * Convierte color hex a RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Crea gráfico de barras horizontales como fallback mejorado
   */
  private createHorizontalBarChart(doc: jsPDF, data: any[], labelKey: string, valueKey: string, x: number, y: number, width: number, _height: number, title: string): void {
    // Título
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x, y);
    
    // Calcular total para normalización
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    
    if (maxValue === 0) {
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text('No hay datos disponibles', x, y + 30);
      return;
    }
    
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
    
    // Título de la leyenda
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE DATOS:', x, y + 15);
    
    // Dibujar barras mejoradas con información más clara
    data.slice(0, 8).forEach((item, index) => {
      const value = item[valueKey] || 0;
      const percentage = (value / maxValue) * 100;
      const barWidth = (percentage / 100) * (width - 140);
      const barY = y + 30 + (index * 20);
      
      // Color de la barra
      const color = colors[index % colors.length];
      const rgb = this.hexToRgb(color);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      
      // Dibujar barra con bordes redondeados simulados
      doc.rect(x + 5, barY - 4, barWidth, 12, 'F');
      
      // Borde de la barra
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.rect(x + 5, barY - 4, barWidth, 12, 'S');
      
      // Número de posición
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}`, x + 8, barY + 3);
      
      // Texto mejorado
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      const label = (item[labelKey] || 'Sin nombre').length > 16 ? (item[labelKey] || 'Sin nombre').substring(0, 16) + '...' : (item[labelKey] || 'Sin nombre');
      doc.text(`${label}`, x + 20, barY + 2);
      
      // Valor y porcentaje más claros
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      const percentageText = percentage.toFixed(1);
      doc.text(`Valor: ${value}`, x + 20, barY + 8);
      doc.text(`Relativo: ${percentageText}%`, x + barWidth + 25, barY + 2);
      
      // Porcentaje del total
      const totalPercentage = ((value / data.reduce((sum, item) => sum + (item[valueKey] || 0), 0)) * 100).toFixed(1);
      doc.text(`Total: ${totalPercentage}%`, x + barWidth + 25, barY + 8);
    });
    
    // Resumen estadístico para barras
    const summaryY = y + 30 + (Math.min(data.length, 8) * 20) + 15;
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(x, summaryY, x + width, summaryY);
    
    // Resumen estadístico
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN ESTADÍSTICO:', x, summaryY + 8);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    
    const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
    const topItem = data[0];
    const topPercentage = ((topItem[valueKey] || 0) / total * 100).toFixed(1);
    doc.text(`• Total de elementos mostrados: ${Math.min(data.length, 8)}`, x, summaryY + 18);
    doc.text(`• Total de valores: ${total}`, x, summaryY + 26);
    doc.text(`• Elemento líder: ${topItem[labelKey] || 'Sin nombre'} (${topPercentage}%)`, x, summaryY + 34);
  }

  /**
   * Genera análisis específico para tiendas según el período
   */
  private generateStoresAnalysis(data: MonthlyReportData, filters: MonthlyReportFilters): string[] {
    const analysis: string[] = [];
    
    if (data.topStores.length === 0) {
      analysis.push('No hay datos de tiendas para este período');
      return analysis;
    }

    const topStore = data.topStores[0];
    const periodText = this.getPeriodText(filters);
    
    // Insight principal: Tienda líder
    analysis.push(`• LIDER: La tienda "${topStore.name_store}" lidera el ranking con ${topStore.visits} visitas ${periodText}`);
    
    // Insight de crecimiento (simulado)
    if (data.topStores.length > 1) {
      const secondStore = data.topStores[1];
      const growthRate = ((topStore.visits - secondStore.visits) / secondStore.visits * 100).toFixed(1);
      analysis.push(`• CRECIMIENTO: La tienda "${topStore.name_store}" supera a "${secondStore.name_store}" en un ${growthRate}%`);
    }
    
    // Insight de distribución
    const totalVisits = data.topStores.reduce((sum, store) => sum + store.visits, 0);
    const topStorePercentage = ((topStore.visits / totalVisits) * 100).toFixed(1);
    analysis.push(`• CONCENTRACIÓN: La tienda líder concentra el ${topStorePercentage}% del total de visitas`);
    
    // Insight de competencia
    if (data.topStores.length >= 3) {
      const thirdStore = data.topStores[2];
      analysis.push(`• TERCER LUGAR: "${thirdStore.name_store}" con ${thirdStore.visits} visitas`);
    }
    
    // Insight de rendimiento
    const avgVisits = (totalVisits / data.topStores.length).toFixed(1);
    const aboveAverage = data.topStores.filter(store => store.visits > parseFloat(avgVisits)).length;
    analysis.push(`• RENDIMIENTO: ${aboveAverage} de ${data.topStores.length} tiendas superan el promedio de ${avgVisits} visitas`);
    
    // Insight temporal según período
    if (filters.period === 'annual') {
      analysis.push('• TENDENCIA ANUAL: Las tiendas muestran tendencias estacionales claras');
    } else if (filters.period === 'quarterly') {
      analysis.push('• TENDENCIA TRIMESTRAL: Se observan patrones de crecimiento por trimestre');
    } else if (filters.period === 'semiannual') {
      analysis.push('• TENDENCIA SEMESTRAL: Las tendencias muestran evolución a mediano plazo');
    } else {
      analysis.push('• TENDENCIA MENSUAL: Se detectan fluctuaciones típicas del corto plazo');
    }
    
    return analysis;
  }

  /**
   * Genera análisis específico para juegos según el período
   */
  private generateGamesAnalysis(data: MonthlyReportData, filters: MonthlyReportFilters): string[] {
    const analysis: string[] = [];
    
    if (data.topGames.length === 0) {
      analysis.push('No hay datos de juegos para este período');
      return analysis;
    }

    const topGame = data.topGames[0];
    const periodText = this.getPeriodText(filters);
    
    // Insight principal: Juego más popular
    analysis.push(`• LIDER: El juego "${topGame.name}" es el más popular con ${topGame.clicks} clics ${periodText}`);
    
    // Insight de dominancia
    const totalClicks = data.topGames.reduce((sum, game) => sum + game.clicks, 0);
    const topGamePercentage = ((topGame.clicks / totalClicks) * 100).toFixed(1);
    analysis.push(`• CONCENTRACIÓN: "${topGame.name}" concentra el ${topGamePercentage}% del total de clics`);
    
    // Insight de categoría dominante
    const categoryCount = new Map<string, number>();
    const categoryClicks = new Map<string, number>();
    
    data.topGames.forEach(game => {
      const category = game.category || 'Sin categoría';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      categoryClicks.set(category, (categoryClicks.get(category) || 0) + game.clicks);
    });
    
    // Insight de competencia
    if (data.topGames.length > 1) {
      const secondGame = data.topGames[1];
      const gap = topGame.clicks - secondGame.clicks;
      analysis.push(`• SEGUNDO LUGAR: "${secondGame.name}" con ${secondGame.clicks} clics (diferencia: ${gap})`);
    }
    
    
    // Insight de rendimiento
    const avgClicks = (totalClicks / data.topGames.length).toFixed(1);
    const aboveAverage = data.topGames.filter(game => game.clicks > parseFloat(avgClicks)).length;
    analysis.push(`• RENDIMIENTO: ${aboveAverage} de ${data.topGames.length} juegos superan el promedio de ${avgClicks} clics`);
    
    // Insight temporal según período
    if (filters.period === 'annual') {
      analysis.push('• TENDENCIA ANUAL: Se observan tendencias de popularidad a largo plazo');
    } else if (filters.period === 'quarterly') {
      analysis.push('• TENDENCIA TRIMESTRAL: Los juegos muestran ciclos de popularidad');
    } else if (filters.period === 'semiannual') {
      analysis.push('• TENDENCIA SEMESTRAL: Se detectan cambios en las preferencias de los usuarios');
    } else {
      analysis.push('• TENDENCIA MENSUAL: Los juegos muestran variaciones rápidas en popularidad');
    }
    
    return analysis;
  }

  /**
   * Genera análisis específico para categorías según el período
   */
  private generateCategoriesAnalysis(data: MonthlyReportData, filters: MonthlyReportFilters): string[] {
    const analysis: string[] = [];
    
    if (data.gameCategoryParticipation.length === 0) {
      analysis.push('No hay datos de categorías para este período');
      return analysis;
    }

    const topCategory = data.gameCategoryParticipation[0];
    const periodText = this.getPeriodText(filters);
    
    // Insight principal: Categoría dominante
    analysis.push(`• LIDER: La categoría "${topCategory.category}" domina con ${topCategory.percentage.toFixed(1)}% de participación ${periodText}`);
    
    // Insight de dominancia
    const totalParticipation = data.gameCategoryParticipation.reduce((sum, cat) => sum + cat.participation_count, 0);
    const topCategoryCount = topCategory.participation_count;
    analysis.push(`• CONCENTRACIÓN: "${topCategory.category}" concentra ${topCategoryCount} de ${totalParticipation} participaciones totales`);
    
    // Insight de competencia
    if (data.gameCategoryParticipation.length > 1) {
      const secondCategory = data.gameCategoryParticipation[1];
      const gap = topCategory.percentage - secondCategory.percentage;
      analysis.push(`• SEGUNDO LUGAR: "${secondCategory.category}" con ${secondCategory.percentage.toFixed(1)}% (diferencia: ${gap.toFixed(1)}%)`);
    }
    
    
    // Insight de concentración
    const top3Percentage = data.gameCategoryParticipation.slice(0, 3).reduce((sum, cat) => sum + cat.percentage, 0);
    analysis.push(`• CONCENTRACIÓN TOP 3: Las top 3 categorías concentran el ${top3Percentage.toFixed(1)}% de la participación total`);
    
    // Insight de distribución
    const totalCategories = data.gameCategoryParticipation.length;
    const aboveAverage = data.gameCategoryParticipation.filter(cat => cat.percentage > (100 / totalCategories)).length;
    analysis.push(`• RENDIMIENTO: ${aboveAverage} de ${totalCategories} categorías superan el promedio de participación`);
    
    // Insight de estabilidad
    if (data.gameCategoryParticipation.length >= 3) {
      const thirdCategory = data.gameCategoryParticipation[2];
      analysis.push(`• TERCER LUGAR: "${thirdCategory.category}" con ${thirdCategory.percentage.toFixed(1)}%`);
    }
    
    // Insight temporal según período
    if (filters.period === 'annual') {
      analysis.push('• TENDENCIA ANUAL: Las categorías muestran estabilidad en las preferencias');
    } else if (filters.period === 'quarterly') {
      analysis.push('• TENDENCIA TRIMESTRAL: Se observan cambios estacionales en las categorías');
    } else if (filters.period === 'semiannual') {
      analysis.push('• TENDENCIA SEMESTRAL: Las categorías evolucionan según las tendencias del mercado');
    } else {
      analysis.push('• TENDENCIA MENSUAL: Las categorías muestran variaciones según eventos y promociones');
    }
    
    return analysis;
  }

  /**
   * Obtiene el texto descriptivo del período
   */
  private getPeriodText(filters: MonthlyReportFilters): string {
    switch (filters.period) {
      case 'monthly':
        return `en ${this.getMonthName(filters.month!)} ${filters.year}`;
      case 'quarterly':
        return `en Q${filters.quarter} ${filters.year}`;
      case 'semiannual':
        return `en el ${filters.semester === 1 ? 'primer' : 'segundo'} semestre de ${filters.year}`;
      case 'annual':
        return `en el año ${filters.year}`;
      default:
        return '';
    }
  }

  /**
   * Obtiene el nombre del mes
   */
  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
  }

  /**
   * Agrega el logo de la empresa en la esquina superior derecha
   */
  private addCompanyLogo(doc: jsPDF): void {
    try {
      // Logo de la empresa (logo_Slogan_BF.png)
      // El logo se carga desde la carpeta dist/assets
      const logoPath = '/assets/logo_Slogan_BF.png';
      
      // Intentar cargar la imagen del logo
      try {
        // Agregar la imagen del logo en la esquina superior derecha
        doc.addImage(logoPath, 'PNG', doc.internal.pageSize.width - 80, 10, 60, 25);
      } catch (imageError) {
        console.warn('No se pudo cargar la imagen del logo, usando texto como fallback:', imageError);
        
        // Fallback: crear un logo simple con texto si no se puede cargar la imagen
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204); // Azul corporativo
        doc.text('TCG ADMIN', doc.internal.pageSize.width - 60, 25);
        
        // Línea decorativa
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(2);
        doc.line(doc.internal.pageSize.width - 60, 30, doc.internal.pageSize.width - 20, 30);
        
        // Subtítulo
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Sistema de Gestión', doc.internal.pageSize.width - 60, 35);
      }
    } catch (error) {
      console.error('Error agregando logo:', error);
    }
  }
}

export const monthlyReportService = new MonthlyReportService();
