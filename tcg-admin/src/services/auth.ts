import { supabase } from '../lib/supabaseClient';
import type { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';
import { createFakeAdminUser, createFakeSession } from '../lib/fakeData';
import { isDevModeActive } from '../lib/devModeUtils';

// Tipos para nuestro sistema de autenticación personalizado
interface CustomUser {
  id_user: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

interface CustomSession {
  user: CustomUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  nombre?: string;
  apellido?: string;
  city?: string;
  region?: string;
  country?: string;
}

interface ResetPasswordRequest {
  email: string;
}

// Función para hashear con SHA-256 (como se hace en Signup.tsx)
async function hashPasswordSHA256(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  // Convertir ArrayBuffer a hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Función simple para hash de contraseña (en producción usar bcrypt)
function hashPassword(password: string): string {
  // Esta es una implementación básica. En producción, usa bcrypt
  return btoa(password + 'salt'); // Base64 encoding con salt
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// Función para verificar contraseña con SHA-256
async function verifyPasswordSHA256(password: string, hashedPassword: string): Promise<boolean> {
  const passwordHash = await hashPasswordSHA256(password);
  return passwordHash === hashedPassword;
}

// Función para generar tokens de sesión
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Función para crear una sesión personalizada
function createCustomSession(user: CustomUser): CustomSession {
  return {
    user,
    access_token: generateSessionToken(),
    refresh_token: generateSessionToken(),
    expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
}

/**
 * Servicio para manejar operaciones de autenticación personalizada
 */
export const AuthService = {
  /**
   * Iniciar sesión con email y contraseña contra la tabla users
   */
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    // Check for development mode credentials FIRST
    if (isDevModeActive() && email === 'admin' && password === '12345') {
      console.log('AuthService: Login en modo desarrollo detectado');
      
      const fakeUser = createFakeAdminUser();
      const fakeSession = createFakeSession(fakeUser);
      
      console.log('AuthService: Fake session created:', fakeSession);

      // Simulate a slight delay like a real API call
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        data: {
          session: fakeSession,
          user: fakeUser
        },
        error: null
      };
    }

    // --- Login personalizado contra tabla users --- 
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Validación básica del formato de email
    if (!email.includes('@') || email.trim().length < 5) {
      throw new Error('Formato de email inválido');
    }

    console.log('AuthService: Attempting custom login against users table');
    
    try {
      // Buscar usuario en la tabla users
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (error || !users) {
        console.error('AuthService: User not found:', error);
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña usando SHA-256
      const isValidPassword = await verifyPasswordSHA256(password, users.password_hash);
      if (!isValidPassword) {
        console.error('AuthService: Invalid password');
        throw new Error('Credenciales inválidas');
      }

      // Crear sesión personalizada
      const customUser: CustomUser = {
        id_user: users.id_user,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        city: users.city,
        region: users.region,
        country: users.country,
        created_at: users.created_at,
        updated_at: users.updated_at
      };

      const customSession = createCustomSession(customUser);

      // Guardar sesión en localStorage para persistencia
      localStorage.setItem('custom_session', JSON.stringify(customSession));

      console.log('AuthService: Custom login successful');
      
      // Convertir a formato compatible con Supabase
      const supabaseUser: User = {
        id: customUser.id_user,
        email: customUser.email,
        user_metadata: {
          first_name: customUser.first_name,
          last_name: customUser.last_name,
          city: customUser.city,
          region: customUser.region,
          country: customUser.country
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: customUser.created_at,
        updated_at: customUser.updated_at
      } as User;

      const supabaseSession: Session = {
        access_token: customSession.access_token,
        refresh_token: customSession.refresh_token,
        expires_at: customSession.expires_at,
        user: supabaseUser,
        token_type: 'bearer'
      } as Session;

      return {
        data: {
          session: supabaseSession,
          user: supabaseUser
        },
        error: null
      };
    } catch (err: any) {
      console.error('AuthService: Custom login error:', err);
      throw new Error(err.message || 'Error al iniciar sesión');
    }
  },

  /**
   * Registrar un nuevo usuario en la tabla users
   */
  async signup({ email, password, nombre, apellido, city, region, country }: SignupCredentials): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Validación de fortaleza de contraseña
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    console.log('AuthService: Creating user in users table');

    try {
      const now = new Date().toISOString();
      const hashedPassword = await hashPasswordSHA256(password);

      // Insertar usuario directamente en la tabla users
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          id_user: crypto.randomUUID(), // Generar UUID para el usuario
          email: email.trim(),
          password_hash: hashedPassword,
          first_name: nombre ?? null,
          last_name: apellido ?? null,
          city: city ?? null,
          region: region ?? null,
          country: country ?? null,
          created_at: now,
          updated_at: now,
          total_searches: 0,
          total_inscriptions: 0,
          last_activity: null,
          id_plan: null,
          id_role: null
        }])
        .select()
        .single();

      if (error) {
        console.error('AuthService: Error creating user:', error);
        if (error.message.includes('duplicate')) {
          throw new Error('Email ya registrado');
        } else {
          throw new Error('Error al crear la cuenta. Por favor intenta nuevamente.');
        }
      }

      console.log('AuthService: User created successfully:', newUser);

      // Crear sesión automáticamente después del registro
      const customUser: CustomUser = {
        id_user: newUser.id_user,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        city: newUser.city,
        region: newUser.region,
        country: newUser.country,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      };

      const customSession = createCustomSession(customUser);
      localStorage.setItem('custom_session', JSON.stringify(customSession));

      // Convertir a formato compatible con Supabase
      const supabaseUser: User = {
        id: customUser.id_user,
        email: customUser.email,
        user_metadata: {
          first_name: customUser.first_name,
          last_name: customUser.last_name,
          city: customUser.city,
          region: customUser.region,
          country: customUser.country
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: customUser.created_at,
        updated_at: customUser.updated_at
      } as User;

      const supabaseSession: Session = {
        access_token: customSession.access_token,
        refresh_token: customSession.refresh_token,
        expires_at: customSession.expires_at,
        user: supabaseUser,
        token_type: 'bearer'
      } as Session;

      return {
        data: {
          session: supabaseSession,
          user: supabaseUser
        },
        error: null
      };
    } catch (err: any) {
      console.error('AuthService: Error in signup:', err);
      throw new Error(err.message || 'Error al crear la cuenta');
    }
  },

  /**
   * Cerrar sesión del usuario actual
   */
  async logout(): Promise<{ error: AuthError | null }> {
    try {
      // Limpiar sesión personalizada
      localStorage.removeItem('custom_session');
      console.log('AuthService: Custom logout successful');
      return { error: null };
    } catch (err) {
      console.error('AuthService: Error during logout:', err);
      return { error: err as AuthError };
    }
  },

  /**
   * Obtener la sesión actual
   */
  async getSession(): Promise<Session | null> {
    try {
      const sessionData = localStorage.getItem('custom_session');
      if (!sessionData) return null;

      const customSession: CustomSession = JSON.parse(sessionData);
      
      // Verificar si la sesión ha expirado
      if (Date.now() > customSession.expires_at) {
        localStorage.removeItem('custom_session');
        return null;
      }

      // Convertir a formato Supabase
      const supabaseUser: User = {
        id: customSession.user.id_user,
        email: customSession.user.email,
        user_metadata: {
          first_name: customSession.user.first_name,
          last_name: customSession.user.last_name,
          city: customSession.user.city,
          region: customSession.user.region,
          country: customSession.user.country
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: customSession.user.created_at,
        updated_at: customSession.user.updated_at
      } as User;

      const supabaseSession: Session = {
        access_token: customSession.access_token,
        refresh_token: customSession.refresh_token,
        expires_at: customSession.expires_at,
        user: supabaseUser,
        token_type: 'bearer'
      } as Session;

      return supabaseSession;
    } catch (err) {
      console.error('AuthService: Error getting session:', err);
      return null;
    }
  },

  /**
   * Obtener el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user ?? null;
  },

  /**
   * Solicitar restablecimiento de contraseña
   */
  async resetPassword({ email }: ResetPasswordRequest): Promise<{ error: AuthError | null }> {
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    // Implementar lógica de reset de contraseña
    console.log('AuthService: Password reset requested for:', email);
    return { error: null };
  },

  /**
   * Actualizar contraseña
   */
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
    }

    try {
      const session = await this.getSession();
      if (!session?.user) {
        throw new Error('No hay sesión activa');
      }

      const hashedPassword = await hashPasswordSHA256(newPassword);
      
      const { error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id_user', session.user.id);

      if (error) {
        console.error('AuthService: Error updating password:', error);
        return { error: error as unknown as AuthError };
      }

      return { error: null };
    } catch (err: any) {
      console.error('AuthService: Error in updatePassword:', err);
      return { error: err as AuthError };
    }
  }
};

export default AuthService; 