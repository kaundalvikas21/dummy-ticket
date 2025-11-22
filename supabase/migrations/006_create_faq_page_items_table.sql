-- FAQ Page Items Migration for New Database
-- Creates optimized table with Supabase Auth integration

-- Main FAQ page items table
CREATE TABLE faq_page_items (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign key relationship
    section_id UUID NOT NULL REFERENCES faq_page_sections(id) ON DELETE CASCADE,

    -- Content fields
    question TEXT NOT NULL,                 -- Default locale (en) question
    answer TEXT NOT NULL,                   -- Default locale (en) answer

    -- Status and ordering
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_faq_page_items_section_id ON faq_page_items(section_id);
CREATE INDEX idx_faq_page_items_status ON faq_page_items(status);
CREATE INDEX idx_faq_page_items_sort_order ON faq_page_items(sort_order);

-- Enable Row Level Security
ALTER TABLE faq_page_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for active items only
CREATE POLICY "Public read access - faq_page_items" ON faq_page_items
    FOR SELECT USING (status = 'active');

-- Authenticated users can read all items
CREATE POLICY "Authenticated read access - faq_page_items" ON faq_page_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - faq_page_items" ON faq_page_items
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );