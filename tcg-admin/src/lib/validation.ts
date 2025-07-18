/**
 * Utilidades de validación para mejorar la seguridad de la aplicación
 */

/**
 * Valida que un string tenga un formato de email válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un string tenga la longitud adecuada
 */
export const hasValidLength = (value: string, min: number, max?: number): boolean => {
  if (!value) return false;
  if (value.length < min) return false;
  if (max !== undefined && value.length > max) return false;
  return true;
};

/**
 * Valida que una contraseña cumpla los requisitos mínimos de seguridad
 * - Al menos 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 */
export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers;
};

/**
 * Sanitiza un string para prevenir inyecciones XSS
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Valida que un valor sea un número entero positivo
 */
export const isPositiveInteger = (value: any): boolean => {
  if (typeof value !== 'number') return false;
  return Number.isInteger(value) && value > 0;
};

/**
 * Valida que un objeto tenga las propiedades requeridas
 */
export const hasRequiredFields = (obj: any, requiredFields: string[]): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  
  return requiredFields.every(field => {
    return Object.prototype.hasOwnProperty.call(obj, field) && 
           obj[field] !== null && 
           obj[field] !== undefined && 
           (typeof obj[field] !== 'string' || obj[field].trim() !== '');
  });
};

/**
 * Valida una URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Wrapper para validación de datos
 */
export const validate = {
  email: isValidEmail,
  length: hasValidLength,
  password: isStrongPassword,
  sanitize: sanitizeString,
  positiveInteger: isPositiveInteger,
  requiredFields: hasRequiredFields,
  url: isValidUrl
}; 