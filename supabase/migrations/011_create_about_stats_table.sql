CREATE TABLE about_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    icon VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create index for better performance
  CREATE INDEX idx_about_stats_sort_order ON about_stats(sort_order);
  CREATE INDEX idx_about_stats_status ON about_stats(status);