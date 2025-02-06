/*
  # Actualizar perfil de usuarios

  1. Nuevos Campos
    Añadir campos de perfil a la tabla auth.users:
    - nombre (text)
    - apellido (text)
    - ciudad (text)
    - comuna_region (text)
    - pais (text)
    - tipo_plan (text)

  2. Seguridad
    - Mantener las políticas existentes de auth.users
*/

BEGIN;

-- Crear tabla de perfil de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text,
  apellido text,
  ciudad text,
  comuna_region text,
  pais text,
  tipo_plan text DEFAULT 'básico',
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los usuarios pueden ver sus propios perfiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar sus propios perfiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;