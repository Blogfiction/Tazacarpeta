import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Verificación de las variables de entorno
if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
  throw new Error('VITE_SUPABASE_URL no está configurada correctamente en el archivo .env')
}

if (!supabaseServiceRoleKey || typeof supabaseServiceRoleKey !== 'string' || supabaseServiceRoleKey.trim() === '') {
  throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada correctamente en el archivo .env')
}

// Cliente con service role para operaciones administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
