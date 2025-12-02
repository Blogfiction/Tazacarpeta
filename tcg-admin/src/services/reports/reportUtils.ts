import { format as formatDate } from 'date-fns';

/**
 * Formatea una fecha en string con formato específico
 */
export const formatDateString = (date: Date, formatStr: string): string => {
  try {
    return formatDate(date, formatStr);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return date.toLocaleDateString('es-ES');
  }
};

/**
 * Agrupa actividades por mes para análisis de tendencias
 */
export const groupActivitiesByMonth = (activities: any[]): Record<string, number> => {
  const result: Record<string, number> = {};
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const monthYear = formatDateString(date, 'yyyy-MM');
    
    if (!result[monthYear]) {
      result[monthYear] = 0;
    }
    
    result[monthYear]++;
  });
  
  return result;
};

