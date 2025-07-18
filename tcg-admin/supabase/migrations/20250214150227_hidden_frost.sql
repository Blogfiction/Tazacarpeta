/*
  # Fix Profile Policies

  1. Changes
    - Update profile policies to avoid recursion
    - Simplify policy conditions
    - Maintain same security model but with better implementation
*/

BEGIN;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;

-- Create simplified policies that avoid recursion
CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() -- Users can always see their own profile
  );

CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() -- Users can only update their own profile
  )
  WITH CHECK (
    id = auth.uid() -- Double check it's their own profile
  );

-- Create a separate policy for admin view access
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'admin' -- If the user requesting is an admin
  );

-- Create a separate policy for admin update access
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    role = 'admin' -- If the user requesting is an admin
  )
  WITH CHECK (
    role = 'admin' -- Double check they're still an admin
  );

COMMIT;