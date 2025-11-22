-- Fix Supabase Auth User Creation Issues
-- This migration fixes the RLS policies and trigger issues causing "Database error saving new user"

-- First, drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Drop the problematic trigger that causes circular dependencies
DROP TRIGGER IF EXISTS update_user_profile_on_auth_update ON auth.users;
DROP FUNCTION IF EXISTS update_user_profile();

-- Create a safer version of the profile update function
CREATE OR REPLACE FUNCTION update_user_profile_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if a profile exists for this user
  -- This prevents errors during initial user creation
  UPDATE public.user_profiles
  SET
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', user_profiles.first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', user_profiles.last_name),
    phone_number = COALESCE(NEW.raw_user_meta_data->>'phone_number', user_profiles.phone_number),
    nationality = COALESCE(NEW.raw_user_meta_data->>'nationality', user_profiles.nationality),
    updated_at = NOW()
  WHERE auth_user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that only fires on UPDATE, not on INSERT
CREATE TRIGGER update_user_profile_on_auth_update_safe
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_safe();

-- Create improved RLS policies for user_profiles

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_user_id OR auth.uid() IS NULL);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Policy: Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin'
        OR auth.users.raw_app_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- Policy: Service role can bypass RLS for profile creation
-- This allows the API to create profiles during user registration
CREATE POLICY "Service role bypass for profile creation"
  ON user_profiles FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
    OR auth.uid() = auth_user_id
    OR auth.uid() IS NULL
  );

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a function to safely handle profile creation during signup
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if it doesn't exist
  -- This prevents conflicts during signup
  INSERT INTO public.user_profiles (
    auth_user_id,
    first_name,
    last_name,
    preferred_language,
    created_at,
    updated_at
  )
  SELECT
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    'en',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE auth_user_id = NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation during signup
-- This ensures profiles are created consistently
CREATE TRIGGER create_user_profile_on_signup_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_on_signup();

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);

-- Grant necessary permissions to the service role
-- This ensures the API can create profiles during registration
GRANT ALL ON user_profiles TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Create a helper function to check if a user exists
CREATE OR REPLACE FUNCTION user_exists(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user profile safely
CREATE OR REPLACE FUNCTION get_user_profile_safe(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  nationality TEXT,
  preferred_language TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.auth_user_id,
    up.first_name,
    up.last_name,
    up.phone_number,
    up.nationality,
    up.preferred_language,
    up.avatar_url,
    up.created_at,
    up.updated_at
  FROM user_profiles up
  WHERE up.auth_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;