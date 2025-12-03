-- Contact Settings Migration for New Database
-- Stores configurable content for the Contact Us page with Supabase Auth integration

-- Helper Functions for RLS Policies
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Main contact settings table
CREATE TABLE IF NOT EXISTS contact_settings (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Configuration fields
    settings_key VARCHAR(100) NOT NULL UNIQUE,
    settings_value TEXT NOT NULL,
    settings_type VARCHAR(50) DEFAULT 'text',
    description TEXT,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance index (only essential index)
CREATE INDEX IF NOT EXISTS idx_contact_settings_key ON contact_settings(settings_key);

-- Enable Row Level Security
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access - contact_settings" ON contact_settings;
DROP POLICY IF EXISTS "Authenticated read access - contact_settings" ON contact_settings;
DROP POLICY IF EXISTS "Admin full access - contact_settings" ON contact_settings;

-- RLS Policies using Supabase Auth patterns
-- Public read access for essential contact information only
CREATE POLICY "Public read access - contact_settings" ON contact_settings
    FOR SELECT USING (
        settings_key IN ('phone', 'email', 'address', 'page_title', 'page_description', 'working_hours', 'country_support')
    );

-- Authenticated users can read all settings
CREATE POLICY "Authenticated read access - contact_settings" ON contact_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Helper Function for RLS Policies (consistent, maintainable approach)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role from JWT claims or app_metadata
  RETURN (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Admin full access using helper function (maintainable and consistent)
CREATE POLICY "Admin full access - contact_settings" ON contact_settings
    FOR ALL USING (is_admin());

-- Note: Seed data removed to avoid duplicate insertion
