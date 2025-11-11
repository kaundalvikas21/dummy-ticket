-- FAQ Page Section Translations Table
-- This table stores translations for FAQ page section titles

CREATE TABLE faq_page_section_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES faq_page_sections(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_id, locale)
);

-- Create indexes for performance
CREATE INDEX idx_faq_page_section_translations_section_id ON faq_page_section_translations(section_id);
CREATE INDEX idx_faq_page_section_translations_locale ON faq_page_section_translations(locale);

-- Create RLS (Row Level Security) policies
ALTER TABLE faq_page_section_translations ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (for active sections)
CREATE POLICY "Public can read FAQ page section translations" ON faq_page_section_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faq_page_sections
            WHERE faq_page_sections.id = faq_page_section_translations.section_id
            AND faq_page_sections.status = 'active'
        )
    );

-- Policy for authenticated users to read all translations
CREATE POLICY "Authenticated users can read all FAQ page section translations" ON faq_page_section_translations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin users to manage translations
CREATE POLICY "Admin users can manage FAQ page section translations" ON faq_page_section_translations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );