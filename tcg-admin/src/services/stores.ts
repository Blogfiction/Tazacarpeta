import { supabase } from '../lib/supabaseClient'
import type { Store, StoreInput } from '../types/database'

export async function getStores(): Promise<Store[]> {
  console.log('StoresService: Fetching stores from Supabase');
  const { data, error } = await supabase
    .from('stores')
    .select('id_store, name_store, adress, phone, email, latitude, longitude')
    .order('name_store')

  if (error) {
    console.error('StoresService: Error fetching stores:', error);
    throw error;
  }
  return data || []
}

export async function getStore(id: string): Promise<Store | null> {
  console.log(`StoresService: Fetching store ${id} from Supabase`);
  const { data, error } = await supabase
    .from('stores')
    .select('id_store, name_store, adress, phone, email, latitude, longitude')
    .eq('id_store', id)
    .single()

  if (error) {
    console.error(`StoresService: Error fetching store ${id}:`, error);
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data
}

export async function createStore(store: StoreInput): Promise<Store> {
  console.log('StoresService: Creating store in Supabase:', store);
  const { data, error } = await supabase
    .from('stores')
    .insert([store])
    .select('id_store, name_store, adress, phone, email, latitude, longitude')
    .single()

  if (error) {
    console.error('StoresService: Error creating store:', error);
    throw error;
  }
  return data
}

export async function updateStore(id: string, storeUpdate: Partial<StoreInput>): Promise<Store> {
  console.log(`StoresService: Updating store ${id} in Supabase:`, storeUpdate);
  const { data, error } = await supabase
    .from('stores')
    .update(storeUpdate)
    .eq('id_store', id)
    .select('id_store, name_store, adress, phone, email, latitude, longitude')
    .single()

  if (error) {
    console.error(`StoresService: Error updating store ${id}:`, error);
    throw error;
  }
  return data
}

export async function deleteStore(id: string): Promise<void> {
  console.log(`StoresService: Deleting store ${id} from Supabase`);
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id_store', id)

  if (error) {
    console.error(`StoresService: Error deleting store ${id}:`, error);
    throw error;
  }
}