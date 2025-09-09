import { supabaseAdmin } from '../lib/supabaseAdmin';

// Tipos para las analíticas
export interface StoreAnalytics {
  id_store: string;
  name_store: string;
  visits: number;
  unique_users: number;
  activities_count: number;
  inscriptions_count: number;
}

export interface GameAnalytics {
  id_game: string;
  name: string;
  clicks: number;
  unique_users: number;
  activities_count: number;
  category: string;
}

export interface ActivityAnalytics {
  id_activity: string;
  name_activity: string;
  inscriptions_count: number;
  unique_users: number;
  category: string;
  store_name: string;
  game_name: string;
  date: string;
}

export interface ActivityTypeAnalytics {
  category: string;
  count: number;
  percentage: number;
  total_inscriptions: number;
}

export interface GameCategoryParticipation {
  category: string;
  participation_count: number;
  percentage: number;
  unique_users: number;
}

export interface UserAnalytics {
  id_user: string;
  first_name: string;
  last_name: string;
  total_searches: number;
  total_inscriptions: number;
  last_activity: string;
  role_name: string;
}

export interface TrendData {
  period: string;
  searches: number;
  activities: number;
  inscriptions: number;
  users: number;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalSearches: number;
  totalActivities: number;
  totalInscriptions: number;
  totalStores: number;
  totalGames: number;
  topStores: StoreAnalytics[];
  topGames: GameAnalytics[];
  topPlayedGames: GameAnalytics[];
  topActivities: ActivityAnalytics[];
  activityTypes: ActivityTypeAnalytics[];
  gameCategoryParticipation: GameCategoryParticipation[];
  trends: TrendData[];
}

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  storeId?: string;
  gameId?: string;
  category?: string;
  limit?: number;
}

/**
 * Servicio para obtener analíticas del sistema
 */
class AnalyticsService {
  
  /**
   * Obtiene las métricas principales del dashboard
   */
  async getDashboardMetrics(filters?: ReportFilters): Promise<DashboardMetrics> {
    try {
      const [
        totalUsers,
        totalSearches,
        totalActivities,
        totalInscriptions,
        totalStores,
        totalGames,
        topStores,
        topGames,
        topPlayedGames,
        topActivities,
        activityTypes,
        gameCategoryParticipation,
        trends
      ] = await Promise.all([
        this.getTotalUsers(filters),
        this.getTotalSearches(filters),
        this.getTotalActivities(filters),
        this.getTotalInscriptions(filters),
        this.getTotalStores(filters),
        this.getTotalGames(filters),
        this.getTopStores(filters),
        this.getTopGames(filters),
        this.getTopPlayedGames(filters),
        this.getTopActivities(filters),
        this.getActivityTypes(filters),
        this.getGameCategoryParticipation(filters),
        this.getTrends(filters)
      ]);

      return {
        totalUsers,
        totalSearches,
        totalActivities,
        totalInscriptions,
        totalStores,
        totalGames,
        topStores,
        topGames,
        topPlayedGames,
        topActivities,
        activityTypes,
        gameCategoryParticipation,
        trends
      };
    } catch (error) {
      console.error('Error obteniendo métricas del dashboard:', error);
      throw new Error('No se pudieron cargar las métricas del dashboard');
    }
  }

  /**
   * Obtiene las tiendas más visitadas
   */
  async getTopStores(filters?: ReportFilters): Promise<StoreAnalytics[]> {
    try {
      // Obtener todas las actividades desde history que tengan id_stores
      let historyQuery = supabaseAdmin
        .from('history')
        .select('id_stores, store_name, id_users, tipe_activity, date_history')
        .not('id_stores', 'is', null); // Obtener todos los registros que tengan tienda

      if (filters?.dateFrom) {
        historyQuery = historyQuery.gte('date_history', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        historyQuery = historyQuery.lte('date_history', filters.dateTo.toISOString());
      }

      const { data: historyData, error: historyError } = await historyQuery;
      
      if (historyError) throw historyError;

      // Agrupar por tienda
      const storeMap = new Map<string, StoreAnalytics>();
      const uniqueUsers = new Set<string>();
      
      historyData?.forEach(record => {
        const storeId = record.id_stores;
        const storeName = record.store_name || 'Sin nombre';
        
        if (!storeMap.has(storeId)) {
          storeMap.set(storeId, {
            id_store: storeId,
            name_store: storeName,
            visits: 0,
            unique_users: 0,
            activities_count: 0,
            inscriptions_count: 0
          });
        }
        
        const store = storeMap.get(storeId)!;
        store.visits++; // Contar todas las interacciones como visitas
        
        // Contar usuarios únicos
        if (record.id_users) {
          uniqueUsers.add(record.id_users);
        }
        
        // Contar actividades específicas
        if (record.tipe_activity === 'VIEW_ACTIVITY') {
          store.activities_count++;
        }
        
        // Contar inscripciones específicas
        if (record.tipe_activity === 'INSCRIPTION') {
          store.inscriptions_count++;
        }
      });

      // Actualizar usuarios únicos
      Array.from(storeMap.values()).forEach(store => {
        store.unique_users = uniqueUsers.size;
      });

      return Array.from(storeMap.values())
        .sort((a, b) => b.visits - a.visits)
        .slice(0, filters?.limit || 10);

    } catch (error) {
      console.error('Error obteniendo tiendas más visitadas:', error);
      throw new Error('No se pudieron cargar las tiendas más visitadas');
    }
  }

  /**
   * Obtiene los juegos más jugados en actividades
   */
  async getTopPlayedGames(filters?: ReportFilters): Promise<GameAnalytics[]> {
    try {
      // Obtener juegos desde history usando game_name
      let historyQuery = supabaseAdmin
        .from('history')
        .select('game_name, id_users, tipe_activity, date_history')
        .not('game_name', 'is', null);

      if (filters?.dateFrom) {
        historyQuery = historyQuery.gte('date_history', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        historyQuery = historyQuery.lte('date_history', filters.dateTo.toISOString());
      }

      const { data: historyData, error: historyError } = await historyQuery;

      if (historyError) throw historyError;

      // Obtener todos los juegos para mapear nombres a categorías
      const { data: gamesData, error: gamesError } = await supabaseAdmin
        .from('games')
        .select('id_game, name, category');

      if (gamesError) throw gamesError;

      // Crear mapa de juegos por nombre
      const gamesMap = new Map<string, { id_game: string; category: string }>();
      gamesData?.forEach(game => {
        if (game.name) {
          gamesMap.set(game.name, {
            id_game: game.id_game,
            category: game.category || 'Sin categoría'
          });
        }
      });

      // Agrupar por juego
      const gameMap = new Map<string, GameAnalytics>();
      const uniqueUsers = new Set<string>();
      
      historyData?.forEach(record => {
        const gameName = record.game_name;
        const gameInfo = gamesMap.get(gameName);
        
        if (!gameMap.has(gameName)) {
          gameMap.set(gameName, {
            id_game: gameInfo?.id_game || gameName,
            name: gameName,
            clicks: 0,
            unique_users: 0,
            activities_count: 0,
            category: gameInfo?.category || 'Sin categoría'
          });
        }
        
        const game = gameMap.get(gameName)!;
        game.clicks++; // Contar cada actividad como "juego"
        game.activities_count++; // Contar actividades
        
        // Contar usuarios únicos
        if (record.id_users) {
          uniqueUsers.add(record.id_users);
        }
      });

      // Actualizar usuarios únicos
      Array.from(gameMap.values()).forEach(game => {
        game.unique_users = uniqueUsers.size;
      });

      return Array.from(gameMap.values())
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, filters?.limit || 10);

    } catch (error) {
      console.error('Error obteniendo juegos más jugados:', error);
      throw new Error('No se pudieron cargar los juegos más jugados');
    }
  }

  /**
   * Obtiene los juegos más clickeados
   */
  async getTopGames(filters?: ReportFilters): Promise<GameAnalytics[]> {
    try {
      // Obtener búsquedas TCG desde searches
      let searchesQuery = supabaseAdmin
        .from('searches')
        .select('search_term, total_searches, id_user')
        .eq('search_type', 'TCG');

      if (filters?.dateFrom) {
        searchesQuery = searchesQuery.gte('date_time', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        searchesQuery = searchesQuery.lte('date_time', filters.dateTo.toISOString());
      }

      const { data: searchesData, error: searchesError } = await searchesQuery;

      if (searchesError) throw searchesError;

      // Obtener todos los juegos para mapear nombres a categorías
      const { data: gamesData, error: gamesError } = await supabaseAdmin
        .from('games')
        .select('id_game, name, category');

      if (gamesError) throw gamesError;

      // Crear mapa de juegos por nombre
      const gamesMap = new Map<string, { id_game: string; category: string }>();
      gamesData?.forEach(game => {
        if (game.name) {
          gamesMap.set(game.name, {
            id_game: game.id_game,
            category: game.category || 'Sin categoría'
          });
        }
      });

      // Agrupar búsquedas por término
      const gameMap = new Map<string, GameAnalytics>();
      const uniqueUsers = new Set<string>();
      
      searchesData?.forEach(record => {
        const gameName = record.search_term;
        const gameInfo = gamesMap.get(gameName);
        
        if (!gameMap.has(gameName)) {
          gameMap.set(gameName, {
            id_game: gameInfo?.id_game || gameName,
            name: gameName,
            clicks: 0,
            unique_users: 0,
            activities_count: 0,
            category: gameInfo?.category || 'Sin categoría'
          });
        }
        
        const game = gameMap.get(gameName)!;
        game.clicks += record.total_searches || 0;
        
        // Contar usuarios únicos
        if (record.id_user) {
          uniqueUsers.add(record.id_user);
        }
      });

      // Obtener actividades por juego desde history
      const { data: activitiesHistory } = await supabaseAdmin
        .from('history')
        .select('id_activity, activity_name, tipe_activity')
        .eq('tipe_activity', 'VIEW_ACTIVITY');

      activitiesHistory?.forEach(record => {
        const gameName = record.activity_name;
        if (gameName && gameMap.has(gameName)) {
          const game = gameMap.get(gameName)!;
          game.activities_count++;
        }
      });

      // Actualizar usuarios únicos
      Array.from(gameMap.values()).forEach(game => {
        game.unique_users = uniqueUsers.size;
      });

      return Array.from(gameMap.values())
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, filters?.limit || 10);

    } catch (error) {
      console.error('Error obteniendo juegos más clickeados:', error);
      throw new Error('No se pudieron cargar los juegos más clickeados');
    }
  }

  /**
   * Obtiene las actividades más concurridas (por tipe_activity más popular)
   */
  async getTopActivities(filters?: ReportFilters): Promise<ActivityAnalytics[]> {
    try {
      // Obtener todas las actividades desde history para contar por tipe_activity
      let activitiesQuery = supabaseAdmin
        .from('history')
        .select('id_activity, activity_name, store_name, game_name, tipe_activity, date_history, id_users')
        .not('tipe_activity', 'is', null);

      if (filters?.dateFrom) {
        activitiesQuery = activitiesQuery.gte('date_history', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        activitiesQuery = activitiesQuery.lte('date_history', filters.dateTo.toISOString());
      }

      const { data: activitiesData, error: activitiesError } = await activitiesQuery;

      if (activitiesError) throw activitiesError;

      // Obtener categorías de juegos para mapear
      const { data: gamesData } = await supabaseAdmin
        .from('games')
        .select('name, category');

      const gamesMap = new Map<string, string>();
      gamesData?.forEach(game => {
        if (game.name) {
          gamesMap.set(game.name, game.category || 'Sin categoría');
        }
      });

      // Agrupar por activity_name (nombre de la actividad más popular)
      const activityMap = new Map<string, ActivityAnalytics>();
      const uniqueUsers = new Set<string>();
      
      activitiesData?.forEach(record => {
        const activityName = record.activity_name || 'Sin nombre';
        const gameName = record.game_name || 'Sin juego';
        const category = gamesMap.get(gameName) || 'Sin categoría';
        
        if (!activityMap.has(activityName)) {
          activityMap.set(activityName, {
            id_activity: record.id_activity || activityName, // Usar id_activity o activity_name como ID
            name_activity: activityName, // Mostrar el nombre real de la actividad
            inscriptions_count: 0,
            unique_users: 0,
            category: category,
            store_name: record.store_name || 'Sin tienda',
            game_name: gameName,
            date: record.date_history ? new Date(record.date_history).toISOString().split('T')[0] : ''
          });
        }
        
        const activityData = activityMap.get(activityName)!;
        activityData.inscriptions_count++; // Contar ocurrencias de la actividad
        
        // Contar usuarios únicos
        if (record.id_users) {
          uniqueUsers.add(record.id_users);
        }
      });

      // Actualizar usuarios únicos
      Array.from(activityMap.values()).forEach(activity => {
        activity.unique_users = uniqueUsers.size;
      });

      return Array.from(activityMap.values())
        .sort((a, b) => b.inscriptions_count - a.inscriptions_count)
        .slice(0, filters?.limit || 10);

    } catch (error) {
      console.error('Error obteniendo actividades más concurridas:', error);
      throw new Error('No se pudieron cargar las actividades más concurridas');
    }
  }

  /**
   * Obtiene los tipos de actividad más populares
   */
  async getActivityTypes(filters?: ReportFilters): Promise<ActivityTypeAnalytics[]> {
    try {
      // Obtener inscripciones desde history con datos de actividades
      let inscriptionsQuery = supabaseAdmin
        .from('history')
        .select('id_activity, activity_name, game_name, tipe_activity, date_history')
        .eq('tipe_activity', 'INSCRIPTION');

      if (filters?.dateFrom) {
        inscriptionsQuery = inscriptionsQuery.gte('date_history', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        inscriptionsQuery = inscriptionsQuery.lte('date_history', filters.dateTo.toISOString());
      }

      const { data: inscriptionsData, error: inscriptionsError } = await inscriptionsQuery;

      if (inscriptionsError) throw inscriptionsError;

      // Obtener categorías de juegos para mapear
      const { data: gamesData } = await supabaseAdmin
        .from('games')
        .select('name, category');

      const gamesMap = new Map<string, string>();
      gamesData?.forEach(game => {
        if (game.name) {
          gamesMap.set(game.name, game.category || 'Sin categoría');
        }
      });

      // Agrupar por categoría
      const categoryMap = new Map<string, ActivityTypeAnalytics>();
      
      inscriptionsData?.forEach(record => {
        const gameName = record.game_name || 'Sin juego';
        const category = gamesMap.get(gameName) || 'Sin categoría';
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            count: 0,
            percentage: 0,
            total_inscriptions: 0
          });
        }
        
        const categoryData = categoryMap.get(category)!;
        categoryData.count++;
        categoryData.total_inscriptions++;
      });

      // Calcular porcentajes
      const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.count, 0);
      
      Array.from(categoryMap.values()).forEach(cat => {
        cat.percentage = total > 0 ? (cat.count / total) * 100 : 0;
      });

      return Array.from(categoryMap.values())
        .sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Error obteniendo tipos de actividad:', error);
      throw new Error('No se pudieron cargar los tipos de actividad');
    }
  }

  /**
   * Obtiene las tendencias temporales
   */
  async getTrends(filters?: ReportFilters): Promise<TrendData[]> {
    try {
      const startDate = filters?.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás
      const endDate = filters?.dateTo || new Date();

      // Obtener datos de búsquedas por día
      const { data: searchesData } = await supabaseAdmin
        .from('searches')
        .select('date_time, total_searches')
        .eq('search_type', 'TCG')
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString());

      // Obtener datos de actividades por día desde history
      const { data: activitiesData } = await supabaseAdmin
        .from('history')
        .select('date_history, tipe_activity')
        .eq('tipe_activity', 'VIEW_ACTIVITY')
        .gte('date_history', startDate.toISOString())
        .lte('date_history', endDate.toISOString());

      // Obtener datos de inscripciones por día desde history
      const { data: inscriptionsData } = await supabaseAdmin
        .from('history')
        .select('date_history, tipe_activity')
        .eq('tipe_activity', 'INSCRIPTION')
        .gte('date_history', startDate.toISOString())
        .lte('date_history', endDate.toISOString());

      // Agrupar por día
      const trendsMap = new Map<string, TrendData>();
      
      // Procesar búsquedas
      searchesData?.forEach(record => {
        const date = new Date(record.date_time).toISOString().split('T')[0];
        if (!trendsMap.has(date)) {
          trendsMap.set(date, {
            period: date,
            searches: 0,
            activities: 0,
            inscriptions: 0,
            users: 0
          });
        }
        trendsMap.get(date)!.searches += record.total_searches || 0;
      });

      // Procesar actividades
      activitiesData?.forEach(record => {
        const date = new Date(record.date_history).toISOString().split('T')[0];
        if (!trendsMap.has(date)) {
          trendsMap.set(date, {
            period: date,
            searches: 0,
            activities: 0,
            inscriptions: 0,
            users: 0
          });
        }
        trendsMap.get(date)!.activities += 1;
      });

      // Procesar inscripciones
      inscriptionsData?.forEach(record => {
        const date = new Date(record.date_history).toISOString().split('T')[0];
        if (!trendsMap.has(date)) {
          trendsMap.set(date, {
            period: date,
            searches: 0,
            activities: 0,
            inscriptions: 0,
            users: 0
          });
        }
        trendsMap.get(date)!.inscriptions += 1;
      });

      return Array.from(trendsMap.values())
        .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

    } catch (error) {
      console.error('Error obteniendo tendencias:', error);
      throw new Error('No se pudieron cargar las tendencias');
    }
  }

  /**
   * Obtiene el total de usuarios
   */
  private async getTotalUsers(_filters?: ReportFilters): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de usuarios:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de búsquedas
   */
  private async getTotalSearches(filters?: ReportFilters): Promise<number> {
    try {
      let query = supabaseAdmin
        .from('searches')
        .select('total_searches', { count: 'exact', head: true })
        .eq('search_type', 'TCG');

      if (filters?.dateFrom) {
        query = query.gte('date_time', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte('date_time', filters.dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data?.reduce((sum, record) => sum + (record.total_searches || 0), 0) || 0;
    } catch (error) {
      console.error('Error obteniendo total de búsquedas:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de actividades
   */
  private async getTotalActivities(filters?: ReportFilters): Promise<number> {
    try {
      let query = supabaseAdmin
        .from('activities')
        .select('*', { count: 'exact', head: true });

      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom.toISOString().split('T')[0]);
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo.toISOString().split('T')[0]);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de actividades:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de inscripciones
   */
  private async getTotalInscriptions(filters?: ReportFilters): Promise<number> {
    try {
      let query = supabaseAdmin
        .from('inscriptions')
        .select('*', { count: 'exact', head: true });

      if (filters?.dateFrom) {
        query = query.gte('inscription_date', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte('inscription_date', filters.dateTo.toISOString());
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de inscripciones:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de tiendas
   */
  private async getTotalStores(_filters?: ReportFilters): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('stores')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de tiendas:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de juegos
   */
  private async getTotalGames(_filters?: ReportFilters): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('games')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de juegos:', error);
      return 0;
    }
  }

  /**
   * Obtiene las categorías de juego más participadas basadas en history.tipe_activity
   */
  async getGameCategoryParticipation(filters?: ReportFilters): Promise<GameCategoryParticipation[]> {
    try {
      // Obtener datos de history con tipe_activity
      let historyQuery = supabaseAdmin
        .from('history')
        .select('tipe_activity, game_name, id_users, date_history')
        .not('tipe_activity', 'is', null)
        .not('game_name', 'is', null);

      if (filters?.dateFrom) {
        historyQuery = historyQuery.gte('date_history', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        historyQuery = historyQuery.lte('date_history', filters.dateTo.toISOString());
      }

      const { data: historyData, error: historyError } = await historyQuery;

      if (historyError) throw historyError;

      // Obtener categorías de juegos para mapear
      const { data: gamesData } = await supabaseAdmin
        .from('games')
        .select('name, category');

      const gamesMap = new Map<string, string>();
      gamesData?.forEach(game => {
        if (game.name) {
          gamesMap.set(game.name, game.category || 'Sin categoría');
        }
      });

      // Agrupar por categoría de juego
      const categoryMap = new Map<string, GameCategoryParticipation>();
      const uniqueUsers = new Set<string>();
      
      historyData?.forEach(record => {
        const gameName = record.game_name || 'Sin juego';
        const category = gamesMap.get(gameName) || 'Sin categoría';
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            participation_count: 0,
            percentage: 0,
            unique_users: 0
          });
        }
        
        const categoryData = categoryMap.get(category)!;
        categoryData.participation_count++; // Contar cada participación
        
        // Contar usuarios únicos por categoría
        if (record.id_users) {
          uniqueUsers.add(record.id_users);
        }
      });

      // Calcular porcentajes
      const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.participation_count, 0);
      
      Array.from(categoryMap.values()).forEach(cat => {
        cat.percentage = total > 0 ? (cat.participation_count / total) * 100 : 0;
        cat.unique_users = uniqueUsers.size;
      });

      return Array.from(categoryMap.values())
        .sort((a, b) => b.participation_count - a.participation_count)
        .slice(0, filters?.limit || 10);

    } catch (error) {
      console.error('Error obteniendo categorías de juego más participadas:', error);
      throw new Error('No se pudieron cargar las categorías de juego más participadas');
    }
  }

  /**
   * Obtiene los usuarios más activos
   */
  async getTopUsers(filters?: ReportFilters): Promise<UserAnalytics[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
          id_user,
          first_name,
          last_name,
          total_searches,
          total_inscriptions,
          last_activity,
          roles!inner(role_name)
        `)
        .order('total_searches', { ascending: false })
        .limit(filters?.limit || 10);

      if (error) throw error;

      return data?.map(user => ({
        id_user: user.id_user,
        first_name: user.first_name || 'Sin nombre',
        last_name: user.last_name || 'Sin apellido',
        total_searches: user.total_searches || 0,
        total_inscriptions: user.total_inscriptions || 0,
        last_activity: user.last_activity || '',
        role_name: (user.roles as any)?.role_name || 'Sin rol'
      })) || [];

    } catch (error) {
      console.error('Error obteniendo usuarios más activos:', error);
      throw new Error('No se pudieron cargar los usuarios más activos');
    }
  }
}

export const analyticsService = new AnalyticsService();
