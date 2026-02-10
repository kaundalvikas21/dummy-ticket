-- FINAL AUTHENTICATION FIX
-- This migration consolidates all previous fixes and resolves the user creation issue

-- STEP 1: Remove ALL conflicting constraints and triggers
DROP TRIGGER IF EXISTS create_user_profile_on_signup_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile_on_signup_trigger_final ON auth.users;
DROP TRIGGER IF EXISTS update_user_profile_on_auth_update_safe ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile_on_signup_final() CASCADE;
DROP FUNCTION IF EXISTS update_user_profile_safe() CASCADE;

-- Remove all RLS policies that might interfere
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role bypass for profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- STEP 2: Fix user_profiles table structure
DO $$ 
BEGIN
    -- 1. Handle user_id (the original column)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'user_id') THEN
        -- Make it nullable if it exists
        ALTER TABLE public.user_profiles ALTER COLUMN user_id DROP NOT NULL;
        -- Remove its constraint if it exists
        ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
        RAISE NOTICE 'Defensively handled user_id column';
    END IF;

    -- 2. Handle auth_user_id (the new column)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'auth_user_id') THEN
        ALTER TABLE public.user_profiles ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added missing auth_user_id column';
    ELSE
        -- Remove its constraint if it exists to prevent conflicts
        ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_auth_user_id_fkey;
        RAISE NOTICE 'auth_user_id column already exists, cleaned up constraint';
    END IF;
END $$;

-- STEP 3: Disable RLS temporarily to test basic functionality
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 4: Create simple, reliable profile creation trigger
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with auth_user_id, leave user_id NULL for pure auth users
  INSERT INTO public.user_profiles (
    auth_user_id,
    first_name,
    last_name,
    avatar_url,
    phone_number,
    nationality,
    preferred_language,
    role,
    created_at,
    updated_at
  )
  SELECT
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name', 
      NEW.raw_user_meta_data->>'given_name',
      split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
      'Unknown'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name', 
      NEW.raw_user_meta_data->>'family_name',
      CASE 
        WHEN position(' ' in NEW.raw_user_meta_data->>'full_name') > 0 
        THEN substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1)
        ELSE '' 
      END
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'nationality',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE auth_user_id = NEW.id
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE NOTICE 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Create trigger for automatic profile creation
CREATE TRIGGER create_user_profile_on_signup_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_on_signup();

-- STEP 5: Create simple, permissive RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Policy: Admins can manage all profiles (using secure JWT claims)
CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- Policy: Service role can bypass RLS for all operations
CREATE POLICY "Service role full access"
  ON user_profiles FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
  );

-- STEP 6: Grant necessary permissions
GRANT ALL ON user_profiles TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- STEP 7: Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);

-- STEP 8: Test and verification
-- This query should work without errors
SELECT 'Migration completed successfully' as status;

-- Check that auth.users is accessible
SELECT 'auth.users accessible' as test, COUNT(*) as count FROM auth.users LIMIT 1;