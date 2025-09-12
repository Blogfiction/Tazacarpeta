import { supabase } from '../lib/supabaseClient'
import type { Activity, ActivityInput } from '../types/database'

export async function getActivities(userId?: string): Promise<Activity[]> {
  console.log('ActivitiesService: Fetching activities from Supabase');
  
  let query = supabase
    .from('activities')
    .select('id_activity, name_activity, id_store, id_game, adress_activity, date, reference_link, created_at, updated_at, id_users')
    .order('date', { ascending: false });

  // Si se proporciona userId, filtrar solo las actividades del usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('ActivitiesService: Error fetching activities:', error);
    throw error
  }
  return data || []
}

export async function getActivity(id: string, userId?: string): Promise<Activity | null> {
  console.log(`ActivitiesService: Fetching activity ${id} from Supabase`);
  
  let query = supabase
    .from('activities')
    .select('id_activity, name_activity, id_store, id_game, adress_activity, date, reference_link, created_at, updated_at, id_users')
    .eq('id_activity', id);

  // Si se proporciona userId, verificar que la actividad pertenezca al usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error(`ActivitiesService: Error fetching activity ${id}:`, error);
    if (error.code === 'PGRST116') return null;
    throw error
  }
  return data
}

export async function createActivity(activity: ActivityInput, userId: string): Promise<Activity> {
  if (!userId) {
    throw new Error('User ID is required to create activity');
  }
  
  const activityWithUser = {
    ...activity,
    id_users: userId,
    created_at: activity.created_at || new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('activities')
    .insert([activityWithUser])
    .select()
    .single()

  if (error) {
    throw error
  }
  
  return data
}

export async function updateActivity(id: string, activityUpdate: Partial<ActivityInput>, userId?: string): Promise<Activity> {
  // Agregar updated_at con la fecha y hora actual
  const updateData = {
    ...activityUpdate,
    updated_at: new Date().toISOString()
  };

  let query = supabase
    .from('activities')
    .update(updateData)
    .eq('id_activity', id);

  // Si se proporciona userId, verificar que la actividad pertenezca al usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { data, error } = await query
    .select()
    .single()

  if (error) {
    throw error
  }
  return data
}

export async function deleteActivity(id: string, userId?: string): Promise<void> {
  let query = supabase
    .from('activities')
    .delete()
    .eq('id_activity', id);

  // Si se proporciona userId, verificar que la actividad pertenezca al usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { error } = await query;

  if (error) {
    throw error
  }
}

export async function getActivitiesByStore(storeId: string, userId?: string): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select('id_activity, name_activity, id_store, id_game, adress_activity, date, reference_link, created_at, updated_at, id_users')
    .eq('id_store', storeId)
    .order('date', { ascending: false });

  // Si se proporciona userId, filtrar solo las actividades del usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw error
  }
  return data || []
}

export async function getActivitiesByGame(gameId: string, userId?: string): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select('id_activity, name_activity, id_store, id_game, adress_activity, date, reference_link, created_at, updated_at, id_users')
    .eq('id_game', gameId)
    .order('date', { ascending: false });

  // Si se proporciona userId, filtrar solo las actividades del usuario
  if (userId) {
    query = query.eq('id_users', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw error
  }
  return data || []
}