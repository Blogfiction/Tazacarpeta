/*
  # Update Profile Creation Trigger

  1. Changes
    - Modify handle_new_user trigger to set tipo_plan = 'Usuario' by default
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, tipo_plan)
  VALUES (new.id, 'Usuario');
  RETURN new;
END;
$$ language plpgsql security definer;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();