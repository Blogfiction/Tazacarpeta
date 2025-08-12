import { supabase } from '../lib/supabaseClient'
import type { Activity, ActivityInput } from '../types/database'

export async function getActivities(): Promise<Activity[]> {
  console.log('ActivitiesService: Fetching activities from Supabase');
  const { data, error } = await supabase
    .from('activities')
    .select('id_activity, name_activity, id_store, id_game, adress_activity, date, reference_link, created_at, updated_at')
    .order('date', { ascending: false })

  if (error) {
    console.error('ActivitiesService: Error fetching activities:', error);
    throw error
  }
  return data || []
}

export async function getActivity(id: string): Promise<Activity | null> {
  console.log(`ActivitiesService: Fetching activity ${id} from Supabase`);
  const { data, error } = await supabase
    .from('activities')
    .select('id_activity, name_activity, id_store, id_game, adress_activity, date, reference_link, created_at, updated_at')
    .eq('id_activity', id)
    .single()

  if (error) {
    console.error(`ActivitiesService: Error fetching activity ${id}:`, error);
    if (error.code === 'PGRST116') return null;
    throw error
  }
  return data
}

export async function createActivity(activity: ActivityInput): Promise<Activity> {
  console.log('ActivitiesService: Creating activity in Supabase:', activity);
  
  // Agregar created_at si no está presente
  const activityWithTimestamp = {
    ...activity,
    created_at: activity.created_at || new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('activities')
    .insert([activityWithTimestamp])
    .select()
    .single()

  if (error) {
    console.error('ActivitiesService: Error creating activity:', error);
    throw error
  }
  return data
}

export async function updateActivity(id: string, activityUpdate: Partial<ActivityInput>): Promise<Activity> {
  console.log(`ActivitiesService: Updating activity ${id} in Supabase:`, activityUpdate);
  const { data, error } = await supabase
    .from('activities')
    .update(activityUpdate)
    .eq('id_activity', id)
    .select()
    .single()

  if (error) {
    console.error(`ActivitiesService: Error updating activity ${id}:`, error);
    throw error
  }
  return data
}

export async function deleteActivity(id: string): Promise<void> {
  console.log(`ActivitiesService: Deleting activity ${id} from Supabase`);
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id_activity', id)

  if (error) {
    console.error(`ActivitiesService: Error deleting activity ${id}:`, error);
    throw error
  }
}

export async function getActivitiesByStore(storeId: string): Promise<Activity[]> {
  console.log(`ActivitiesService: Fetching activities for store ${storeId} from Supabase`);
  const { data, error } = await supabase
    .from('activities')
    .select('id_activity, name_activity, id_store, id_game, adress_activity, date, reference_link, created_at, updated_at')
    .eq('id_store', storeId)
    .order('date', { ascending: false })

  if (error) {
    console.error(`ActivitiesService: Error fetching activities for store ${storeId}:`, error);
    throw error
  }
  return data || []
}

export async function getActivitiesByGame(gameId: string): Promise<Activity[]> {
  console.log(`ActivitiesService: Fetching activities for game ${gameId} from Supabase`);
  const { data, error } = await supabase
    .from('activities')
    .select('id_activity, name_activity, id_store, id_game, adress_activity, date, reference_link, created_at, updated_at')
    .eq('id_game', gameId)
    .order('date', { ascending: false })

  if (error) {
    console.error(`ActivitiesService: Error fetching activities for game ${gameId}:`, error);
    throw error
  }
  return data || []
}