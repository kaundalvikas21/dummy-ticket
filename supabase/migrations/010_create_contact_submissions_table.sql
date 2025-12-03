-- Contact Submissions Migration for New Database
-- Stores contact form submissions with proper admin access control and audit trails



-- Main contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
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
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status_created_at ON contact_submissions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_admin_id ON contact_submissions(admin_id);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts (covers all possible policy names)
DROP POLICY IF EXISTS "Public insert access - contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated read access - contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin full access - contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "User read access - contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin update access - contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin delete access - contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin management - contact_submissions" ON contact_submissions;

-- RLS Policies using Supabase Auth patterns
-- Public insert access without validation (allows anonymous users)
-- Note: Validation is handled in the application layer at /app/api/contact/submit/route.js
CREATE POLICY "Public insert access - contact_submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

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

-- Admin full access for all operations (update, delete, select)
CREATE POLICY "Admin full access - contact_submissions" ON contact_submissions
    FOR ALL USING (is_admin());