-- Homepage news and blog items table
CREATE TABLE homepage_news_blog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('news', 'blog')),
    sort_order INTEGER DEFAULT 0,
    external_link TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Translations table for homepage news and blog items
CREATE TABLE homepage_news_blog_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    homepage_news_blog_id UUID REFERENCES homepage_news_blog(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(homepage_news_blog_id, locale)
);

-- Indexes for better performance
CREATE INDEX idx_homepage_news_blog_content_type ON homepage_news_blog(content_type);
CREATE INDEX idx_homepage_news_blog_status ON homepage_news_blog(status);
CREATE INDEX idx_homepage_news_blog_sort_order ON homepage_news_blog(sort_order);
CREATE INDEX idx_homepage_news_blog_title ON homepage_news_blog(title);
CREATE INDEX idx_homepage_news_blog_translations_homepage_news_blog_id ON homepage_news_blog_translations(homepage_news_blog_id);
CREATE INDEX idx_homepage_news_blog_translations_locale ON homepage_news_blog_translations(locale);

-- Insert initial data from current about-news-section.jsx content
INSERT INTO homepage_news_blog (content_type, external_link, sort_order, status, title) VALUES
('news', 'https://www.dubaistandard.com/fly-dubai-adds-destination-saudi-arabia/', 1, 'active', 'Fly Dubai adds 2 more destinations in Saudi Arabia'),
('news', 'https://www.dubaistandard.com/israel-flights-update-2024/', 2, 'active', 'Israel flights update 2024'),
('news', 'https://www.dubaistandard.com/gcc-eu-schengen-visa-waiver/', 3, 'active', 'European Union and GCC discuss Schengen visa waiver for GCC citizens'),
('blog', '#', 1, 'active', 'Difference between a fake ticket and a flight itinerary'),
('blog', 'https://www.dubaistandard.com/heres-why-dubai-is-special-safe-popular-tourist-spot-and-expats-as-a-first-choice/', 2, 'active', 'Why Dubai is special, safe, and popular tourist spot');

-- Insert initial English translations
INSERT INTO homepage_news_blog_translations (homepage_news_blog_id, locale, title)
SELECT id, 'en', title FROM (
  VALUES
    ('Fly Dubai adds 2 more destinations in Saudi Arabia', 'news', 1),
    ('Israel flights update 2024', 'news', 2),
    ('European Union and GCC discuss Schengen visa waiver for GCC citizens', 'news', 3),
    ('Difference between a fake ticket and a flight itinerary', 'blog', 1),
    ('Why Dubai is special, safe, and popular tourist spot', 'blog', 2)
) AS t(title, content_type, sort_order)
JOIN homepage_news_blog ON homepage_news_blog.content_type = t.content_type AND homepage_news_blog.sort_order = t.sort_order;

-- RLS policies
ALTER TABLE homepage_news_blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_news_blog_translations ENABLE ROW LEVEL SECURITY;

-- Policy for homepage_news_blog (admin only)
CREATE POLICY "Admins can do all operations on homepage_news_blog" ON homepage_news_blog
    FOR ALL USING (
        auth.role() = 'authenticated'
        AND auth.jwt()->>'email' = 'admin@visafly.com'
    );

-- Policy for homepage_news_blog_translations (admin only)
CREATE POLICY "Admins can do all operations on homepage_news_blog_translations" ON homepage_news_blog_translations
    FOR ALL USING (
        auth.role() = 'authenticated'
        AND auth.jwt()->>'email' = 'admin@visafly.com'
    );

-- Policy for reading homepage_news_blog (public access)
CREATE POLICY "Anyone can read homepage_news_blog" ON homepage_news_blog
    FOR SELECT USING (status = 'active');

-- Policy for reading homepage_news_blog_translations (public access)
CREATE POLICY "Anyone can read homepage_news_blog_translations" ON homepage_news_blog_translations
    FOR SELECT USING (true);