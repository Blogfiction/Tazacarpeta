-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

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
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create a separate policy for admin update access
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update activities policies
DROP POLICY IF EXISTS "Activities are visible to all authenticated users" ON activities;
DROP POLICY IF EXISTS "Only clients and admins can create activities" ON activities;
DROP POLICY IF EXISTS "Only clients and admins can update activities" ON activities;
DROP POLICY IF EXISTS "Only admins can delete activities" ON activities;

CREATE POLICY "Activities are visible to all authenticated users"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (true);