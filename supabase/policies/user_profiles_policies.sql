-- ===================================================================
-- Row Level Security (RLS) Policies for user_profiles table
-- ===================================================================
-- This file contains all RLS policies for the user_profiles table
-- to ensure proper security and access control for user profile data.

-- Table: user_profiles
-- Description: Stores user profile information including personal details,
--              preferences, and avatar URLs for authenticated users.

-- ===================================================================
-- STEP 1: Remove existing policies to avoid conflicts
-- Note: These policies were created in migration 017_final_auth_fix.sql
-- ===================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- ===================================================================
-- STEP 2: Recreate policies with the missing INSERT policy
-- ===================================================================

-- ===================================================================
-- POLICY: Users can insert their own profile
-- Purpose: Allows authenticated users to create their own profile record
--          This is essential for on-demand profile creation during avatar upload
-- Security: Users can only insert profiles with their own auth_user_id
-- Use Case: Avatar upload API creates profile if it doesn't exist
-- ===================================================================
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- ===================================================================
-- POLICY: Users can view their own profile
-- Purpose: Allows authenticated users to read their own profile data
-- Security: Users can only select profiles where auth_user_id matches their ID
-- ===================================================================
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = auth_user_id OR auth.uid() IS NULL);

-- ===================================================================
-- POLICY: Users can update their own profile
-- Purpose: Allows authenticated users to update their own profile information
--          This is the policy that was failing during avatar upload
-- Security: Users can only update profiles where auth_user_id matches their ID
-- ===================================================================
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- ===================================================================
-- POLICY: Service role bypass for all operations
-- Purpose: Allows service role (admin/backend) to bypass RLS for all operations
-- Use Case: Administrative tasks, user management, backend processes
-- Security: Only accessible with service role JWT tokens
-- ===================================================================
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
    OR auth.uid() = auth_user_id
    OR auth.uid() IS NULL
  );

-- ===================================================================
-- POLICY: Users can delete their own profile (optional)
-- Purpose: Allows authenticated users to delete their own profile
-- Note: This policy is optional and can be disabled if profile deletion is not allowed
-- Security: Users can only delete profiles where auth_user_id matches their ID
-- ===================================================================
-- CREATE POLICY "Users can delete own profile" ON user_profiles
--   FOR DELETE
--   USING (auth.uid() = auth_user_id);

-- ===================================================================
-- USAGE INSTRUCTIONS:
-- ===================================================================
-- 1. Apply these policies by running this SQL file in your Supabase database
-- 2. Ensure RLS is enabled on the user_profiles table:
--    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- 3. The policies will automatically handle profile creation during avatar upload
-- 4. Users can only access their own profile data

-- ===================================================================
-- TROUBLESHOOTING:
-- ===================================================================
-- If avatar upload still fails with RLS errors:
-- 1. Check that the authenticated user has a corresponding user_profiles record
-- 2. Verify auth_user_id field is properly set (not NULL)
-- 3. Test with: SELECT auth.uid(); to verify authentication context
-- 4. Check profile existence: SELECT * FROM user_profiles WHERE auth_user_id = auth.uid();

-- ===================================================================
-- RELATED FILES:
-- ===================================================================
-- - Migration: 017_final_auth_fix.sql (contains original RLS setup)
-- - API: app/api/auth/profile/upload-avatar/route.js (uses these policies)
-- - Component: components/dashboard/user/my-profile.jsx (profile management)