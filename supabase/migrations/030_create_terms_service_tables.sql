-- Create terms_service_sections table
CREATE TABLE IF NOT EXISTS terms_service_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT, -- Optional, for icon mapping
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create terms_service_section_translations table
CREATE TABLE IF NOT EXISTS terms_service_section_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES terms_service_sections(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_id, locale)
);

-- Enable RLS
ALTER TABLE terms_service_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_service_section_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for terms_service_sections
CREATE POLICY "Public read access for terms sections"
  ON terms_service_sections FOR SELECT
  USING (true);

CREATE POLICY "Admin full access for terms sections"
  ON terms_service_sections FOR ALL
  USING (auth.role() = 'authenticated') -- Assuming basic auth check for now, specific admin check requires claims or profile lookup
  WITH CHECK (auth.role() = 'authenticated');

-- Create policies for terms_service_section_translations
CREATE POLICY "Public read access for terms translations"
  ON terms_service_section_translations FOR SELECT
  USING (true);

CREATE POLICY "Admin full access for terms translations"
  ON terms_service_section_translations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_terms_service_sections_updated_at
    BEFORE UPDATE ON terms_service_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terms_service_section_translations_updated_at
    BEFORE UPDATE ON terms_service_section_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
