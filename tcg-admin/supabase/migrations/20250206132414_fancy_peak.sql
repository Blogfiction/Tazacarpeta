/*
  # Crear tabla de búsquedas

  1. Nueva Tabla
    - `searches`
      - `id_busqueda` (uuid, primary key)
      - `id_usuario` (uuid, foreign key)
      - `tipo_busqueda` (text)
      - `termino_busqueda` (text)
      - `fecha_hora` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Políticas para lectura y escritura autenticada
*/

CREATE TABLE IF NOT EXISTS searches (
  id_busqueda uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_busqueda text NOT NULL,
  termino_busqueda text NOT NULL,
  fecha_hora timestamptz DEFAULT now()
);

ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias búsquedas"
  ON searches FOR SELECT
  TO authenticated
  USING (auth.uid() = id_usuario);

CREATE POLICY "Usuarios pueden registrar sus búsquedas"
  ON searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id_usuario);