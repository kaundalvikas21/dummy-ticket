-- FAQ Page Item Translations Table
-- This table stores translations for FAQ page item questions and answers

CREATE TABLE faq_page_item_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES faq_page_items(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, locale)
);

-- Create indexes for performance
CREATE INDEX idx_faq_page_item_translations_item_id ON faq_page_item_translations(item_id);
CREATE INDEX idx_faq_page_item_translations_locale ON faq_page_item_translations(locale);

-- Create RLS (Row Level Security) policies
ALTER TABLE faq_page_item_translations ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (for active items)
CREATE POLICY "Public can read FAQ page item translations" ON faq_page_item_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faq_page_items
            INNER JOIN faq_page_sections ON faq_page_items.section_id = faq_page_sections.id
            WHERE faq_page_items.id = faq_page_item_translations.item_id
            AND faq_page_items.status = 'active'
            AND faq_page_sections.status = 'active'
        )
    );

-- Policy for authenticated users to read all translations
CREATE POLICY "Authenticated users can read all FAQ page item translations" ON faq_page_item_translations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin users to manage translations
CREATE POLICY "Admin users can manage FAQ page item translations" ON faq_page_item_translations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );