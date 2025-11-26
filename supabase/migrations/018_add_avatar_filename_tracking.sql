-- ===================================================================
-- Avatar Filename Tracking Migration
-- ===================================================================
-- Minimal migration to add essential fields for enhanced avatar management:
-- - Real filename support for UI display
-- - Storage path tracking for cleanup functionality
-- - Backward compatible with existing avatar_url field

-- ===================================================================
-- STEP 1: Add essential filename tracking columns
-- ===================================================================

-- Add filename tracking for UI display
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_filename TEXT;

-- Add storage path for precise file cleanup
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT;

-- ===================================================================
-- STEP 2: Add performance indexes
-- ===================================================================

-- Index for filename searches (if needed in future)
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_filename ON user_profiles(avatar_filename);

-- Index for storage path lookups (used in cleanup operations)
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_storage_path ON user_profiles(avatar_storage_path);

-- ===================================================================
-- STEP 3: Verification
-- ===================================================================

-- Verify columns were added successfully
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('avatar_filename', 'avatar_storage_path')
ORDER BY column_name;

-- Show table structure for confirmation
SELECT 'Migration 018 completed successfully' as status,
       COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'user_profiles';

-- ===================================================================
-- MIGRATION NOTES:
-- ===================================================================

-- BACKWARD COMPATIBILITY:
-- ✅ Existing avatar_url field remains unchanged
-- ✅ All existing functionality continues to work
-- ✅ New fields are optional (NULL allowed)

-- NEW FUNCTIONALITY ENABLED:
-- ✅ Store original filename for UI display
-- ✅ Track exact storage path for cleanup
-- ✅ Support real filename conflict resolution
-- ✅ Enable automatic old file deletion

-- NEXT STEPS:
-- 1. Update upload API to populate new fields
-- 2. Update UI to display filename
-- 3. Implement cleanup logic using avatar_storage_path
-- 4. Handle conflict resolution with numbering pattern