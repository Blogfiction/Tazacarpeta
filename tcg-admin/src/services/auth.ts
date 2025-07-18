import { supabase } from '../lib/supabaseClient';
import type { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';
import { createFakeAdminUser, createFakeSession } from '../lib/fakeData';
import { isDevModeActive } from '../lib/devModeUtils';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  nombre?: string;
  apellido?: string;
}

interface ResetPasswordRequest {
  email: string;
}

/**
 * Servicio para manejar operaciones de autenticación de manera segura
 */
export const AuthService = {
  /**
   * Iniciar sesión con email y contraseña
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

    // --- Normal Supabase Login --- 
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Validación básica del formato de email
    if (!email.includes('@') || email.trim().length < 5) {
      throw new Error('Formato de email inválido');
    }

    console.log('AuthService: Attempting Supabase login');
    const response = await supabase.auth.signInWithPassword({ email, password });
    
    if (response.error) {
      console.error('AuthService: Supabase login error:', response.error);
      if (response.error.message.includes('credentials')) {
        throw new Error('Credenciales inválidas');
      } else {
        throw new Error('Error al iniciar sesión. Por favor intenta nuevamente.');
      }
    }
    
    console.log('AuthService: Supabase login successful');
    return response;
  },

  /**
   * Registrar un nuevo usuario
   */
  async signup({ email, password, nombre, apellido }: SignupCredentials): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Validación de fortaleza de contraseña
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Registro del usuario
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido
        }
      }
    });

    if (response.error) {
      console.error('Error de registro:', response.error);
      
      if (response.error.message.includes('email')) {
        throw new Error('Email inválido o ya registrado');
      } else {
        throw new Error('Error al crear la cuenta. Por favor intenta nuevamente.');
      }
    }

    // Si el registro es exitoso pero requiere confirmación por email
    if (response.data?.user && !response.data?.session) {
      return {
        data: { 
          user: response.data.user,
          session: null 
        },
        error: null
      };
    }

    return response;
  },

  /**
   * Cerrar sesión del usuario actual
   */
  async logout(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Obtener la sesión actual
   */
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Obtener el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /**
   * Solicitar restablecimiento de contraseña
   */
  async resetPassword({ email }: ResetPasswordRequest): Promise<{ error: AuthError | null }> {
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  },

  /**
   * Actualizar contraseña
   */
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    return { error };
  }
};

export default AuthService; 