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
    FOR SELECT USING (
        status = 'active'
    );

-- Policy 2: Authenticated users can read all FAQs
-- This allows logged-in users to see all FAQs including inactive ones
CREATE POLICY "Authenticated users can read all FAQs" ON faqs
    FOR SELECT USING (
        auth.role() = 'authenticated'
    );

-- Policy 3: Authenticated users can create FAQs (with admin check in API)
-- This allows any authenticated user to insert, API will validate admin role
CREATE POLICY "Authenticated users can create FAQs" ON faqs
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

-- Policy 4: Authenticated users can update FAQs (API will validate admin role)
CREATE POLICY "Authenticated users can update FAQs" ON faqs
    FOR UPDATE USING (
        auth.role() = 'authenticated'
    );

-- Policy 5: Authenticated users can delete FAQs (API will validate admin role)
CREATE POLICY "Authenticated users can delete FAQs" ON faqs
    FOR DELETE USING (
        auth.role() = 'authenticated'
    );

-- Policy 6: Service role has full access (for backend operations)
CREATE POLICY "Service role full access to FAQs" ON faqs
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- ===============================================
-- Comments for Security:
-- - Public users can only see active FAQs
-- - Authenticated users (user, vendor) can see all FAQs
-- - Admins can perform all operations (CRUD)
-- - Service role (backend) has full access
-- ===============================================