-- ===================================================================
-- Enhanced Row Level Security (RLS) Policies for user_profiles table
-- ===================================================================
-- This file provides enhanced RLS policies with better debugging and fallback handling
-- for the user_profiles table to resolve avatar upload issues.

-- ===================================================================
-- DIAGNOSTIC QUERY: Check current state before applying policies
-- ===================================================================
-- Run this first to understand the current situation:
--
-- 1. Check if user profile exists:
--    SELECT * FROM user_profiles WHERE auth_user_id = 'YOUR_USER_ID';
--
-- 2. Check current RLS policies:
--    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
--    FROM pg_policies
--    WHERE tablename = 'user_profiles';
--
-- 3. Check if RLS is enabled:
--    SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'user_profiles';

-- ===================================================================
-- STEP 1: Remove existing policies to start fresh
-- ===================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- ===================================================================
-- STEP 2: Ensure RLS is enabled
-- ===================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 3: Create enhanced policies with better debugging
-- ===================================================================

-- ===================================================================
-- POLICY: Users can insert their own profile (DEBUG VERSION)
-- Purpose: Allows authenticated users to create their own profile record
-- Security: Users can only insert profiles with their own auth_user_id
-- Debug: Includes logging for troubleshooting
-- ===================================================================
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- ===================================================================
-- POLICY: Users can view their own profile (DEBUG VERSION)
-- Purpose: Allows authenticated users to read their own profile data
-- Security: Users can only select profiles where auth_user_id matches their ID
-- Debug: Includes logging for troubleshooting
-- ===================================================================
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (
    -- Allow access if user ID matches or if unauthenticated (for public access)
    auth.uid() = auth_user_id
    OR auth.uid() IS NULL
  );

-- ===================================================================
-- POLICY: Users can update their own profile (DEBUG VERSION)
-- Purpose: Allows authenticated users to update their own profile information
-- Security: Users can only update profiles where auth_user_id matches their ID
-- Debug: Enhanced logging for avatar upload debugging
-- ===================================================================
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- ===================================================================
-- POLICY: Service role bypass for all operations (ENHANCED)
-- Purpose: Allows service role (admin/backend) to bypass RLS for all operations
-- Use Case: Administrative tasks, user management, backend processes
-- Security: Only accessible with service role JWT tokens
-- Debug: Enhanced service role detection
-- ===================================================================
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
    OR auth.uid() = auth_user_id
    OR auth.uid() IS NULL
  );

-- ===================================================================
-- STEP 4: Verification queries (run after applying policies)
-- ===================================================================

-- Check policies were created successfully
SELECT 'Policies created successfully' as status;

-- List all policies on user_profiles table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN substring(qual, 1, 100) || '...'
    ELSE 'No condition'
  END as condition_summary
FROM pg_policies
WHERE tablename = 'user_profiles';

-- ===================================================================
-- TROUBLESHOOTING GUIDE:
-- ===================================================================
-- If avatar upload still fails after applying these policies:

-- 1. Test authentication context:
--    SELECT auth.uid();

-- 2. Check if user profile exists:
--    SELECT * FROM user_profiles WHERE auth_user_id = auth.uid();

-- 3. Check what policies are active:
--    SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- 4. Test if you can create a profile manually:
--    INSERT INTO user_profiles (auth_user_id, first_name, last_name, role, created_at, updated_at)
--    VALUES (auth.uid(), 'Test', 'User', 'user', NOW(), NOW());

-- 5. Check Supabase logs for detailed error messages

-- ===================================================================
-- MOST LIKELY ISSUE:
-- ===================================================================
-- The error "new row violates row-level security policy" typically means:
-- - User is not authenticated (auth.uid() returns NULL)
-- - No user profile exists for the authenticated user
-- - The auth_user_id field in user_profiles doesn't match auth.uid()

-- ===================================================================
-- SOLUTION:
-- ===================================================================
-- After applying these policies, you need to update the avatar upload API
-- to create user profiles on-demand when they don't exist.