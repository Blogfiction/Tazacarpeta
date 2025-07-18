import { supabase } from '../lib/supabaseClient'
import type { Game, StoreGame, StoreGameInput } from '../types/database'
import { isDevModeActive } from '../lib/devModeUtils';
import { createFakeGames, createFakeGame, createFakeStoreGame } from '../lib/fakeData';
import { faker } from '@faker-js/faker/locale/es_MX';

// Cache for dev mode fake games
let DEV_MODE_GAMES_CACHE: Game[] | null = null;

// --- Games --- 

export async function getGames(): Promise<Game[]> {
  if (isDevModeActive()) {
    console.log('GamesService: Dev Mode - Returning fake games');
    await new Promise(resolve => setTimeout(resolve, 180));
    if (!DEV_MODE_GAMES_CACHE) {
      console.log('GamesService: Dev Mode - Generating and caching fake games...');
      DEV_MODE_GAMES_CACHE = createFakeGames(25); // Generate 25 fake games
    }
    return [...(DEV_MODE_GAMES_CACHE || [])]; // Return a copy from cache
  }

  console.log('GamesService: Fetching games from Supabase');
  const { data, error } = await supabase
    .from('games')
    .select('id_juego, nombre, descripcion, categoria, edad_minima, edad_maxima, jugadores_min, jugadores_max, duracion_min, duracion_max, created_at, updated_at')
    .order('nombre')

  if (error) {
    console.error('GamesService: Error fetching games:', error);
    throw error
  }
  return data || []
}

