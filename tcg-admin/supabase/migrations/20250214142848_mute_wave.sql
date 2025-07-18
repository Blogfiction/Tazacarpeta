/*
  # Fix User Activity Statistics

  1. Changes
    - Adds email field to profiles table if not exists
    - Creates view for user activity statistics
    - Grants proper permissions to authenticated users

  Note: Views don't support RLS policies directly
*/

-- Add email field to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Drop view if exists to ensure clean recreation
DROP VIEW IF EXISTS user_activity_stats;

-- Create view for user activity statistics
CREATE OR REPLACE VIEW user_activity_stats AS
SELECT 
  p.id,
  p.nombre,
  p.apellido,
  p.email,
  COALESCE(COUNT(DISTINCT i.id_actividad), 0) as total_inscriptions,
  COALESCE(COUNT(DISTINCT s.id_busqueda), 0) as total_searches,
  MAX(i.fecha_registro) as last_activity
FROM profiles p
LEFT JOIN inscriptions i ON p.id = i.id_usuario
LEFT JOIN searches s ON p.id = s.id_usuario
GROUP BY p.id, p.nombre, p.apellido, p.email;

-- Grant access to authenticated users
GRANT SELECT ON user_activity_stats TO authenticated;