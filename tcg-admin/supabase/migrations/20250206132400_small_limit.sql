/*
  # Crear tabla de juegos

  1. Nueva Tabla
    - `games`
      - `id_juego` (uuid, primary key)
      - `nombre` (text, not null)
      - `categoria` (text, not null)

  2. Seguridad
    - Habilitar RLS
    - Políticas para lectura pública y escritura autenticada
*/

CREATE TABLE IF NOT EXISTS games (
  id_juego uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  categoria text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Juegos visibles para todos"
  ON games FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Solo usuarios autenticados pueden crear juegos"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden actualizar juegos"
  ON games FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Solo usuarios autenticados pueden eliminar juegos"
  ON games FOR DELETE
  TO authenticated
  USING (true);