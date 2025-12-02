-- About Dummy Tickets Translations Migration for New Database
-- Creates optimized table with Supabase Auth integration

-- Translations table for multilingual support
CREATE TABLE about_dummy_tickets_translations (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign key relationship
    ticket_id UUID NOT NULL REFERENCES about_dummy_tickets(id) ON DELETE CASCADE,

    -- Translation fields
    locale VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(ticket_id, locale)
);

-- Performance indexes
CREATE INDEX idx_about_dummy_tickets_translations_ticket_id ON about_dummy_tickets_translations(ticket_id);
CREATE INDEX idx_about_dummy_tickets_translations_locale ON about_dummy_tickets_translations(locale);

-- Enable Row Level Security
ALTER TABLE about_dummy_tickets_translations ENABLE ROW LEVEL SECURITY;

-- RLS policies will be applied separately via about_dummy_tickets_translations_policies.sql