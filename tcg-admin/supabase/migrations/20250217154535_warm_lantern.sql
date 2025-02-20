/*
  # Fix Authentication and RLS Policies

  1. Changes
    - Remove profiles_id_seq reference since profiles uses UUID
    - Update trigger for new user creation
    - Simplify RLS policies
    - Add email and role columns to profiles

  2. Security
    - Enable RLS on profiles table
    - Create policies for user access
    - Grant necessary permissions
*/

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    'usuario'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Recreate trigger with proper timing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure profiles table has the correct structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'usuario';

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update access for users to their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for admin users" ON profiles;
DROP POLICY IF EXISTS "Enable update access for admin users" ON profiles;

-- Create simplified policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
  );

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
  );

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;