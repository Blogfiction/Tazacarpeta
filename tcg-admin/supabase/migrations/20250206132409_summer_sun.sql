/*
  # Crear tabla de inscripciones

  1. Nueva Tabla
    - `inscriptions`
      - `id_usuario` (uuid, foreign key)
      - `id_actividad` (uuid, foreign key)
      - `fecha_registro` (timestamptz)
      - Clave primaria compuesta

  2. Seguridad
    - Habilitar RLS
    - Políticas para lectura y escritura autenticada
*/

CREATE TABLE IF NOT EXISTS inscriptions (
  id_usuario uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  id_actividad uuid REFERENCES activities(id_actividad) ON DELETE CASCADE,
  fecha_registro timestamptz DEFAULT now(),
  PRIMARY KEY (id_usuario, id_actividad)
);

ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias inscripciones"
  ON inscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = id_usuario);

CREATE POLICY "Usuarios pueden crear sus propias inscripciones"
  ON inscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Usuarios pueden eliminar sus propias inscripciones"
  ON inscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = id_usuario);