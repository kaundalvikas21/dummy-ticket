-- Create about_stats_translations table for multi-language support
CREATE TABLE about_stats_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_id UUID NOT NULL REFERENCES about_stats(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL,
  label TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stat_id, locale)
);

-- Create indexes for performance
CREATE INDEX idx_about_stats_translations_stat_id ON about_stats_translations(stat_id);
CREATE INDEX idx_about_stats_translations_locale ON about_stats_translations(locale);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_about_stats_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_about_stats_translations_updated_at
    BEFORE UPDATE ON about_stats_translations
    FOR EACH ROW EXECUTE FUNCTION update_about_stats_translations_updated_at();

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

-- Create RLS policies (if using Supabase)
ALTER TABLE about_stats_translations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all translations
CREATE POLICY "Public read access for about_stats_translations" ON about_stats_translations
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert/update translations
CREATE POLICY "Authenticated users can manage about_stats_translations" ON about_stats_translations
  FOR ALL USING (
    auth.role() = 'authenticated'
  ) WITH CHECK (
    auth.role() = 'authenticated'
  );