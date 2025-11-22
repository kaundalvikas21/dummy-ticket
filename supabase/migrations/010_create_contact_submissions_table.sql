-- Contact Submissions Migration for New Database
-- Stores contact form submissions with proper admin access control and audit trails

-- Main contact submissions table
CREATE TABLE contact_submissions (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Contact information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Status and priority management
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Admin management
    admin_notes TEXT,
    admin_id UUID REFERENCES auth.users(id),

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes optimized for common queries
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_status_created_at ON contact_submissions(status, created_at);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_admin_id ON contact_submissions(admin_id);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public insert access for contact form submissions
CREATE POLICY "Public insert access - contact_submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Authenticated users can read submissions
CREATE POLICY "Authenticated read access - contact_submissions" ON contact_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access for management operations
CREATE POLICY "Admin full access - contact_submissions" ON contact_submissions
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );