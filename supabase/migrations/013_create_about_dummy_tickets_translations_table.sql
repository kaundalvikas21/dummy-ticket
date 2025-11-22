-- About Dummy Tickets Translations Migration for New Database
-- Creates optimized table with Supabase Auth integration

-- Translations table for multilingual support
CREATE TABLE about_dummy_tickets_translations (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign key relationship
    ticket_id UUID NOT NULL REFERENCES about_dummy_tickets(id) ON DELETE CASCADE,

    -- Translation fields
    locale VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(ticket_id, locale)
);

-- Performance indexes
CREATE INDEX idx_about_dummy_tickets_translations_ticket_id ON about_dummy_tickets_translations(ticket_id);
CREATE INDEX idx_about_dummy_tickets_translations_locale ON about_dummy_tickets_translations(locale);

-- Enable Row Level Security
ALTER TABLE about_dummy_tickets_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for translations (simplified for performance)
CREATE POLICY "Public read access - about_dummy_tickets_translations" ON about_dummy_tickets_translations
    FOR SELECT USING (true);

-- Authenticated users can read all translations
CREATE POLICY "Authenticated read access - about_dummy_tickets_translations" ON about_dummy_tickets_translations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - about_dummy_tickets_translations" ON about_dummy_tickets_translations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );