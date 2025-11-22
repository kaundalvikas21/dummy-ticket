-- Homepage News and Blog Migration for New Database
-- Creates optimized tables with Supabase Auth integration

-- Main content table for news and blog items
CREATE TABLE homepage_news_blog (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Content classification
    content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('news', 'blog')),

    -- Ordering and status management
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

    -- Content fields
    title TEXT NOT NULL,
    external_link TEXT,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Translations table for multilingual support
CREATE TABLE homepage_news_blog_translations (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign key relationship
    homepage_news_blog_id UUID REFERENCES homepage_news_blog(id) ON DELETE CASCADE,

    -- Translation fields
    locale VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(homepage_news_blog_id, locale)
);

-- Performance indexes
CREATE INDEX idx_homepage_news_blog_content_type ON homepage_news_blog(content_type);
CREATE INDEX idx_homepage_news_blog_status ON homepage_news_blog(status);
CREATE INDEX idx_homepage_news_blog_sort_order ON homepage_news_blog(sort_order);
CREATE INDEX idx_homepage_news_blog_created_at ON homepage_news_blog(created_at);
CREATE INDEX idx_homepage_news_blog_translations_homepage_news_blog_id ON homepage_news_blog_translations(homepage_news_blog_id);
CREATE INDEX idx_homepage_news_blog_translations_locale ON homepage_news_blog_translations(locale);

-- Enable Row Level Security
ALTER TABLE homepage_news_blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_news_blog_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Supabase Auth patterns
-- Public read access for active content only
CREATE POLICY "Public read access - homepage_news_blog" ON homepage_news_blog
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public read access - homepage_news_blog_translations" ON homepage_news_blog_translations
    FOR SELECT USING (true);

-- Admin full access using Supabase Auth role
CREATE POLICY "Admin full access - homepage_news_blog" ON homepage_news_blog
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

CREATE POLICY "Admin full access - homepage_news_blog_translations" ON homepage_news_blog_translations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Insert sample data for development and testing
INSERT INTO homepage_news_blog (content_type, external_link, sort_order, status, title) VALUES
('news', 'https://www.dubaistandard.com/fly-dubai-adds-destination-saudi-arabia/', 1, 'active', 'Fly Dubai adds 2 more destinations in Saudi Arabia'),
('news', 'https://www.dubaistandard.com/israel-flights-update-2024/', 2, 'active', 'Israel flights update 2024'),
('news', 'https://www.dubaistandard.com/gcc-eu-schengen-visa-waiver/', 3, 'active', 'European Union and GCC discuss Schengen visa waiver for GCC citizens'),
('blog', '#', 1, 'active', 'Difference between a fake ticket and a flight itinerary'),
('blog', 'https://www.dubaistandard.com/heres-why-dubai-is-special-safe-popular-tourist-spot-and-expats-as-a-first-choice/', 2, 'active', 'Why Dubai is special, safe, and popular tourist spot');

-- Insert corresponding English translations
INSERT INTO homepage_news_blog_translations (homepage_news_blog_id, locale, title)
SELECT id, 'en', title FROM homepage_news_blog
ORDER BY content_type, sort_order;