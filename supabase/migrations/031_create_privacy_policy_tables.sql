-- Create privacy_policy_sections table
CREATE TABLE IF NOT EXISTS privacy_policy_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create privacy_policy_section_translations table
CREATE TABLE IF NOT EXISTS privacy_policy_section_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES privacy_policy_sections(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_id, locale)
);

-- Enable RLS
ALTER TABLE privacy_policy_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_policy_section_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for privacy_policy_sections
CREATE POLICY "Public read access for privacy sections"
  ON privacy_policy_sections FOR SELECT
  USING (true);

CREATE POLICY "Admin full access for privacy sections"
  ON privacy_policy_sections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policies for privacy_policy_section_translations
CREATE POLICY "Public read access for privacy translations"
  ON privacy_policy_section_translations FOR SELECT
  USING (true);

CREATE POLICY "Admin full access for privacy translations"
  ON privacy_policy_section_translations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create trigger to update updated_at
CREATE TRIGGER update_privacy_policy_sections_updated_at
    BEFORE UPDATE ON privacy_policy_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_policy_section_translations_updated_at
    BEFORE UPDATE ON privacy_policy_section_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
