-- FAQ Page Sections Table
-- This table stores the main sections for the FAQ page

CREATE TABLE faq_page_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,                    -- Default locale (en) title
    icon VARCHAR(100),                      -- Lucide icon name
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_faq_page_sections_status ON faq_page_sections(status);
CREATE INDEX idx_faq_page_sections_sort_order ON faq_page_sections(sort_order);
CREATE INDEX idx_faq_page_sections_active ON faq_page_sections(sort_order) WHERE status = 'active';

-- Create RLS (Row Level Security) policies
ALTER TABLE faq_page_sections ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (for active sections)
CREATE POLICY "Public can read active FAQ page sections" ON faq_page_sections
    FOR SELECT USING (status = 'active');

-- Policy for authenticated users to read all sections
CREATE POLICY "Authenticated users can read all FAQ page sections" ON faq_page_sections
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin users to manage sections
CREATE POLICY "Admin users can manage FAQ page sections" ON faq_page_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );