import { supabase } from '../lib/supabaseClient'
import type { Store, StoreInput } from '../types/database'
import { isDevModeActive } from '../lib/devModeUtils';
import { createFakeStores, createFakeStore } from '../lib/fakeData';

export async function getStores(): Promise<Store[]> {
  if (isDevModeActive()) {
    console.log('StoresService: Dev Mode - Returning fake stores');
    await new Promise(resolve => setTimeout(resolve, 210));
    return createFakeStores(10); // Generate 10 fake stores
  }

  console.log('StoresService: Fetching stores from Supabase');
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('nombre')

  if (error) {
    console.error('StoresService: Error fetching stores:', error);
    throw error;
  }
  return data || []
}

export async function getStore(id: string): Promise<Store | null> {
  if (isDevModeActive()) {
    console.log(`StoresService: Dev Mode - Returning fake store for ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 110));
    const stores = createFakeStores(1); // Reuse generator
    const found = stores.find(s => s.id_tienda === id);
    return found || createFakeStore({ id_tienda: id }); 
  }

  console.log(`StoresService: Fetching store ${id} from Supabase`);
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id_tienda', id)
    .single()

  if (error) {
    console.error(`StoresService: Error fetching store ${id}:`, error);
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data
}

export async function createStore(store: StoreInput): Promise<Store> {
  if (isDevModeActive()) {
    console.log('StoresService: Dev Mode - Simulating store creation:', store);
    await new Promise(resolve => setTimeout(resolve, 160));
    const newId = `dev-store-${crypto.randomUUID()}`;
    return createFakeStore({ 
        ...store,
        id_tienda: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
     } as Store);
  }

  console.log('StoresService: Creating store in Supabase:', store);
  const { data, error } = await supabase
    .from('stores')
    .insert([store])
    .select()
    .single()

  if (error) {
    console.error('StoresService: Error creating store:', error);
    throw error;
  }
  return data
}

export async function updateStore(id: string, storeUpdate: Partial<StoreInput>): Promise<Store> {
  if (isDevModeActive()) {
    console.log(`StoresService: Dev Mode - Simulating store update for ${id}:`, storeUpdate);
    await new Promise(resolve => setTimeout(resolve, 160));
    const baseStore = createFakeStore({ id_tienda: id });
    // Deep merge for address and horario might be needed if partial updates are expected
    return { 
        ...baseStore, 
        ...storeUpdate, 
        // Ensure nested objects are handled if needed
        direccion: { ...baseStore.direccion, ...(storeUpdate.direccion || {}) },
        horario: { ...baseStore.horario, ...(storeUpdate.horario || {}) },
        updated_at: new Date().toISOString() 
    };
  }

  console.log(`StoresService: Updating store ${id} in Supabase:`, storeUpdate);
  const { data, error } = await supabase
    .from('stores')
    .update(storeUpdate)
    .eq('id_tienda', id)
    .select()
    .single()

  if (error) {
    console.error(`StoresService: Error updating store ${id}:`, error);
    throw error;
  }
  return data
}

export async function deleteStore(id: string): Promise<void> {
  if (isDevModeActive()) {
    console.log(`StoresService: Dev Mode - Simulating store deletion for ${id}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return; // Simulate success
  }

  console.log(`StoresService: Deleting store ${id} from Supabase`);
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id_tienda', id)

  if (error) {
    console.error(`StoresService: Error deleting store ${id}:`, error);
    throw error;
  }
}