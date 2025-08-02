const DEV_MODE_STORAGE_KEY = 'devMode';

/**
 * Checks if Development Mode is currently active by reading from localStorage.
 * @returns {boolean} True if development mode is active, false otherwise.
 */
export function isDevModeActive(): boolean {
  // Si hay problemas de conexión, activar modo desarrollo
  const hasConnectionIssues = localStorage.getItem('connection_issues') === 'true';
  
  const devMode = import.meta.env.VITE_DEV_MODE === 'true';
  const isDev = import.meta.env.DEV;
  
  console.log('DevMode Check:', {
    VITE_DEV_MODE: devMode,
    import_meta_env_DEV: isDev,
    hasConnectionIssues: hasConnectionIssues,
    result: devMode || isDev || hasConnectionIssues
  });
  
  // Temporalmente ignorar el modo desarrollo de Vite para forzar conexión real
  return (
    devMode ||
    // isDev || // Comentado temporalmente
    hasConnectionIssues
  );
}

// Función para activar modo desarrollo cuando hay problemas de conexión
export function setConnectionIssues(hasIssues: boolean): void {
  if (hasIssues) {
    localStorage.setItem('connection_issues', 'true');
  } else {
    localStorage.removeItem('connection_issues');
  }
}

// Función para limpiar modo desarrollo y forzar conexión real
export function clearDevMode(): void {
  localStorage.removeItem('connection_issues');
  localStorage.removeItem(DEV_MODE_STORAGE_KEY);
  console.log('DevMode cleared - forcing real connection to Supabase');
}

// Función global para debugging (temporal)
if (typeof window !== 'undefined') {
  (window as any).clearDevMode = clearDevMode;
  console.log('🔧 Debug: Use clearDevMode() in console to force real connection');
} 