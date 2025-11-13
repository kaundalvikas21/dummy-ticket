CREATE TABLE about_dummy_tickets_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES about_dummy_tickets(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ticket_id, locale)
  );

  -- Create index for better performance
  CREATE INDEX idx_about_dummy_tickets_translations_ticket_id ON about_dummy_tickets_translations(ticket_id);
  CREATE INDEX idx_about_dummy_tickets_translations_locale ON about_dummy_tickets_translations(locale);