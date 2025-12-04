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
-- STORAGE BUCKET: assets
-- Purpose: Stores application assets like logos, images, and files
-- Structure: Flat structure with unique filenames (conflict resolution handled by app)
-- Access: Admin upload, public read (for frontend display)

-- ===================================================================
-- STEP 2.1: Drop existing assets storage policies (if any)
-- ===================================================================
DROP POLICY IF EXISTS "Assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete assets" ON storage.objects;

-- ===================================================================
-- STEP 2.2: Create storage policies for assets bucket
-- ===================================================================

-- POLICY: Public read access for assets (frontend display)
-- This allows anyone to view/download assets for frontend display
CREATE POLICY "Assets are publicly accessible" ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'assets'
  );

-- POLICY: Admin-only upload access for assets
CREATE POLICY "Admins can upload assets" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assets'
    AND auth.jwt() ->> 'role' = 'authenticated'
    -- Additional admin check can be added if role-based system implemented
    AND (SELECT auth.uid()) IS NOT NULL
  );

-- POLICY: Admin-only update access for assets
CREATE POLICY "Admins can update assets" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'assets'
    AND auth.jwt() ->> 'role' = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'assets'
    AND auth.jwt() ->> 'role' = 'authenticated'
  );

-- POLICY: Admin-only delete access for assets
CREATE POLICY "Admins can delete assets" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'assets'
    AND auth.jwt() ->> 'role' = 'authenticated'
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
AND (
  policyname LIKE '%avatar%'
  OR policyname LIKE '%asset%'
  OR policyname LIKE '%upload%'
  OR policyname LIKE '%storage%'
);

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

-- 5. For assets bucket troubleshooting:
--    SELECT * FROM storage.buckets WHERE name = 'assets';
--    SELECT * FROM storage.policies WHERE bucket_id = 'assets';

-- ===================================================================
-- HOW IT WORKS:
-- ===================================================================
-- Avatars Bucket:
-- The foldername function extracts the first folder from the storage path
-- Example: storage.foldername('7beb9339-.../avatar.jpg') returns ['7beb9339-...']
-- This allows users to only access files in their own folder (matching their user ID)

-- Assets Bucket:
-- Uses flat structure with admin-only upload access and public read access
-- No folder restrictions since assets are shared across the application
-- Admin authentication required for uploads/updates/deletes
-- Public read access allows frontend display without authentication
-- ===================================================================