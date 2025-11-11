-- FAQ Page Items Table
-- This table stores individual FAQ items within sections

CREATE TABLE faq_page_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES faq_page_sections(id) ON DELETE CASCADE,
    question TEXT NOT NULL,                 -- Default locale (en) question
    answer TEXT NOT NULL,                   -- Default locale (en) answer
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_faq_page_items_section_id ON faq_page_items(section_id);
CREATE INDEX idx_faq_page_items_status ON faq_page_items(status);
CREATE INDEX idx_faq_page_items_sort_order ON faq_page_items(sort_order);
CREATE INDEX idx_faq_page_items_active ON faq_page_items(section_id, sort_order) WHERE status = 'active';

-- Create RLS (Row Level Security) policies
ALTER TABLE faq_page_items ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (for active items)
CREATE POLICY "Public can read active FAQ page items" ON faq_page_items
    FOR SELECT USING (status = 'active');

-- Policy for authenticated users to read all items
CREATE POLICY "Authenticated users can read all FAQ page items" ON faq_page_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin users to manage items
CREATE POLICY "Admin users can manage FAQ page items" ON faq_page_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );