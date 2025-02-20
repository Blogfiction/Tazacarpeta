/*
  # Revertir cambios de estadísticas de usuario

  Este script elimina las tablas, funciones y triggers relacionados con las estadísticas
  de usuario para volver al estado anterior del sistema.

  1. Eliminación de Tablas
    - level_definitions
    - achievement_definitions
    - user_stats
    - user_achievements

  2. Eliminación de Funciones
    - calculate_user_level
    - calculate_activity_score
    - update_user_stats
    - initialize_user_stats

  3. Eliminación de Triggers
    - on_user_stats_update
    - on_auth_user_created_stats
*/

-- Eliminar triggers
DROP TRIGGER IF EXISTS on_user_stats_update ON user_stats;
DROP TRIGGER IF EXISTS on_auth_user_created_stats ON auth.users;

-- Eliminar funciones
DROP FUNCTION IF EXISTS calculate_user_level(INTEGER);
DROP FUNCTION IF EXISTS calculate_activity_score(INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_user_stats();
DROP FUNCTION IF EXISTS initialize_user_stats();

-- Eliminar tablas
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS user_stats;
DROP TABLE IF EXISTS achievement_definitions;
DROP TABLE IF EXISTS level_definitions;