export async function getGame(id: string): Promise<Game | null> {
  if (isDevModeActive()) {
    console.log(`GamesService: Dev Mode - Returning fake game for ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 90));
    const games = createFakeGames(1); // Reuse generator
    const found = games.find(g => g.id_juego === id);
    return found || createFakeGame({ id_juego: id }); 
  }

  console.log(`GamesService: Fetching game ${id} from Supabase`);
  const { data, error } = await supabase
    .from('games')
    .select('id_juego, nombre, descripcion, categoria, edad_minima, edad_maxima, jugadores_min, jugadores_max, duracion_min, duracion_max, created_at, updated_at')
    .eq('id_juego', id)
    .single()

  if (error) {
    console.error(`GamesService: Error fetching game ${id}:`, error);
    if (error.code === 'PGRST116') return null;
    throw error
  }
  return data
}

export async function createGame(game: Omit<Game, 'id_juego' | 'created_at' | 'updated_at'>): Promise<Game> {
  if (isDevModeActive()) {
    console.log('GamesService: Dev Mode - Simulating game creation:', game);
    await new Promise(resolve => setTimeout(resolve, 140));
    const newId = `dev-game-${crypto.randomUUID()}`;
    return createFakeGame({ 
        ...game,
        id_juego: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    } as Game); // Ensure type compatibility 
  }

  console.log('GamesService: Creating game in Supabase:', game);
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select()
    .single()

  if (error) {
    console.error('GamesService: Error creating game:', error);
    throw error
  }
  return data
}

export async function updateGame(id: string, gameUpdate: Partial<Game>): Promise<Game> {
  if (isDevModeActive()) {
    console.log(`GamesService: Dev Mode - Simulating game update for ${id}:`, gameUpdate);
    await new Promise(resolve => setTimeout(resolve, 140));
    const baseGame = createFakeGame({ id_juego: id });
    return { ...baseGame, ...gameUpdate, updated_at: new Date().toISOString() };
  }

  console.log(`GamesService: Updating game ${id} in Supabase:`, gameUpdate);
  const { data, error } = await supabase
    .from('games')
    .update(gameUpdate)
    .eq('id_juego', id)
    .select()
    .single()

  if (error) {
    console.error(`GamesService: Error updating game ${id}:`, error);
    throw error
  }
  return data
}

export async function deleteGame(id: string): Promise<void> {
  if (isDevModeActive()) {
    console.log(`GamesService: Dev Mode - Simulating game deletion for ${id}`);
    await new Promise(resolve => setTimeout(resolve, 90));
    return; // Simulate success
  }

  console.log(`GamesService: Deleting game ${id} from Supabase`);
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id_juego', id)

  if (error) {
    console.error(`GamesService: Error deleting game ${id}:`, error);
    throw error
  }
}

// --- Store Games --- 

export async function getStoreGames(storeId: string): Promise<StoreGame[]> {
  if (isDevModeActive()) {
    console.log(`GamesService: Dev Mode - Returning fake store games for store ${storeId}`);
    await new Promise(resolve => setTimeout(resolve, 120));
    
    // Ensure the main game cache is populated. 
    // This should ideally happen via the UI calling getGames first, 
    // but this is a safeguard.
    if (!DEV_MODE_GAMES_CACHE) {
        await getGames(); // Populate the cache if it's empty
    }
    
    const allFakeGames = DEV_MODE_GAMES_CACHE || [];
    if (allFakeGames.length === 0) {
      console.warn(`GamesService: Dev Mode - No fake games in cache for store ${storeId}`);
      return [];
    }
    
    // Select a random subset of games from the cache for this store's inventory
    const inventorySize = faker.number.int({ min: 2, max: Math.min(15, allFakeGames.length) }); // Max 15 items or total games
    const gamesForStore = faker.helpers.shuffle(allFakeGames).slice(0, inventorySize);

    return gamesForStore.map((game: Game) => createFakeStoreGame(storeId, game.id_juego));
  }

  console.log(`GamesService: Fetching store games for store ${storeId} from Supabase`);
  const { data, error } = await supabase
    .from('store_games')
    .select('*')
    .eq('id_tienda', storeId)

  if (error) {
    console.error(`GamesService: Error fetching store games for store ${storeId}:`, error);
    throw error
  }
  return data || []
}

export async function addGameToStore(storeGame: StoreGameInput): Promise<StoreGame> {
   if (isDevModeActive()) {
    console.log('GamesService: Dev Mode - Simulating adding game to store:', storeGame);
    await new Promise(resolve => setTimeout(resolve, 100));
    return createFakeStoreGame(storeGame.id_tienda, storeGame.id_juego, storeGame);
  }

  console.log('GamesService: Adding game to store in Supabase:', storeGame);
  const { data, error } = await supabase
    .from('store_games')
    .insert([storeGame])
    .select()
    .single()

  if (error) {
     console.error('GamesService: Error adding game to store:', error);
     throw error
  }
  return data
}

export async function updateStoreGame(
  storeId: string,
  gameId: string,
  updates: Partial<{ stock: number; precio: number }> // Allow partial updates
): Promise<StoreGame> {
  if (isDevModeActive()) {
    console.log(`GamesService: Dev Mode - Simulating update for store ${storeId}, game ${gameId}:`, updates);
    await new Promise(resolve => setTimeout(resolve, 100));
    const baseStoreGame = createFakeStoreGame(storeId, gameId);
    return { ...baseStoreGame, ...updates };
  }
  
  console.log(`GamesService: Updating store game for store ${storeId}, game ${gameId}:`, updates);
  const { data, error } = await supabase
    .from('store_games')
    .update(updates)
    .eq('id_tienda', storeId)
    .eq('id_juego', gameId)
    .select()
    .single()

  if (error) {
    console.error(`GamesService: Error updating store game for store ${storeId}, game ${gameId}:`, error);
    throw error
  }
  return data
}

export async function removeGameFromStore(storeId: string, gameId: string): Promise<void> {
   if (isDevModeActive()) {
    console.log(`GamesService: Dev Mode - Simulating removing game ${gameId} from store ${storeId}`);
    await new Promise(resolve => setTimeout(resolve, 90));
    return; // Simulate success
  }
  
  console.log(`GamesService: Removing game ${gameId} from store ${storeId} in Supabase`);
  const { error } = await supabase
    .from('store_games')
    .delete()
    .eq('id_tienda', storeId)
    .eq('id_juego', gameId)

  if (error) {
     console.error(`GamesService: Error removing game ${gameId} from store ${storeId}:`, error);
     throw error
  }
}