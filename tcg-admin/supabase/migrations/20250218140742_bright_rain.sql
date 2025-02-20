-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  raw_user_meta_data JSONB;
BEGIN
  -- Get the raw user metadata
  raw_user_meta_data := NEW.raw_user_meta_data;

  -- Insert into profiles with data from metadata
  INSERT INTO public.profiles (
    id,
    email,
    nombre,
    comuna_region,
    role,
    tipo_plan
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(raw_user_meta_data->>'nombre', ''),
    COALESCE(raw_user_meta_data->>'comuna_region', ''),
    'usuario',
    'básico'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;