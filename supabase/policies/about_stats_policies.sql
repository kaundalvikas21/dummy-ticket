-- ===============================================
-- Secure RLS Policies for About Stats Table
-- ===============================================

-- First, drop existing policies if they exist (remove embedded policies from migrations)
DROP POLICY IF EXISTS "Public read access - about_stats" ON about_stats;
DROP POLICY IF EXISTS "Authenticated read access - about_stats" ON about_stats;
DROP POLICY IF EXISTS "Admin full access - about_stats" ON about_stats;
DROP POLICY IF EXISTS "Public can read active about stats" ON about_stats;
DROP POLICY IF EXISTS "Authenticated users can read all about stats" ON about_stats;
DROP POLICY IF EXISTS "Admins can manage about stats" ON about_stats;
DROP POLICY IF EXISTS "Service role full access to about stats" ON about_stats;

-- Enable Row Level Security on about_stats table
ALTER TABLE about_stats ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read active about stats only
-- This allows unauthenticated users to see published about stats
CREATE POLICY "Public can read active about stats" ON about_stats
    FOR SELECT TO anon
    USING (
        status = 'active'
    );

-- Policy 2: Authenticated users can read all about stats
-- This allows logged-in users to see all about stats including inactive ones
CREATE POLICY "Authenticated users can read all about stats" ON about_stats
    FOR SELECT TO authenticated
    USING (
        auth.role() = 'authenticated'
    );

-- Policy 3: Admins can create about stats (RESTRICTED)
-- This allows only admin users to create new about stats
CREATE POLICY "Admins can create about stats" ON about_stats
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 4: Admins can update about stats (RESTRICTED)
-- This allows only admin users to update existing about stats
CREATE POLICY "Admins can update about stats" ON about_stats
    FOR UPDATE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 5: Admins can delete about stats (RESTRICTED)
-- This allows only admin users to delete about stats
CREATE POLICY "Admins can delete about stats" ON about_stats
    FOR DELETE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 6: Service role has full access (for backend operations)
CREATE POLICY "Service role full access to about stats" ON about_stats
    FOR ALL TO service_role
    USING (true);

-- ===============================================
-- Comments for Security:
-- - Public users can only see active about stats (read-only)
-- - Authenticated users can see all about stats (read-only)
-- - Admin users can perform all operations (CRUD) - JWT role validated
-- - Service role (backend) has full access for system operations
-- - SECURITY FIX: Proper TO clauses added for execution optimization
-- - SECURITY FIX: Admin operations restricted to authenticated admin users only
-- - Pattern aligned with working FAQ implementation
-- ===============================================