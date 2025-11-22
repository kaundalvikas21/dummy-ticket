-- About Stats Translations Migration for New Database
-- Creates optimized table with Supabase Auth integration

-- Translations table for multilingual support
CREATE TABLE about_stats_translations (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign key relationship
    stat_id UUID NOT NULL REFERENCES about_stats(id) ON DELETE CASCADE,

    -- Translation fields
    locale VARCHAR(10) NOT NULL,
    label TEXT NOT NULL,
    value TEXT,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(stat_id, locale)
);

-- Performance indexes
CREATE INDEX idx_about_stats_translations_stat_id ON about_stats_translations(stat_id);
CREATE INDEX idx_about_stats_translations_locale ON about_stats_translations(locale);

-- Backfill existing stats with English translations
INSERT INTO about_stats_translations (stat_id, locale, label, value)
SELECT
  id as stat_id,
  'en' as locale,
  label as label,
  value as value
FROM about_stats
WHERE id NOT IN (
  SELECT DISTINCT stat_id
  FROM about_stats_translations
  WHERE locale = 'en'
);

-- Enable Row Level Security
ALTER TABLE about_stats_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for translations (simplified for performance)
CREATE POLICY "Public read access - about_stats_translations" ON about_stats_translations
    FOR SELECT USING (true);

-- Authenticated users can read all translations
CREATE POLICY "Authenticated read access - about_stats_translations" ON about_stats_translations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - about_stats_translations" ON about_stats_translations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );