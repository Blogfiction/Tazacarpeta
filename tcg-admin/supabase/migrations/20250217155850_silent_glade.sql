/*
  # Fix User Stats Initialization

  1. Changes
    - Drop and recreate trigger for user stats initialization
    - Add missing stats for existing users
    - Ensure proper error handling in function

  2. Security
    - Maintain existing RLS policies
    - Keep security definer for function
*/

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_stats ON auth.users;
DROP FUNCTION IF EXISTS initialize_user_stats();

-- Create improved function for initializing user stats
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS trigger AS $$
BEGIN
  -- Check if stats already exist for this user
  IF NOT EXISTS (
    SELECT 1 FROM user_stats WHERE user_id = NEW.id
  ) THEN
    -- Create initial stats
    INSERT INTO user_stats (
      user_id,
      current_level,
      total_xp,
      last_level_up,
      events_attended,
      events_organized,
      activity_score,
      attendance_rate,
      platform_time_minutes,
      current_streak,
      longest_streak,
      favorite_categories,
      event_diversity_score
    ) VALUES (
      NEW.id,
      1,
      0,
      now(),
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      '[]'::jsonb,
      0
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_stats();

-- Initialize stats for existing users
DO $$
BEGIN
  INSERT INTO user_stats (
    user_id,
    current_level,
    total_xp,
    last_level_up,
    events_attended,
    events_organized,
    activity_score,
    attendance_rate,
    platform_time_minutes,
    current_streak,
    longest_streak,
    favorite_categories,
    event_diversity_score
  )
  SELECT 
    id,
    1,
    0,
    now(),
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    '[]'::jsonb,
    0
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM user_stats s WHERE s.user_id = u.id
  );
END $$;