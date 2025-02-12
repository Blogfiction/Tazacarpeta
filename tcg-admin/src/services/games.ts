import { supabase } from '../lib/supabaseClient'
import type { Game, StoreGameInput } from '../types/database'

export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id_juego, nombre, descripcion, categoria, edad_minima, edad_maxima, jugadores_min, jugadores_max, duracion_min, duracion_max, created_at, updated_at')
    .order('nombre')

  if (error) throw error
  return data || []
}

export async function getGame(id: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('id_juego, nombre, descripcion, categoria, edad_minima, edad_maxima, jugadores_min, jugadores_max, duracion_min, duracion_max, created_at, updated_at')
    .eq('id_juego', id)
    .single()

  if (error) throw error
  return data
}

export async function createGame(game: Omit<Game, 'id_juego' | 'created_at' | 'updated_at'>): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGame(id: string, game: Partial<Game>): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .update(game)
    .eq('id_juego', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGame(id: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id_juego', id)

  if (error) throw error
}

// Funciones para la relación store_games
export async function getStoreGames(storeId: string) {
  const { data, error } = await supabase
    .from('store_games')
    .select('*')
    .eq('id_tienda', storeId)

  if (error) throw error
  return data || []
}

export async function addGameToStore(storeGame: StoreGameInput) {
  const { data, error } = await supabase
    .from('store_games')
    .insert([storeGame])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStoreGame(
  storeId: string,
  gameId: string,
  updates: { stock: number; precio: number }
) {
  const { data, error } = await supabase
    .from('store_games')
    .update(updates)
    .eq('id_tienda', storeId)
    .eq('id_juego', gameId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeGameFromStore(storeId: string, gameId: string) {
  const { error } = await supabase
    .from('store_games')
    .delete()
    .eq('id_tienda', storeId)
    .eq('id_juego', gameId)

  if (error) throw error
}