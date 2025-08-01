const DEV_MODE_STORAGE_KEY = 'devMode';

/**
 * Checks if Development Mode is currently active by reading from localStorage.
 * @returns {boolean} True if development mode is active, false otherwise.
 */
export function isDevModeActive(): boolean {
  // Si hay problemas de conexión, activar modo desarrollo
  const hasConnectionIssues = localStorage.getItem('connection_issues') === 'true';
  
  // Temporalmente activar modo desarrollo por defecto
  return true; // Cambiar a false cuando las variables de entorno estén funcionando
  
  // return (
  //   import.meta.env.VITE_DEV_MODE === 'true' ||
  //   import.meta.env.DEV ||
  //   hasConnectionIssues
  // );
}

// Función para activar modo desarrollo cuando hay problemas de conexión
export function setConnectionIssues(hasIssues: boolean): void {
  if (hasIssues) {
    localStorage.setItem('connection_issues', 'true');
  } else {
    localStorage.removeItem('connection_issues');
  }
} 