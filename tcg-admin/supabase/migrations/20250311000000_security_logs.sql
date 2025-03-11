-- Tabla para registrar eventos relacionados con la seguridad
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Relaciones
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

-- Comentarios para documentación en la base de datos
COMMENT ON TABLE security_logs IS 'Registros de eventos relacionados con la seguridad y auditoría';
COMMENT ON COLUMN security_logs.event_type IS 'Tipo de evento de seguridad (login_success, login_failure, etc.)';
COMMENT ON COLUMN security_logs.user_id IS 'ID del usuario relacionado con el evento (si aplica)';
COMMENT ON COLUMN security_logs.ip_address IS 'Dirección IP desde donde se originó el evento';
COMMENT ON COLUMN security_logs.user_agent IS 'User agent del navegador utilizado';
COMMENT ON COLUMN security_logs.details IS 'Detalles adicionales del evento en formato JSON';
COMMENT ON COLUMN security_logs.timestamp IS 'Fecha y hora en que ocurrió el evento';

-- Políticas RLS para control de acceso
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden ver TODOS los registros de seguridad
CREATE POLICY admin_all_access ON security_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Los usuarios pueden ver SOLO sus propios registros
CREATE POLICY user_own_access ON security_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger para limpiar registros antiguos (mantener solo 3 meses)
CREATE OR REPLACE FUNCTION clean_old_security_logs()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM security_logs 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clean_old_security_logs_trigger
AFTER INSERT ON security_logs
EXECUTE PROCEDURE clean_old_security_logs();

-- Asegurarse de que exista la tabla de profiles si no aparece en las migraciones anteriores
-- (este bloque se ejecutará solo si es necesario)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      nombre TEXT,
      apellido TEXT,
      ciudad TEXT,
      comuna_region TEXT,
      pais TEXT,
      tipo_plan TEXT DEFAULT 'basic',
      role TEXT DEFAULT 'usuario',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Los usuarios pueden ver todos los perfiles"
      ON profiles FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Los usuarios solo pueden actualizar su propio perfil"
      ON profiles FOR UPDATE
      TO authenticated
      USING (id = auth.uid());
  END IF;
END
$$; 