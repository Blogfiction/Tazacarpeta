/*
  # Crear tabla de actividades y sus relaciones

  1. Nuevas Tablas
    - `activities`
      - `id_actividad` (uuid, primary key)
      - `id_tienda` (uuid, foreign key)
      - `id_juego` (uuid, foreign key)
      - `nombre` (text)
      - `fecha` (timestamptz)
      - `ubicacion` (text)
      - `enlace_referencia` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en la tabla `activities`
    - Políticas para lectura pública
    - Políticas para escritura solo para usuarios autenticados
*/

CREATE TABLE IF NOT EXISTS activities (
  id_actividad uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda uuid,
  id_juego uuid,
  nombre text NOT NULL,
  fecha timestamptz NOT NULL,
  ubicacion text NOT NULL,
  enlace_referencia text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Actividades son visibles para todos"
  ON activities
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Solo usuarios autenticados pueden crear actividades"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden actualizar actividades"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden eliminar actividades"
  ON activities
  FOR DELETE
  TO authenticated
  USING (true);