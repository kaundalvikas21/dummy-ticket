-- About Stats Migration for New Database
-- Creates optimized table with Supabase Auth integration

-- Main about stats table
CREATE TABLE about_stats (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Content and configuration
    icon VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,

    -- Status and ordering
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 1,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_about_stats_sort_order ON about_stats(sort_order);
CREATE INDEX idx_about_stats_status ON about_stats(status);

-- Enable Row Level Security (CRITICAL - was missing!)
ALTER TABLE about_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for active stats only
CREATE POLICY "Public read access - about_stats" ON about_stats
    FOR SELECT USING (status = 'active');

-- Authenticated users can read all stats
CREATE POLICY "Authenticated read access - about_stats" ON about_stats
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - about_stats" ON about_stats
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );