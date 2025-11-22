-- Footer Content Migration - JSON Arrays Approach

-- Create new table with JSON arrays structure
CREATE TABLE footer_content (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Section identification (unique sections only)
    section VARCHAR(50) NOT NULL UNIQUE,

    -- Main content as JSON arrays
    content JSONB NOT NULL,

    -- Status management
    status VARCHAR(20) DEFAULT 'active',

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

-- Admin full access (Updated for Supabase Auth)
CREATE POLICY "Admin full access - footer_content" ON footer_content
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );