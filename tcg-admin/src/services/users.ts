import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/database';
import { isDevModeActive } from '../lib/devModeUtils';
import { createFakeProfile, createFakeUser } from '../lib/fakeData';

export async function getProfiles(): Promise<Profile[]> {
  if (isDevModeActive()) {
    console.log('UsersService: Dev Mode - Returning fake profiles');
    await new Promise(resolve => setTimeout(resolve, 150));
    // Create a few fake users and then their profiles
    const fakeUsers = Array.from({ length: 10 }, createFakeUser);
    return fakeUsers.map(user => createFakeProfile(user.id, user.email!)); // Assuming email is always present for fake users
  }

  console.log('UsersService: Fetching profiles from Supabase');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nombre');

  if (error) {
    console.error('UsersService: Error fetching profiles:', error);
    throw error;
  }
  return data || [];
}

// Note: The getTopActiveUsers function relies on a specific view or aggregation
// Replicating its exact behavior with fake data might be complex.
// For dev mode, we can return a simplified fake structure.
export async function getTopActiveUsers(limit: number = 5) {
  if (isDevModeActive()) {
    console.log('UsersService: Dev Mode - Returning fake top active users');
    await new Promise(resolve => setTimeout(resolve, 100));
    const fakeUsers = Array.from({ length: limit }, createFakeUser);
    return fakeUsers.map((user, index) => ({
      profile: {
        id: user.id,
        nombre: user.user_metadata.name?.split(' ')[0] || 'Fake',
        apellido: user.user_metadata.name?.split(' ')[1] || 'User',
        email: user.email
      },
      count: 100 - index * 5 // Fake activity count
    }));
  }

  console.log('UsersService: Fetching top active users from Supabase');
  const { data, error } = await supabase
    .from('user_activity_stats') // Assumes this view exists
    .select('*')
    .order('total_inscriptions', { ascending: false })
    .order('total_searches', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('UsersService: Error fetching top active users:', error);
    throw error;
  }

  // Keep the original mapping logic for real data
  return (data || []).map((user: any) => ({
    profile: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email
    },
    count: user.total_inscriptions // Or based on your specific logic
  }));
}