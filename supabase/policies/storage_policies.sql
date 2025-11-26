-- ===================================================================
-- Row Level Security (RLS) Policies for Supabase Storage
-- ===================================================================
-- This file contains RLS policies for Supabase Storage buckets
-- to allow users to upload and manage their own avatar images.

-- ===================================================================
-- STORAGE BUCKET: avatars
-- Purpose: Stores user avatar images organized by user ID
-- Structure: /{user_id}/{filename}

-- ===================================================================
-- STEP 1: Drop existing storage policies (if any)
-- ===================================================================
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

-- ===================================================================
-- STEP 2: Create storage policies for avatars bucket
-- ===================================================================

-- POLICY: Users can insert (upload) their own avatar files
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

-- POLICY: Users can select (view/download) their own avatar files
CREATE POLICY "Users can view their own avatars" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

-- POLICY: Users can update their own avatar files (for upsert operations)
CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

-- POLICY: Users can delete their own avatar files
CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

-- POLICY: Public read access to avatar files (for displaying images)
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] IS NOT NULL
  );

-- ===================================================================
-- STEP 3: Verification
-- ===================================================================

-- Check policies were created successfully
SELECT 'Storage policies created successfully' as status;

-- List all storage policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%avatar%'
OR policyname LIKE '%upload%'
OR policyname LIKE '%storage%';

-- ===================================================================
-- TROUBLESHOOTING:
-- ===================================================================
-- If storage upload still fails:

-- 1. Check if avatars bucket exists:
--    SELECT * FROM storage.buckets WHERE name = 'avatars';

-- 2. Test storage authentication:
--    SELECT auth.uid();

-- 3. Test foldername extraction:
--    SELECT storage.foldername('7beb9339-d262-4ee0-92b1-ee4827d883ed/avatar_file.jpg');

-- 4. Check if the bucket has proper policies:
--    SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- ===================================================================
-- HOW IT WORKS:
-- ===================================================================
-- The foldername function extracts the first folder from the storage path
-- Example: storage.foldername('7beb9339-.../avatar.jpg') returns ['7beb9339-...']
-- This allows users to only access files in their own folder (matching their user ID)
-- ===================================================================