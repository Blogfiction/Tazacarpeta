import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log para debugging
console.log('Supabase URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada');
console.log('Supabase ANON KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ No configurada');

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

export default supabase

// Función global para debugging (temporal)
if (typeof window !== 'undefined') {
  (window as any).diagnoseTables = diagnoseTables;
  console.log('🔧 Debug: Use diagnoseTables() in console to check table structures');
}

// Función para diagnosticar las columnas de las tablas
export async function diagnoseTables() {
  console.log('🔍 Diagnosing table structures...');
  
  try {
    // Verificar tabla stores
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(1);
    
    if (storesError) {
      console.error('❌ Stores table error:', storesError);
    } else {
      console.log('✅ Stores table accessible');
      if (storesData && storesData.length > 0) {
        console.log('📋 Stores columns:', Object.keys(storesData[0]));
      }
    }
    
    // Verificar tabla games
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .limit(1);
    
    if (gamesError) {
      console.error('❌ Games table error:', gamesError);
    } else {
      console.log('✅ Games table accessible');
      if (gamesData && gamesData.length > 0) {
        console.log('📋 Games columns:', Object.keys(gamesData[0]));
      }
    }
    
    // Verificar tabla activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .limit(1);
    
    if (activitiesError) {
      console.error('❌ Activities table error:', activitiesError);
    } else {
      console.log('✅ Activities table accessible');
      if (activitiesData && activitiesData.length > 0) {
        console.log('📋 Activities columns:', Object.keys(activitiesData[0]));
      }
    }
    
  } catch (err) {
    console.error('❌ Diagnosis error:', err);
  }
}

// Función global para debugging
if (typeof window !== 'undefined') {
  (window as any).diagnoseTables = diagnoseTables;
  console.log('🔧 Debug: Use diagnoseTables() in console to check table structures');
}