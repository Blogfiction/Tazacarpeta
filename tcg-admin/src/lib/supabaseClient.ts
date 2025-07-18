import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificación más robusta de las variables de entorno
if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
  throw new Error('VITE_SUPABASE_URL no está configurada correctamente en el archivo .env')
}

if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
  throw new Error('VITE_SUPABASE_ANON_KEY no está configurada correctamente en el archivo .env')
}

// Validación básica del formato de URL
if (!supabaseUrl.startsWith('https://')) {
  console.warn('La URL de Supabase debería comenzar con https:// para garantizar conexiones seguras')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    // Agrega encabezados personalizados si es necesario
    headers: { 
      'x-application-name': 'tcg-admin'
    }
  }
})