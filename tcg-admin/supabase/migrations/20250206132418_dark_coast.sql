/*
  # Crear tabla de informes

  1. Nueva Tabla
    - `reports`
      - `id_informe` (uuid, primary key)
      - `id_tienda` (uuid, foreign key)
      - `tipo_informe` (text)
      - `fecha_generacion` (timestamptz)
      - `parametros` (jsonb)

  2. Seguridad
    - Habilitar RLS
    - Políticas para lectura y escritura autenticada
*/

CREATE TABLE IF NOT EXISTS reports (
  id_informe uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda uuid REFERENCES stores(id_tienda) ON DELETE CASCADE,
  tipo_informe text NOT NULL,
  fecha_generacion timestamptz DEFAULT now(),
  parametros jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver informes"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear informes"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (true);