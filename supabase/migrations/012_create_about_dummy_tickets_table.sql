-- About Dummy Tickets Migration for New Database
-- Creates optimized table with Supabase Auth integration

-- Main about dummy tickets table
CREATE TABLE about_dummy_tickets (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Content fields
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Content classification and status
    content_type VARCHAR(20) DEFAULT 'simple' CHECK (content_type IN ('simple', 'list')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 1,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_about_dummy_tickets_status ON about_dummy_tickets(status);
CREATE INDEX idx_about_dummy_tickets_sort_order ON about_dummy_tickets(sort_order);

-- Enable Row Level Security
ALTER TABLE about_dummy_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for active tickets only
CREATE POLICY "Public read access - about_dummy_tickets" ON about_dummy_tickets
    FOR SELECT USING (status = 'active');

-- Authenticated users can read all tickets
CREATE POLICY "Authenticated read access - about_dummy_tickets" ON about_dummy_tickets
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - about_dummy_tickets" ON about_dummy_tickets
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );