import { supabase } from '../lib/supabaseClient'
import type { Game } from '../types/database'

export async function getGames(): Promise<Game[]> {
  console.log('GamesService: Fetching games from Supabase');
  const { data, error } = await supabase
    .from('games')
    .select('id_game, name, description, min_age, max_age, min_players, max_players, min_duration, max_duration, category, created_at, updated_at')
    .order('name')

  if (error) {
    console.error('GamesService: Error fetching games:', error);
    throw error
  }
  return data || []
}

export async function getGame(id: string): Promise<Game | null> {
  console.log(`GamesService: Fetching game ${id} from Supabase`);
  const { data, error } = await supabase
    .from('games')
    .select('id_game, name, description, min_age, max_age, min_players, max_players, min_duration, max_duration, category, created_at, updated_at')
    .eq('id_game', id)
    .single()

  if (error) {
    console.error(`GamesService: Error fetching game ${id}:`, error);
    if (error.code === 'PGRST116') return null;
    throw error
  }
  return data
}

export async function createGame(game: Omit<Game, 'id_game' | 'created_at' | 'updated_at'>): Promise<Game> {
  console.log('GamesService: Creating game in Supabase:', game);
  
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select()
    .single()

  if (error) {
    throw error
  }
  
  return data
}

export async function updateGame(id: string, gameUpdate: Partial<Game>): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .update(gameUpdate)
    .eq('id_game', id)
    .select()
    .single()

  if (error) {
    throw error
  }
  return data
}

export async function deleteGame(id: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id_game', id)

  if (error) {
    throw error
  }
}

// Función para obtener juegos por tienda usando la tabla activities
export async function getStoreGames(storeId: string): Promise<any[]> {
  if (!storeId) {
    return [];
  }

  try {
    // Obtener actividades de la tienda y luego los juegos asociados
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id_game')
      .eq('id_store', storeId)
      .not('id_game', 'is', null);

    if (activitiesError) {
      throw activitiesError;
    }

    if (!activities || activities.length === 0) {
      return [];
    }

    // Obtener los IDs únicos de juegos
    const gameIds = [...new Set(activities.map(a => a.id_game).filter(Boolean))];

    if (gameIds.length === 0) {
      return [];
    }

    // Obtener los juegos
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id_game, name, description, min_age, max_age, min_players, max_players, min_duration, max_duration, category, created_at, updated_at')
      .in('id_game', gameIds);

    if (gamesError) {
      console.error(`GamesService: Error fetching games for store ${storeId}:`, gamesError);
      throw gamesError;
    }

    return games || [];
  } catch (error) {
    console.error(`GamesService: Error in getStoreGames for store ${storeId}:`, error);
    throw error;
  }
}

// Función para agregar un juego a una tienda (creando una actividad)
export async function addGameToStore(storeId: string, gameId: string): Promise<any> {
  console.log(`GamesService: Adding game ${gameId} to store ${storeId} via activity`);
  
  try {
    // Crear una actividad que conecte la tienda con el juego
    const { data, error } = await supabase
      .from('activities')
      .insert([{
        id_store: storeId,
        id_game: gameId,
        date: new Date().toISOString().split('T')[0], // fecha actual
        reference_link: null,
        adress_activity: '' // dirección de la actividad
      }])
      .select()
      .single();

    if (error) {
      console.error(`GamesService: Error adding game ${gameId} to store ${storeId}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`GamesService: Error in addGameToStore for store ${storeId}, game ${gameId}:`, error);
    throw error;
  }
}

// Función para remover un juego de una tienda (eliminando la actividad)
export async function removeGameFromStore(storeId: string, gameId: string): Promise<void> {
  console.log(`GamesService: Removing game ${gameId} from store ${storeId} via activity deletion`);
  
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id_store', storeId)
      .eq('id_game', gameId);

    if (error) {
      console.error(`GamesService: Error removing game ${gameId} from store ${storeId}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`GamesService: Error in removeGameFromStore for store ${storeId}, game ${gameId}:`, error);
    throw error;
  }
}

// Función para actualizar información de un juego en una tienda
export async function updateStoreGame(storeId: string, gameId: string, updates: any): Promise<any> {
  console.log(`GamesService: Updating game ${gameId} in store ${storeId}:`, updates);
  
  try {
    // Como no hay tabla store_games, actualizamos la actividad
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id_store', storeId)
      .eq('id_game', gameId)
      .select()
      .single();

    if (error) {
      console.error(`GamesService: Error updating game ${gameId} in store ${storeId}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`GamesService: Error in updateStoreGame for store ${storeId}, game ${gameId}:`, error);
    throw error;
  }
}