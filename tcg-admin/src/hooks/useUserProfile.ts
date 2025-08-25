import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export interface UserProfile {
  id_user: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  email: string | null;
  updated_at: string;
  created_at: string;
  id_plan: string | null;
  id_role: string | null;
  role_name?: string;
  role_description?: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        
        if (!user) {
          throw new Error('User is null');
        }
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id_user', user.id)
          .single();

        if (userError) {
          throw userError;
        }

        if (!userData) {
          throw new Error('No user data found');
        }

        // Si el usuario no tiene rol asignado, asignar uno por defecto
        if (!userData.id_role) {
          console.log('useUserProfile - Usuario sin rol asignado, asignando rol por defecto...');
          
          // Obtener el rol por defecto (Usuario)
          const { data: defaultRole, error: roleError } = await supabase
            .from('roles')
            .select('id_role, role_name, description')
            .eq('role_name', 'Usuario')
            .single();

          if (!roleError && defaultRole) {
            // Actualizar el usuario con el rol por defecto
            const { error: updateError } = await supabase
              .from('users')
              .update({ id_role: defaultRole.id_role })
              .eq('id_user', user.id);

            if (!updateError) {
              userData.id_role = defaultRole.id_role;
              console.log('useUserProfile - Rol por defecto asignado:', defaultRole.role_name);
            } else {
              console.error('useUserProfile - Error asignando rol por defecto:', updateError);
            }
          }
        }

        // Luego obtener el rol si existe
        let roleData = null;
        if (userData.id_role) {
          const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('role_name, description')
            .eq('id_role', userData.id_role)
            .single();

          if (!roleError && role) {
            roleData = role;
          }
        }

        console.log('useUserProfile - User data:', userData);
        console.log('useUserProfile - Role data:', roleData);

        setProfile({
          ...userData,
          role_name: roleData?.role_name || null,
          role_description: roleData?.description || null
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const isAdmin = profile?.role_name === 'Admin';
  const isClient = profile?.role_name === 'Cliente';
  const isUser = profile?.role_name === 'Usuario';

  return {
    profile,
    loading,
    error,
    isAdmin,
    isClient,
    isUser,
    refetch: () => {
      if (user) {
        setLoading(true);
        // Re-fetch logic here
      }
    }
  };
}
