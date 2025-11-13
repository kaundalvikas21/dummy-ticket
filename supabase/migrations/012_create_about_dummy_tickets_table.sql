CREATE TABLE about_dummy_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'simple' CHECK (content_type IN ('simple', 'list')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create index for better performance
  CREATE INDEX idx_about_dummy_tickets_status ON about_dummy_tickets(status);
  CREATE INDEX idx_about_dummy_tickets_sort_order ON about_dummy_tickets(sort_order);

  -- Enable RLS for about_dummy_tickets
  ALTER TABLE about_dummy_tickets ENABLE ROW LEVEL SECURITY;

  -- Policy to allow all operations on about_dummy_tickets
  CREATE POLICY "Enable all operations for about_dummy_tickets" ON about_dummy_tickets
  FOR ALL USING (true) WITH CHECK (true);