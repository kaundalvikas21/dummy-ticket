-- Contact Settings Migration for New Database
-- Stores configurable content for the Contact Us page with Supabase Auth integration

-- Main contact settings table
CREATE TABLE contact_settings (
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
CREATE INDEX idx_contact_settings_key ON contact_settings(settings_key);

-- Enable Row Level Security
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for essential contact information only
CREATE POLICY "Public read access - contact_settings" ON contact_settings
    FOR SELECT USING (
        settings_key IN ('phone', 'email', 'address', 'page_title', 'page_description')
    );

-- Authenticated users can read all settings
CREATE POLICY "Authenticated read access - contact_settings" ON contact_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - contact_settings" ON contact_settings
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Initial seed data for development and deployment
INSERT INTO contact_settings (settings_key, settings_value, settings_type, description) VALUES
('phone', '+1-800-123-4567', 'text', 'Main support phone number'),
('email', 'support@visafly.com', 'text', 'Main support email address'),
('address', '123 Business Ave, Suite 100, New York, NY 10001', 'text', 'Main business address'),
('page_title', 'Get in Touch', 'text', 'Contact page title'),
('page_description', 'We''re here to help you 24/7. Reach out to us anytime, anywhere.', 'text', 'Contact page description'),
('working_hours_text', 'Our dedicated support team is available to assist you with any questions or concerns you may have.', 'text', 'Working hours description'),
('working_hours', 'Monday - Friday: 9:00 AM - 6:00 PM EST\nSaturday: 10:00 AM - 4:00 PM EST\nSunday: Closed', 'text', 'Detailed working hours schedule'),
('contact_support_title', 'Contact Support', 'text', 'Contact support section title'),
('contact_support_description', 'Get in touch with our support team from around the world.', 'text', 'Contact support description'),
('country_support', 'US, Canada, UK, Australia, India, UAE, Germany, France, Spain, Italy, Netherlands, Brazil, Mexico, Japan, Singapore, Malaysia', 'text', 'Supported countries for visa services');