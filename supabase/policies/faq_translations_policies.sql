-- ===============================================
-- RLS Policies for FAQ Translations Table
-- ===============================================

-- Enable Row Level Security on faq_translations table
ALTER TABLE faq_translations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read translations of active FAQs only
-- This allows unauthenticated users to see translations for published FAQs
CREATE POLICY "Public can read translations of active FAQs" ON faq_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faqs
            WHERE faqs.id = faq_translations.faq_id
            AND faqs.status = 'active'
        )
    );

-- Policy 2: Authenticated users can read all translations
-- This allows logged-in users to see all FAQ translations including inactive ones
CREATE POLICY "Authenticated users can read all FAQ translations" ON faq_translations
    FOR SELECT USING (
        auth.role() IN ('authenticated', 'service_role')
    );

-- Policy 3: Admins have full CRUD access to translations
-- This allows administrators to create, read, update, and delete FAQ translations
CREATE POLICY "Admins can manage FAQ translations" ON faq_translations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Policy 4: Service role has full access (for backend operations)
CREATE POLICY "Service role full access to FAQ translations" ON faq_translations
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Policy 5: Users can create translations (if needed for multilingual content)
-- This allows authenticated users to suggest translations (optional)
-- Uncomment if you want to allow user-generated translations
/*
CREATE POLICY "Users can create FAQ translations" ON faq_translations
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );
*/

-- ===============================================
-- Comments for Security:
-- - Public users can only see translations for active FAQs
-- - Authenticated users can see all translations for all FAQs
-- - Admins can perform all operations (CRUD) on translations
-- - Service role (backend) has full access
-- - Policies are linked to parent FAQ status for public access
-- ===============================================