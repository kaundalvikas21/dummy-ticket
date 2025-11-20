-- ===================================================================
-- Footer Management Table
-- ===================================================================
-- Purpose: Stores all configurable content for the website footer section
-- Updated: Supports Supabase storage-based logo management with RLS policies
-- Sections: logo, description, address, company, support, contact, social
-- ===================================================================

CREATE TABLE footer (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,                    -- Unique record identifier

    -- Content categorization
    section VARCHAR(50) NOT NULL,                                      -- Footer section: 'logo', 'description', 'address', 'company', 'support', 'contact', 'social'
    title TEXT,                                                         -- Display title for links and contact items

    -- Main content storage
    content TEXT,                                                       -- Primary content: URLs, addresses, descriptions, social links, storage URLs

    -- Additional metadata (JSON for flexibility)
    extra_data JSONB DEFAULT '{}',                                     -- {alt_text, company_name, icon_name, icon_type, country, link_type, storage_path, file_type}

    -- Display ordering
    sort_order INTEGER DEFAULT 0,                                      -- Display order within each section (0 = first)

    -- Status management
    status VARCHAR(20) DEFAULT 'active',                                -- Record status: 'active' (shown), 'inactive' (hidden)

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),                 -- Record creation timestamp
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()                  -- Last modification timestamp
);

-- ===================================================================
-- Database Indexes for Performance Optimization
-- ===================================================================

CREATE INDEX idx_footer_section ON footer(section);                           -- Fast section filtering
CREATE INDEX idx_footer_status ON footer(status);                               -- Fast status filtering
CREATE INDEX idx_footer_sort_order ON footer(sort_order);                         -- Fast ordering within sections
CREATE INDEX idx_footer_section_status ON footer(section, status);               -- Combined filtering for queries
CREATE INDEX idx_footer_created_at ON footer(created_at);                          -- Audit trail queries

-- ===================================================================
-- Row Level Security (RLS) Policies
-- ===================================================================

-- Enable RLS for the footer table
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;

-- Policy: Public users can only read active footer content
CREATE POLICY "Public read access - active only" ON footer
    FOR SELECT USING (status = 'active');

-- Policy: Authenticated users can read all footer content (including inactive)
CREATE POLICY "Authenticated read access - all statuses" ON footer
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Admin users have full CRUD access to footer content
CREATE POLICY "Admin full access - CRUD operations" ON footer
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ===================================================================
-- FOOTER DATA SETUP
-- ===================================================================
-- NOTE: No seed data included - footer content will be created via admin panel
-- The admin interface will handle all footer content creation and management
-- This ensures clean database without hardcoded or duplicate data

-- ===================================================================
-- STORAGE SETUP INSTRUCTIONS
-- ===================================================================
-- NOTE: Storage bucket and policies need to be created manually in Supabase dashboard
-- or using the Supabase CLI with service role permissions
--
-- MANUAL STEPS REQUIRED:
-- 1. Create 'assets' bucket in Supabase dashboard
-- 2. Set bucket as public (for logo access)
-- 3. Configure storage policies via dashboard or CLI
--
-- LOGO UPLOAD FLOW:
-- ┌─────────────────────────────────────────────────────────────────┐
-- │ 1. Admin uploads logo via frontend → API (/api/admin/storage/upload) │
-- │ 2. API uses service role key → uploads to 'assets' bucket          │
-- │ 3. Public URL generated → stored in footer.content field          │
-- │ 4. Storage metadata stored in footer.extra_data.storage_path       │
-- │ 5. Frontend displays logos via public bucket access               │
-- └─────────────────────────────────────────────────────────────────┘

-- ===================================================================
-- FOOTER DATA MANAGEMENT
-- ===================================================================
-- - Admin panel creates all footer content dynamically
-- - Each section (logo, description, address, etc.) can have multiple records
-- - API returns most recent record (highest ID) for each section
-- - No hardcoded data - complete flexibility through admin interface
-- - Clean database with admin-managed content only