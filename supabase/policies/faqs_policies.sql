-- ===============================================
-- Working RLS Policies for FAQs Table
-- ===============================================

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can read all FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can create FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can update FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON faqs;
DROP POLICY IF EXISTS "Service role full access to FAQs" ON faqs;

-- Enable Row Level Security on faqs table
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read active FAQs only
-- This allows unauthenticated users to see published FAQs
CREATE POLICY "Public can read active FAQs" ON faqs
    FOR SELECT TO anon
    USING (
        status = 'active'
    );

-- Policy 2: Authenticated users can read all FAQs
-- This allows logged-in users to see all FAQs including inactive ones
CREATE POLICY "Authenticated users can read all FAQs" ON faqs
    FOR SELECT TO authenticated
    USING (
        auth.role() = 'authenticated'
    );

-- Policy 3: Admins can create FAQs (RESTRICTED)
-- This allows only admin users to create new FAQs
CREATE POLICY "Admins can create FAQs" ON faqs
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 4: Admins can update FAQs (RESTRICTED)
-- This allows only admin users to update existing FAQs
CREATE POLICY "Admins can update FAQs" ON faqs
    FOR UPDATE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 5: Admins can delete FAQs (RESTRICTED)
-- This allows only admin users to delete FAQs
CREATE POLICY "Admins can delete FAQs" ON faqs
    FOR DELETE TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 6: Service role has full access (for backend operations)
CREATE POLICY "Service role full access to FAQs" ON faqs
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- ===============================================
-- Comments for Security:
-- - Public users can only see active FAQs (read-only)
-- - Authenticated users (user, vendor) can see all FAQs (read-only)
-- - Admin users can perform all operations (CRUD) - JWT role validated
-- - Service role (backend) has full access for system operations
-- - SECURITY FIX: Write operations now restricted to admins only
-- - Performance optimization: Added TO clauses for better execution
-- ===============================================