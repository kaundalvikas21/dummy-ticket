-- ===============================================
-- Secure RLS Policies for About Dummy Tickets Translations Table
-- ===============================================

-- First, drop existing policies if they exist (remove embedded policies from migrations)
DROP POLICY IF EXISTS "Public read access - about_dummy_tickets_translations" ON about_dummy_tickets_translations;
DROP POLICY IF EXISTS "Authenticated read access - about_dummy_tickets_translations" ON about_dummy_tickets_translations;
DROP POLICY IF EXISTS "Admin full access - about_dummy_tickets_translations" ON about_dummy_tickets_translations;
DROP POLICY IF EXISTS "Public can read translations of active dummy tickets" ON about_dummy_tickets_translations;
DROP POLICY IF EXISTS "Authenticated users can read all about dummy tickets translations" ON about_dummy_tickets_translations;
DROP POLICY IF EXISTS "Admins can manage about dummy tickets translations" ON about_dummy_tickets_translations;
DROP POLICY IF EXISTS "Service role full access to about dummy tickets translations" ON about_dummy_tickets_translations;

-- Enable Row Level Security on about_dummy_tickets_translations table
ALTER TABLE about_dummy_tickets_translations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read translations of active about dummy tickets only
-- This allows unauthenticated users to see translations for published about dummy tickets
-- SECURITY FIX: Replaced overly permissive USING (true) with parent status validation
CREATE POLICY "Public can read translations of active about dummy tickets" ON about_dummy_tickets_translations
    FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM about_dummy_tickets
            WHERE about_dummy_tickets.id = about_dummy_tickets_translations.ticket_id
            AND about_dummy_tickets.status = 'active'
        )
    );

-- Policy 2: Authenticated users can read all translations
-- This allows logged-in users to see all about dummy tickets translations including inactive ones
CREATE POLICY "Authenticated users can read all about dummy tickets translations" ON about_dummy_tickets_translations
    FOR SELECT TO authenticated
    USING (
        auth.role() = 'authenticated'
    );

-- Policy 3: Admins can create about dummy tickets translations (RESTRICTED)
-- This allows only admin users to create new about dummy tickets translations
CREATE POLICY "Admins can create about dummy tickets translations" ON about_dummy_tickets_translations
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 4: Admins can update about dummy tickets translations (RESTRICTED)
-- This allows only admin users to update existing about dummy tickets translations
CREATE POLICY "Admins can update about dummy tickets translations" ON about_dummy_tickets_translations
    FOR UPDATE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 5: Admins can delete about dummy tickets translations (RESTRICTED)
-- This allows only admin users to delete about dummy tickets translations
CREATE POLICY "Admins can delete about dummy tickets translations" ON about_dummy_tickets_translations
    FOR DELETE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 6: Service role has full access (for backend operations)
CREATE POLICY "Service role full access to about dummy tickets translations" ON about_dummy_tickets_translations
    FOR ALL TO service_role
    USING (true);

-- ===============================================
-- Comments for Security:
-- - CRITICAL SECURITY FIX: Removed overly permissive public access (USING true)
-- - Public users can only see translations for active about dummy tickets (read-only)
-- - Authenticated users can see all translations for all about dummy tickets (read-only)
-- - Admin users can perform all operations (CRUD) on translations - JWT role validated
-- - Service role (backend) has full access for system operations
-- - Translation access is now properly linked to parent about_dummy_tickets status
-- - SECURITY FIX: Proper TO clauses added for execution optimization
-- - SECURITY FIX: Admin operations restricted to authenticated admin users only
-- - Pattern aligned with working FAQ translation implementation
-- ===============================================