import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/database';

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nombre');

  if (error) throw error;
  return data || [];
}

export async function getTopActiveUsers(limit: number = 5) {
  const { data, error } = await supabase
    .from('user_activity_stats')
    .select('*')
    .order('total_inscriptions', { ascending: false })
    .order('total_searches', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map(user => ({
    profile: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email
    },
    count: user.total_inscriptions
  }));
}