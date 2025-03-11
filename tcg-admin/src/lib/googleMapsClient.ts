/**
 * Google Maps API client configuration
 * This file centralizes Google Maps API configuration and validates API key presence
 */

// Get the API key from environment variables
export const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// Validate that API key exists
if (!googleMapsApiKey) {
  throw new Error('Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
}

// Libraries used with Google Maps
export const googleMapsLibraries: ("places")[] = ["places"];

// Helper function to validate an API key format (basic validation)
export const isValidApiKey = (key: string): boolean => {
  // Most API keys are at least 20 characters long
  return key.length >= 20;
};

// Run a basic validation on the API key format
if (!isValidApiKey(googleMapsApiKey)) {
  console.warn('Google Maps API key may be invalid. Please check the key format in your .env file');
} 