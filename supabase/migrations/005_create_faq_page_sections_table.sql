-- FAQ Page Sections Migration for New Database
-- Creates optimized table with Supabase Auth integration

-- Main FAQ page sections table
CREATE TABLE faq_page_sections (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Content and configuration
    title TEXT NOT NULL,                    -- Default locale (en) title
    icon VARCHAR(100),                      -- Lucide icon name

    -- Status and ordering
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Essential indexes for performance
CREATE INDEX idx_faq_page_sections_status ON faq_page_sections(status);
CREATE INDEX idx_faq_page_sections_sort_order ON faq_page_sections(sort_order);

-- Enable Row Level Security
ALTER TABLE faq_page_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for active sections only
CREATE POLICY "Public read access - faq_page_sections" ON faq_page_sections
    FOR SELECT USING (status = 'active');

-- Authenticated users can read all sections
CREATE POLICY "Authenticated read access - faq_page_sections" ON faq_page_sections
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - faq_page_sections" ON faq_page_sections
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );