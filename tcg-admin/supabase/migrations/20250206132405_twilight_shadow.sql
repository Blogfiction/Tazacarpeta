/*
  # Crear tabla de relación tienda-juegos

  1. Nueva Tabla
    - `store_games`
      - `id_tienda` (uuid, foreign key)
      - `id_juego` (uuid, foreign key)
      - Clave primaria compuesta

  2. Seguridad
    - Habilitar RLS
    - Políticas para lectura pública y escritura autenticada
*/

CREATE TABLE IF NOT EXISTS store_games (
  id_tienda uuid REFERENCES stores(id_tienda) ON DELETE CASCADE,
  id_juego uuid REFERENCES games(id_juego) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id_tienda, id_juego)
);

ALTER TABLE store_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relaciones tienda-juego visibles para todos"
  ON store_games FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Solo usuarios autenticados pueden crear relaciones tienda-juego"
  ON store_games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden eliminar relaciones tienda-juego"
  ON store_games FOR DELETE
  TO authenticated
  USING (true);