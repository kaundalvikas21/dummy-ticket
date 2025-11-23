-- Create Admin Users using Supabase Auth System
-- This file seeds the system with initial admin and test users
-- using Supabase's built-in authentication (auth.users table)

-- Note: In production, users should be created through the application
-- or Supabase dashboard, not directly in SQL

-- This seed file creates user_profiles entries for test accounts
-- The actual auth.users entries will need to be created via:
-- 1. Supabase Dashboard, or
-- 2. Application registration flow, or
-- 3. Supabase Auth Admin API

-- Create user profiles for test accounts
-- These profiles will be linked to auth.users entries created via signup

INSERT INTO user_profiles (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone_number,
  nationality,
  preferred_language,
  role,
  created_at,
  updated_at
) VALUES
-- Admin user (auth_user_id should match UUID from auth.users after signup)
('00000000-0000-0000-0000-000000000001', 'Admin', 'User', 'admin@example.com', '+1234567890', 'US', 'en', 'admin', NOW(), NOW()),

-- Vendor user
('00000000-0000-0000-0000-000000000002', 'Vendor', 'User', 'vendor@example.com', '+1234567891', 'US', 'en', 'vendor', NOW(), NOW()),

-- Regular test user
('00000000-0000-0000-0000-000000000003', 'Test', 'User', 'user@example.com', '+1234567892', 'US', 'en', 'user', NOW(), NOW());

-- Verify insertion
SELECT 'User profiles seeded successfully' as status, COUNT(*) as profile_count FROM user_profiles;

-- Display created profiles
SELECT 'Created user profiles:' as info,
       first_name,
       last_name,
       email,
       role,
       created_at
FROM user_profiles
ORDER BY role, email;

-- IMPORTANT:
-- To make these accounts functional, you need to:
-- 1. Create corresponding auth.users entries via Supabase Dashboard signup
-- 2. Update the auth_user_id values above with the actual UUIDs from auth.users
-- 3. Or use the application registration flow which automatically creates both

-- For development/testing:
-- Use these credentials to create accounts via the app signup:
-- - admin@example.com (will be assigned admin role)
-- - vendor@example.com (will be assigned vendor role)
-- - user@example.com (will be assigned user role)
-- Password: admin123 (or any password you choose during signup)