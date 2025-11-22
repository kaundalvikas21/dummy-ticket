-- FAQ Page Item Translations Migration for New Database
-- Creates optimized table with Supabase Auth integration

-- Translations table for multilingual support
CREATE TABLE faq_page_item_translations (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign key relationship
    item_id UUID NOT NULL REFERENCES faq_page_items(id) ON DELETE CASCADE,

    -- Translation fields
    locale VARCHAR(10) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(item_id, locale)
);

-- Performance indexes
CREATE INDEX idx_faq_page_item_translations_item_id ON faq_page_item_translations(item_id);
CREATE INDEX idx_faq_page_item_translations_locale ON faq_page_item_translations(locale);

-- Enable Row Level Security
ALTER TABLE faq_page_item_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for translations (simplified for performance)
CREATE POLICY "Public read access - faq_page_item_translations" ON faq_page_item_translations
    FOR SELECT USING (true);

-- Authenticated users can read all translations
CREATE POLICY "Authenticated read access - faq_page_item_translations" ON faq_page_item_translations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - faq_page_item_translations" ON faq_page_item_translations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );