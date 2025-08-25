import { supabase } from '../lib/supabaseClient'
import type { Store, StoreInput } from '../types/database'

export async function getStores(userId?: string): Promise<Store[]> {
  console.log('StoresService: Fetching stores from Supabase');
  
  let query = supabase
    .from('stores')
    .select('id_store, name_store, adress, phone, email, latitude, longitude, id_users')
    .order('name_store');

  // Si se proporciona userId, filtrar solo las tiendas del usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('StoresService: Error fetching stores:', error);
    throw error;
  }
  return data || []
}

export async function getStore(id: string, userId?: string): Promise<Store | null> {
  console.log(`StoresService: Fetching store ${id} from Supabase`);
  
  let query = supabase
    .from('stores')
    .select('id_store, name_store, adress, phone, email, latitude, longitude, id_users')
    .eq('id_store', id);

  // Si se proporciona userId, verificar que la tienda pertenezca al usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error(`StoresService: Error fetching store ${id}:`, error);
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data
}

export async function createStore(store: StoreInput, userId: string): Promise<Store> {
  console.log('StoresService: Creating store in Supabase:', store);
  
  // Asegurar que la tienda se cree con el userId del usuario logueado
  const storeWithUser = {
    ...store,
    id_users: userId
  };

  const { data, error } = await supabase
    .from('stores')
    .insert([storeWithUser])
    .select('id_store, name_store, adress, phone, email, latitude, longitude, id_users')
    .single()

  if (error) {
    console.error('StoresService: Error creating store:', error);
    throw error;
  }
  return data
}

export async function updateStore(id: string, storeUpdate: Partial<StoreInput>, userId?: string): Promise<Store> {
  console.log(`StoresService: Updating store ${id} in Supabase:`, storeUpdate);
  
  let query = supabase
    .from('stores')
    .update(storeUpdate)
    .eq('id_store', id);

  // Si se proporciona userId, verificar que la tienda pertenezca al usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { data, error } = await query
    .select('id_store, name_store, adress, phone, email, latitude, longitude, id_users')
    .single()

  if (error) {
    console.error(`StoresService: Error updating store ${id}:`, error);
    throw error;
  }
  return data
}

export async function deleteStore(id: string, userId?: string): Promise<void> {
  console.log(`StoresService: Deleting store ${id} from Supabase`);
  
  let query = supabase
    .from('stores')
    .delete()
    .eq('id_store', id);

  // Si se proporciona userId, verificar que la tienda pertenezca al usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { error } = await query;

  if (error) {
    console.error(`StoresService: Error deleting store ${id}:`, error);
    throw error;
  }
}