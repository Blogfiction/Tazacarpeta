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
  
  try {
    // Obtener usuarios más activos basándose en las inscripciones
    const { data, error } = await supabase
      .from('inscriptions')
      .select(`
        id_user,
        users:users(
          id_user,
          first_name,
          last_name,
          email
        )
      `)
      .not('id_user', 'is', null);

    if (error) {
      console.error('UsersService: Error fetching inscriptions:', error);
      throw error;
    }

    // Contar inscripciones por usuario
    const userCounts = new Map<string, { profile: any; count: number }>();
    
    data?.forEach(inscription => {
      if (inscription.id_user && inscription.users) {
        const userId = inscription.id_user;
        const userData = inscription.users as any; // Type assertion para evitar errores de TypeScript
        const existing = userCounts.get(userId);
        
        if (existing) {
          existing.count += 1;
        } else {
          userCounts.set(userId, {
            profile: {
              id: userData.id_user,
              nombre: userData.first_name,
              apellido: userData.last_name,
              email: userData.email
            },
            count: 1
          });
        }
      }
    });

    // Convertir a array y ordenar por count
    const topUsers = Array.from(userCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return topUsers;
  } catch (err) {
    console.error('UsersService: Error in getTopActiveUsers:', err);
    return [];
  }
}