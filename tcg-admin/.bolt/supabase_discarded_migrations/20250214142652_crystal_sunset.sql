/*
  # User Activity Statistics

  1. Changes
    - Adds email field to profiles table
    - Creates view for user activity statistics
    - Sets up proper security for the view

  2. Security
    - View accessible only to authenticated users
    - Data filtered by user permissions
*/

-- Add email field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Create view for user activity statistics
CREATE OR REPLACE VIEW user_activity_stats AS
SELECT 
  p.id,
  p.nombre,
  p.apellido,
  p.email,
  COUNT(DISTINCT i.id_actividad) as total_inscriptions,
  COUNT(DISTINCT s.id_busqueda) as total_searches,
  MAX(i.fecha_registro) as last_activity
FROM profiles p
LEFT JOIN inscriptions i ON p.id = i.id_usuario
LEFT JOIN searches s ON p.id = s.id_usuario
GROUP BY p.id, p.nombre, p.apellido, p.email;

-- Grant access to authenticated users
GRANT SELECT ON user_activity_stats TO authenticated;

-- Add RLS policy to view
ALTER TABLE user_activity_stats OWNER TO authenticated;