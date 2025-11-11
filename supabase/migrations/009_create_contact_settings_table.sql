-- Contact Settings Table
-- This table stores all configurable content for the Contact Us page

CREATE TABLE contact_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings_key VARCHAR(100) NOT NULL UNIQUE,
    settings_value TEXT NOT NULL,
    settings_type VARCHAR(50) DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_contact_settings_key ON contact_settings(settings_key);
CREATE INDEX idx_contact_settings_type ON contact_settings(settings_type);

-- Create RLS (Row Level Security) policies
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (for active settings)
CREATE POLICY "Public can read active contact settings" ON contact_settings
    FOR SELECT USING (
        -- Only allow reading of basic contact info that's needed for the public page
        settings_key IN ('phone', 'email', 'address', 'page_title', 'page_description')
    );

-- Policy for authenticated users to read all settings
CREATE POLICY "Authenticated users can read all contact settings" ON contact_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin users to manage contact settings
CREATE POLICY "Admin users can manage contact settings" ON contact_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Seed initial contact settings with existing hardcoded values
INSERT INTO contact_settings (settings_key, settings_value, settings_type, description) VALUES
('phone', '+1-800-123-4567', 'text', 'Main support phone number'),
('email', 'support@example.com', 'text', 'Main support email address'),
('address', '123 Business St, Suite 100, New York, NY 10001', 'text', 'Main business address'),
('page_title', 'Get in Touch', 'text', 'Contact page title'),
('page_description', 'We''re here to help you 24/7. Reach out to us anytime, anywhere.', 'text', 'Contact page description'),
('working_hours_text', 'Our dedicated support team is available to assist you with any questions or concerns you may have.', 'text', 'Working hours description'),
('contact_support_title', 'Contact Support', 'text', 'Contact support section title'),
('contact_support_description', 'Get in touch with our support team from around the world.', 'text', 'Contact support description');