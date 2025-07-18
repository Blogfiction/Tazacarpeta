/*
  # Role-based Access Control Implementation

  1. Changes
    - Create user_role enum type
    - Add role column to profiles
    - Update RLS policies for all tables with role-based access
*/

BEGIN;

-- Create role enum type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('usuario', 'cliente', 'admin');
  END IF;
END $$;

-- Add role column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'usuario';

-- Update existing RLS policies for profiles
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios perfiles" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios perfiles" ON profiles;

-- Create new role-based policies for profiles
CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
  )
  WITH CHECK (
    id = auth.uid() 
    AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
      )
      OR role = (SELECT role FROM profiles WHERE id = auth.uid())
    )
  );

-- Update policies for activities
DROP POLICY IF EXISTS "Actividades son visibles para todos" ON activities;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden crear actividades" ON activities;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar actividades" ON activities;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar actividades" ON activities;

CREATE POLICY "Activities are visible to all authenticated users"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only clients and admins can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('cliente', 'admin')
    )
  );

CREATE POLICY "Only clients and admins can update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('cliente', 'admin')
    )
  );

CREATE POLICY "Only admins can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update policies for stores
DROP POLICY IF EXISTS "Tiendas son visibles para todos" ON stores;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden crear tiendas" ON stores;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar tiendas" ON stores;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar tiendas" ON stores;

CREATE POLICY "Stores are visible to all authenticated users"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete stores"
  ON stores FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update policies for games
DROP POLICY IF EXISTS "Juegos visibles para todos" ON games;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden crear juegos" ON games;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar juegos" ON games;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar juegos" ON games;

CREATE POLICY "Games are visible to all authenticated users"
  ON games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update games"
  ON games FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete games"
  ON games FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

COMMIT;