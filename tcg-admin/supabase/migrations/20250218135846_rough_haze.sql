-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure profiles table has correct structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'usuario',
ADD COLUMN IF NOT EXISTS tipo_plan text DEFAULT 'básico';

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Profiles are insertable by the trigger function" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;

-- Create simplified policies
CREATE POLICY "Enable read access for all users"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Enable insert for auth users"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Create simplified function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    tipo_plan
  )
  VALUES (
    NEW.id,
    NEW.email,
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;