import { supabase } from '../lib/supabaseClient'
import type { Activity, ActivityInput } from '../types/database'

export async function getActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('fecha', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getActivity(id: string): Promise<Activity | null> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id_actividad', id)
    .single()

  if (error) throw error
  return data
}

export async function createActivity(activity: ActivityInput): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateActivity(id: string, activity: Partial<ActivityInput>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .update(activity)
    .eq('id_actividad', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id_actividad', id)

  if (error) throw error
}