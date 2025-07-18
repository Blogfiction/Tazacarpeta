import { supabase } from '../lib/supabaseClient';

/**
 * Tipo de evento de seguridad
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PERMISSION_CHANGE = 'permission_change',
  ACCOUNT_CREATION = 'account_creation',
  ACCOUNT_UPDATE = 'account_update',
  SENSITIVE_ACTION = 'sensitive_action',
}

/**
 * Interfaz para eventos de seguridad
 */
interface SecurityEvent {
  event_type: SecurityEventType;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

/**
 * Servicio para registrar y auditar eventos de seguridad
 */
export const SecurityService = {
  /**
   * Registra un evento de seguridad en la base de datos
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Obtener información del contexto actual
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id || event.user_id || 'anonymous';
      
      // Preparar los datos del evento de seguridad
      const securityEvent = {
        event_type: event.event_type,
        user_id: userId,
        ip_address: event.ip_address || this.getClientIP(),
        user_agent: event.user_agent || navigator.userAgent,
        details: event.details || {},
        timestamp: event.timestamp || new Date().toISOString(),
      };
      
      // Registrar en la tabla de security_logs si existe
      const { error } = await supabase
        .from('security_logs')
        .insert([securityEvent]);
      
      // Si hay un error, registrar en la consola pero no interrumpir el flujo
      if (error) {
        console.error('Error al registrar evento de seguridad:', error);
        // Alternativa: Registrar en localStorage como fallback
        this.logToLocalStorage(securityEvent);
      }
    } catch (error) {
      console.error('Error en el servicio de seguridad:', error);
    }
  },
  
  /**
   * Alternativa de registro en localStorage si falla la BD
   * (solo para eventos no críticos)
   */
  logToLocalStorage(event: any): void {
    try {
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logs.push({...event, timestamp: new Date().toISOString()});
      
      // Mantener solo los últimos 50 registros para evitar llenar el almacenamiento
      if (logs.length > 50) {
        logs.shift();
      }
      
      localStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Error al registrar en localStorage:', e);
    }
  },
  
  /**
   * Obtiene la IP del cliente (aproximación)
   * Nota: Esto es solo una estimación, la IP real requiere verificación del servidor
   */
  getClientIP(): string {
    return 'client_ip_unknown';
  },
  
  /**
   * Registra intentos fallidos de inicio de sesión
   */
  async logLoginFailure(email: string, reason: string): Promise<void> {
    await this.logSecurityEvent({
      event_type: SecurityEventType.LOGIN_FAILURE,
      details: { email, reason }
    });
  },
  
  /**
   * Registra inicio de sesión exitoso
   */
  async logLoginSuccess(userId: string): Promise<void> {
    await this.logSecurityEvent({
      event_type: SecurityEventType.LOGIN_SUCCESS,
      user_id: userId
    });
  },
  
  /**
   * Registra cierre de sesión
   */
  async logLogout(userId: string): Promise<void> {
    await this.logSecurityEvent({
      event_type: SecurityEventType.LOGOUT,
      user_id: userId
    });
  },
  
  /**
   * Registra cambio de contraseña
   */
  async logPasswordChange(userId: string): Promise<void> {
    await this.logSecurityEvent({
      event_type: SecurityEventType.PASSWORD_CHANGE,
      user_id: userId
    });
  },
  
  /**
   * Registra acceso no autorizado
   */
  async logUnauthorizedAccess(resource: string, details: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      event_type: SecurityEventType.UNAUTHORIZED_ACCESS,
      details: { resource, ...details }
    });
  }
};

export default SecurityService; 