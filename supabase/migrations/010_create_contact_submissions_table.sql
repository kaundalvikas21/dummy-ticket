-- Contact Submissions Table
-- This table stores all contact form submissions from the frontend

CREATE TABLE contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    admin_notes TEXT,
    admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_admin_id ON contact_submissions(admin_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for public insert (contact form submissions)
CREATE POLICY "Public can insert contact submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Policy for authenticated users to read submissions
CREATE POLICY "Authenticated users can read contact submissions" ON contact_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin users to manage submissions
CREATE POLICY "Admin users can manage contact submissions" ON contact_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Policy for submission owners to read their own submissions (if user accounts are implemented)
CREATE POLICY "Users can read their own submissions" ON contact_submissions
    FOR SELECT USING (
        false -- Disabled for now, can be enabled when user accounts are linked to submissions
    );

-- Policy for submission owners to update their own submissions (if user accounts are implemented)
CREATE POLICY "Users can update their own submissions" ON contact_submissions
    FOR UPDATE USING (
        false -- Disabled for now, can be enabled when user accounts are linked to submissions
    );