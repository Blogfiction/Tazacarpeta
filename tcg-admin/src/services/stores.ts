import { supabase } from '../lib/supabaseClient'
import type { Store, StoreInput } from '../types/database'

export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data || []
}

export async function getStore(id: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id_tienda', id)
    .single()

  if (error) throw error
  return data
}

export async function createStore(store: StoreInput): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .insert([store])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStore(id: string, store: Partial<StoreInput>): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .update(store)
    .eq('id_tienda', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteStore(id: string): Promise<void> {
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id_tienda', id)

  if (error) throw error
}