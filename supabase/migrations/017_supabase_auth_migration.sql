-- Supabase Auth Migration Schema
-- This migration adds the necessary schema changes to support Supabase Auth

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS user_migrations (
  old_id UUID PRIMARY KEY,
  new_auth_id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT,
  migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  migration_status TEXT DEFAULT 'pending' CHECK (migration_status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Add indexes for migration tracking
CREATE INDEX IF NOT EXISTS idx_user_migrations_new_auth_id ON user_migrations(new_auth_id);
CREATE INDEX IF NOT EXISTS idx_user_migrations_status ON user_migrations(migration_status);
CREATE INDEX IF NOT EXISTS idx_user_migrations_email ON user_migrations(email);

-- Add auth_user_id to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique constraint to ensure one profile per auth user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'unique_auth_user_id'
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT unique_auth_user_id UNIQUE (auth_user_id);
  END IF;
END $$;

-- Add auth_user_id to contact_submissions if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_submissions' AND column_name = 'user_id') THEN
    ALTER TABLE contact_submissions
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Note: Automatic profile creation trigger is disabled
-- Profile creation will be handled in the API routes to avoid conflicts
-- This prevents "Database error saving new user" issues during signup

-- Function to update user profile from metadata
CREATE OR REPLACE FUNCTION update_user_profile()
RETURNS TRIGGER AS $$
BEGIN
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

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS update_user_profile_on_auth_update ON auth.users;
CREATE TRIGGER update_user_profile_on_auth_update
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Add RLS policies for user_profiles table if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Admins can view all profiles (assuming admin role check)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Function to get user by role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT raw_app_meta_data->>'role'
    FROM auth.users
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_uuid
    AND raw_app_meta_data->>'role' = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;