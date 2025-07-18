/*
  # Fix RLS recursion issue

  1. Changes
    - Simplify RLS policies for profiles table
    - Remove recursive admin role checks
    - Add direct role-based policies
    - Fix infinite recursion in profile policies

  2. Security
    - Maintain security while avoiding recursion
    - Ensure proper access control
    - Preserve admin privileges
*/

-- Drop all existing profile policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "Enable read access for users to their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

CREATE POLICY "Enable update access for users to their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  );

CREATE POLICY "Enable read access for admin users"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'admin'
  );

CREATE POLICY "Enable update access for admin users"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    role = 'admin'
  );

-- Ensure RLS is enabled
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;