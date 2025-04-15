const DEV_MODE_STORAGE_KEY = 'devMode';

/**
 * Checks if Development Mode is currently active by reading from localStorage.
 * @returns {boolean} True if development mode is active, false otherwise.
 */
export function isDevModeActive(): boolean {
  // Ensure this code only runs in the browser environment
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return localStorage.getItem(DEV_MODE_STORAGE_KEY) === 'true';
  }
  return false; // Default to false if localStorage is not available
} 