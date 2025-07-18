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