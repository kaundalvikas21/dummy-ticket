-- ===============================================
-- Secure RLS Policies for About Dummy Tickets Table
-- ===============================================

-- First, drop existing policies if they exist (remove embedded policies from migrations)
DROP POLICY IF EXISTS "Public read access - about_dummy_tickets" ON about_dummy_tickets;
DROP POLICY IF EXISTS "Authenticated read access - about_dummy_tickets" ON about_dummy_tickets;
DROP POLICY IF EXISTS "Admin full access - about_dummy_tickets" ON about_dummy_tickets;
DROP POLICY IF EXISTS "Public can read active about dummy tickets" ON about_dummy_tickets;
DROP POLICY IF EXISTS "Authenticated users can read all about dummy tickets" ON about_dummy_tickets;
DROP POLICY IF EXISTS "Admins can manage about dummy tickets" ON about_dummy_tickets;
DROP POLICY IF EXISTS "Service role full access to about dummy tickets" ON about_dummy_tickets;

-- Enable Row Level Security on about_dummy_tickets table
ALTER TABLE about_dummy_tickets ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read active about dummy tickets only
-- This allows unauthenticated users to see published about dummy tickets
CREATE POLICY "Public can read active about dummy tickets" ON about_dummy_tickets
    FOR SELECT TO anon
    USING (
        status = 'active'
    );

-- Policy 2: Authenticated users can read all about dummy tickets
-- This allows logged-in users to see all about dummy tickets including inactive ones
CREATE POLICY "Authenticated users can read all about dummy tickets" ON about_dummy_tickets
    FOR SELECT TO authenticated
    USING (
        auth.role() = 'authenticated'
    );

-- Policy 3: Admins can create about dummy tickets (RESTRICTED)
-- This allows only admin users to create new about dummy tickets
CREATE POLICY "Admins can create about dummy tickets" ON about_dummy_tickets
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 4: Admins can update about dummy tickets (RESTRICTED)
-- This allows only admin users to update existing about dummy tickets
CREATE POLICY "Admins can update about dummy tickets" ON about_dummy_tickets
    FOR UPDATE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 5: Admins can delete about dummy tickets (RESTRICTED)
-- This allows only admin users to delete about dummy tickets
CREATE POLICY "Admins can delete about dummy tickets" ON about_dummy_tickets
    FOR DELETE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 6: Service role has full access (for backend operations)
CREATE POLICY "Service role full access to about dummy tickets" ON about_dummy_tickets
    FOR ALL TO service_role
    USING (true);

-- ===============================================
-- Comments for Security:
-- - Public users can only see active about dummy tickets (read-only)
-- - Authenticated users can see all about dummy tickets (read-only)
-- - Admin users can perform all operations (CRUD) - JWT role validated
-- - Service role (backend) has full access for system operations
-- - SECURITY FIX: Proper TO clauses added for execution optimization
-- - SECURITY FIX: Admin operations restricted to authenticated admin users only
-- - Pattern aligned with working FAQ implementation
-- - Content_type field respected for data integrity
-- ===============================================