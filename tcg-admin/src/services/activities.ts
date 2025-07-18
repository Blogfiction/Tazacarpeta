import { supabase } from '../lib/supabaseClient'
import type { Activity, ActivityInput } from '../types/database'
import { isDevModeActive } from '../lib/devModeUtils';
import { createFakeActivities, createFakeActivity } from '../lib/fakeData';
import { createFakeStores, createFakeGames } from '../lib/fakeData'; // Needed for context

// Simulate fetching some base data for context if needed
const FAKE_STORES = createFakeStores(5);
const FAKE_GAMES = createFakeGames(10);

export async function getActivities(): Promise<Activity[]> {
  if (isDevModeActive()) {
    console.log('ActivitiesService: Dev Mode - Returning fake activities');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return createFakeActivities(15, FAKE_STORES, FAKE_GAMES); // Generate 15 fake activities
  }

  console.log('ActivitiesService: Fetching activities from Supabase');
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('fecha', { ascending: true })

  if (error) {
    console.error('ActivitiesService: Error fetching activities:', error);
    throw error
  }
  return data || []
}

export async function getActivity(id: string): Promise<Activity | null> {
  if (isDevModeActive()) {
    console.log(`ActivitiesService: Dev Mode - Returning fake activity for ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    // Find activity in generated list or create a specific one
    const existing = createFakeActivities(1, FAKE_STORES, FAKE_GAMES); // Reuse generator for consistency
    const found = existing.find(a => a.id_actividad === id);
    return found || createFakeActivity(FAKE_STORES[0]?.id_tienda ?? null, FAKE_GAMES[0]?.id_juego ?? null, { id_actividad: id }); 
  }

  console.log(`ActivitiesService: Fetching activity ${id} from Supabase`);
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id_actividad', id)
    .single()

  if (error) {
    console.error(`ActivitiesService: Error fetching activity ${id}:`, error);
    // Handle not found error gracefully for single fetch
    if (error.code === 'PGRST116') return null;
    throw error
  }
  return data
}

// --- Mutations (Create, Update, Delete) --- 
// For dev mode, these can simply log and return a fake success response or the input data.

export async function createActivity(activity: ActivityInput): Promise<Activity> {
  if (isDevModeActive()) {
    console.log('ActivitiesService: Dev Mode - Simulating activity creation:', activity);
    await new Promise(resolve => setTimeout(resolve, 150));
    // Return a fake activity based on the input
    return createFakeActivity(
      activity.id_tienda ?? null,
      activity.id_juego ?? null,
      { ...activity, id_actividad: `dev-${crypto.randomUUID()}` } as Partial<Activity>
    );
  }
  
  console.log('ActivitiesService: Creating activity in Supabase:', activity);
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select()
    .single()

  if (error) {
     console.error('ActivitiesService: Error creating activity:', error);
     throw error
  }
  return data
}

export async function updateActivity(id: string, activityUpdate: Partial<ActivityInput>): Promise<Activity> {
  if (isDevModeActive()) {
    console.log(`ActivitiesService: Dev Mode - Simulating activity update for ${id}:`, activityUpdate);
    await new Promise(resolve => setTimeout(resolve, 150));
    // Fetch a base fake activity and apply overrides
    const baseActivity = createFakeActivity(FAKE_STORES[0]?.id_tienda ?? null, FAKE_GAMES[0]?.id_juego ?? null, { id_actividad: id });
    return { ...baseActivity, ...activityUpdate };
  }
  
  console.log(`ActivitiesService: Updating activity ${id} in Supabase:`, activityUpdate);
  const { data, error } = await supabase
    .from('activities')
    .update(activityUpdate)
    .eq('id_actividad', id)
    .select()
    .single()

  if (error) {
     console.error(`ActivitiesService: Error updating activity ${id}:`, error);
     throw error
  }
  return data
}

export async function deleteActivity(id: string): Promise<void> {
  if (isDevModeActive()) {
    console.log(`ActivitiesService: Dev Mode - Simulating activity deletion for ${id}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return; // Simulate successful deletion
  }
  
  console.log(`ActivitiesService: Deleting activity ${id} from Supabase`);
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id_actividad', id)

  if (error) {
    console.error(`ActivitiesService: Error deleting activity ${id}:`, error);
    throw error
  }
}