-- ===================================================================
-- Footer Content Migration - JSON Arrays Approach
-- ===================================================================
-- Purpose: Migrate from individual records to JSON arrays per section
-- This creates a new optimized structure and migrates existing data
-- ===================================================================

-- Create backup of current data
CREATE TABLE footer_backup AS SELECT * FROM footer;

-- Create new table with JSON arrays structure
CREATE TABLE footer_content (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Section identification (unique sections only)
    section VARCHAR(50) NOT NULL UNIQUE,                     -- 'primary_info', 'links', 'contact', 'social'

    -- Main content as JSON arrays
    content JSONB NOT NULL,                                   -- Structured data per section

    -- Status management
    status VARCHAR(20) DEFAULT 'active',                      -- 'active', 'inactive'

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_footer_content_section ON footer_content(section);
CREATE INDEX idx_footer_content_status ON footer_content(status);
CREATE INDEX idx_footer_content_updated_at ON footer_content(updated_at);

-- Enable Row Level Security
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for footer_content
-- Public read access for active sections only
CREATE POLICY "Public read access - footer_content" ON footer_content
    FOR SELECT USING (status = 'active');

-- Admin full access
CREATE POLICY "Admin full access - footer_content" ON footer_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ===================================================================
-- DATA MIGRATION
-- ===================================================================

-- Migrate primary info (logo, description, address)
INSERT INTO footer_content (section, content)
SELECT 'primary_info', JSON_BUILD_OBJECT(
    'company_name', COALESCE(
        (SELECT extra_data->>'company_name' FROM footer WHERE section = 'logo' AND status = 'active' ORDER BY created_at DESC LIMIT 1),
        'VisaFly'
    ),
    'logo_url', (SELECT content FROM footer WHERE section = 'logo' AND status = 'active' ORDER BY created_at DESC LIMIT 1),
    'logo_alt_text', COALESCE(
        (SELECT extra_data->>'alt_text' FROM footer WHERE section = 'logo' AND status = 'active' ORDER BY created_at DESC LIMIT 1),
        'VisaFly Logo'
    ),
    'description', (SELECT content FROM footer WHERE section = 'description' AND status = 'active' ORDER BY created_at DESC LIMIT 1),
    'address', (SELECT content FROM footer WHERE section = 'address' AND status = 'active' ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT (section) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- Migrate links (company + support)
INSERT INTO footer_content (section, content)
SELECT 'links', JSON_BUILD_OBJECT(
    'company_links', COALESCE(
        (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', id::text,
                'title', title,
                'href', content,
                'sort_order', sort_order
            ) ORDER BY sort_order, created_at
        ) FROM footer WHERE section = 'company' AND status = 'active'),
        '[]'::json
    ),
    'support_links', COALESCE(
        (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', id::text,
                'title', title,
                'href', content,
                'sort_order', sort_order
            ) ORDER BY sort_order, created_at
        ) FROM footer WHERE section = 'support' AND status = 'active'),
        '[]'::json
    )
) ON CONFLICT (section) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- Ensure links section exists even if no links were migrated
INSERT INTO footer_content (section, content)
VALUES ('links', JSON_BUILD_OBJECT(
    'company_links', '[]'::json,
    'support_links', '[]'::json
))
ON CONFLICT (section) DO NOTHING;

-- Migrate contact information
INSERT INTO footer_content (section, content)
SELECT 'contact', COALESCE(
    (SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', id::text,
            'title', COALESCE(title, 'Contact'),
            'content', content,
            'link_type', COALESCE(extra_data->>'link_type', 'tel'),
            'icon', COALESCE(extra_data->>'icon_type', 'Phone'),
            'country', COALESCE(extra_data->>'country', ''),
            'sort_order', sort_order
        ) ORDER BY sort_order, created_at
    ) FROM footer WHERE section = 'contact' AND status = 'active'),
    '[]'::json
) ON CONFLICT (section) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- Migrate social media links
INSERT INTO footer_content (section, content)
SELECT 'social', COALESCE(
    (SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', id::text,
            'name', title,
            'href', content,
            'icon_name', COALESCE(extra_data->>'icon_name', 'facebook'),
            'sort_order', sort_order
        ) ORDER BY sort_order, created_at
    ) FROM footer WHERE section = 'social' AND status = 'active'),
    '[]'::json
) ON CONFLICT (section) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- Ensure contact section exists even if no contacts were migrated
INSERT INTO footer_content (section, content)
VALUES ('contact', '[]'::json)
ON CONFLICT (section) DO NOTHING;

-- Ensure social section exists even if no social links were migrated
INSERT INTO footer_content (section, content)
VALUES ('social', '[]'::json)
ON CONFLICT (section) DO NOTHING;

-- ===================================================================
-- MIGRATION VALIDATION
-- ===================================================================

-- Validate migration success
DO $$
DECLARE
    primary_info_count INTEGER;
    links_count INTEGER;
    contact_count INTEGER;
    social_count INTEGER;
    old_total INTEGER;
    new_total INTEGER;
BEGIN
    -- Count records in old table
    SELECT COUNT(*) INTO old_total FROM footer WHERE status = 'active';

    -- Count sections in new table
    SELECT COUNT(*) INTO new_total FROM footer_content WHERE status = 'active';

    -- Count specific migrated data
    SELECT COALESCE(jsonb_array_length(content->'company_links'), 0) + COALESCE(jsonb_array_length(content->'support_links'), 0)
    INTO links_count FROM footer_content WHERE section = 'links';

    SELECT COALESCE(jsonb_array_length(content), 0) INTO contact_count FROM footer_content WHERE section = 'contact';
    SELECT COALESCE(jsonb_array_length(content), 0) INTO social_count FROM footer_content WHERE section = 'social';

    -- Log migration results
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '- Old table records: %', old_total;
    RAISE NOTICE '- New table sections: %', new_total;
    RAISE NOTICE '- Company + Support links: %', links_count;
    RAISE NOTICE '- Contact items: %', contact_count;
    RAISE NOTICE '- Social links: %', social_count;

    -- Validate expected sections exist
    IF new_total != 4 THEN
        RAISE EXCEPTION 'Expected 4 sections, found %', new_total;
    END IF;
END $$;

-- ===================================================================
-- ROLLBACK PROCEDURE (if needed)
-- ===================================================================
-- To rollback, run:
-- DROP TABLE footer_content;
-- ALTER TABLE footer RENAME TO footer_content_new;
-- ALTER TABLE footer_backup RENAME TO footer;

-- ===================================================================
-- CLEANUP (to be run after successful migration and testing)
-- ===================================================================
-- After confirming migration works:
-- DROP TABLE footer;
-- DROP TABLE footer_backup;