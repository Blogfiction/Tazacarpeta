/*
  # Crear tabla de tiendas

  1. Nueva Tabla
    - `stores`
      - `id_tienda` (uuid, primary key)
      - `nombre` (text)
      - `direccion` (jsonb) - Estructura: { calle, numero, ciudad, estado, cp }
      - `horario` (jsonb) - Estructura: { lunes: { apertura, cierre }, martes: {...}, ... }
      - `plan` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Políticas para lectura pública
    - Políticas para escritura solo para usuarios autenticados
*/

CREATE TABLE IF NOT EXISTS stores (
  id_tienda uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  direccion jsonb NOT NULL,
  horario jsonb NOT NULL,
  plan text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_stores_updated_at();

-- Habilitar RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Tiendas son visibles para todos"
  ON stores
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Solo usuarios autenticados pueden crear tiendas"
  ON stores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden actualizar tiendas"
  ON stores
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden eliminar tiendas"
  ON stores
  FOR DELETE
  TO authenticated
  USING (true);