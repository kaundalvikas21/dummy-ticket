-- ===============================================
-- Secure RLS Policies for About Stats Translations Table
-- ===============================================

-- First, drop existing policies if they exist (remove embedded policies from migrations)
DROP POLICY IF EXISTS "Public read access - about_stats_translations" ON about_stats_translations;
DROP POLICY IF EXISTS "Authenticated read access - about_stats_translations" ON about_stats_translations;
DROP POLICY IF EXISTS "Admin full access - about_stats_translations" ON about_stats_translations;
DROP POLICY IF EXISTS "Public can read translations of active about stats" ON about_stats_translations;
DROP POLICY IF EXISTS "Authenticated users can read all about stats translations" ON about_stats_translations;
DROP POLICY IF EXISTS "Admins can manage about stats translations" ON about_stats_translations;
DROP POLICY IF EXISTS "Service role full access to about stats translations" ON about_stats_translations;

-- Enable Row Level Security on about_stats_translations table
ALTER TABLE about_stats_translations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read translations of active about stats only
-- This allows unauthenticated users to see translations for published about stats
-- SECURITY FIX: Replaced overly permissive USING (true) with parent status validation
CREATE POLICY "Public can read translations of active about stats" ON about_stats_translations
    FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM about_stats
            WHERE about_stats.id = about_stats_translations.stat_id
            AND about_stats.status = 'active'
        )
    );

-- Policy 2: Authenticated users can read all translations
-- This allows logged-in users to see all about stats translations including inactive ones
CREATE POLICY "Authenticated users can read all about stats translations" ON about_stats_translations
    FOR SELECT TO authenticated
    USING (
        auth.role() = 'authenticated'
    );

-- Policy 3: Admins can create about stats translations (RESTRICTED)
-- This allows only admin users to create new about stats translations
CREATE POLICY "Admins can create about stats translations" ON about_stats_translations
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 4: Admins can update about stats translations (RESTRICTED)
-- This allows only admin users to update existing about stats translations
CREATE POLICY "Admins can update about stats translations" ON about_stats_translations
    FOR UPDATE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 5: Admins can delete about stats translations (RESTRICTED)
-- This allows only admin users to delete about stats translations
CREATE POLICY "Admins can delete about stats translations" ON about_stats_translations
    FOR DELETE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 6: Service role has full access (for backend operations)
CREATE POLICY "Service role full access to about stats translations" ON about_stats_translations
    FOR ALL TO service_role
    USING (true);

-- ===============================================
-- Comments for Security:
-- - CRITICAL SECURITY FIX: Removed overly permissive public access (USING true)
-- - Public users can only see translations for active about stats (read-only)
-- - Authenticated users can see all translations for all about stats (read-only)
-- - Admin users can perform all operations (CRUD) on translations - JWT role validated
-- - Service role (backend) has full access for system operations
-- - Translation access is now properly linked to parent about_stats status
-- - SECURITY FIX: Proper TO clauses added for execution optimization
-- - SECURITY FIX: Admin operations restricted to authenticated admin users only
-- - Pattern aligned with working FAQ translation implementation
-- ===============================================