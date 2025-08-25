import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { UserProfile } from '../hooks/useUserProfile'

type AuthContextType = {
  session: Session | null
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  setDevSession: (session: Session | null) => void
  isAdmin: boolean
  isClient: boolean
  isUser: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (userId: string) => {
    try {
      // Primero obtener el usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id_user', userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        return null;
      }

      if (!userData) {
        console.error('No user data found');
        return null;
      }

      // Si el usuario no tiene rol asignado, asignar uno por defecto
      if (!userData.id_role) {
        console.log('Usuario sin rol asignado, asignando rol por defecto...');
        
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
            .eq('id_user', userId);

          if (!updateError) {
            userData.id_role = defaultRole.id_role;
            console.log('Rol por defecto asignado:', defaultRole.role_name);
          } else {
            console.error('Error asignando rol por defecto:', updateError);
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

      console.log('User data:', userData);
      console.log('Role data:', roleData);

      return {
        ...userData,
        role_name: roleData?.role_name || null,
        role_description: roleData?.description || null
      };
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
    return null;
  };

  useEffect(() => {
    // Obtener la sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      }
      
      setLoading(false)
    })

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const setDevSession = async (devSession: Session | null) => {
    console.log('Estableciendo sesión de desarrollo:', devSession);
    setSession(devSession)
    setUser(devSession?.user ?? null)
    
    if (devSession?.user) {
      const profile = await fetchUserProfile(devSession.user.id);
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }
    
    setLoading(false)
  }

  const isAdmin = userProfile?.role_name === 'Admin';
  const isClient = userProfile?.role_name === 'Cliente';
  const isUser = userProfile?.role_name === 'Usuario';

  // Logs para debugging
  console.log('AuthContext - User Profile:', userProfile);
  console.log('AuthContext - Role Name:', userProfile?.role_name);
  console.log('AuthContext - isAdmin:', isAdmin);
  console.log('AuthContext - isClient:', isClient);
  console.log('AuthContext - isUser:', isUser);

  const value = {
    session,
    user,
    userProfile,
    loading,
    setDevSession,
    isAdmin,
    isClient,
    isUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}