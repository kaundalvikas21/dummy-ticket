-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    target_countries TEXT[] DEFAULT '{}',
    featured_image TEXT,
    author_id UUID REFERENCES auth.users(id)
);

-- Enable RLS for blogs
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create blog_translations table
CREATE TABLE IF NOT EXISTS blog_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL, -- en, fr, nl, es, ar
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    content JSONB,
    UNIQUE(blog_id, locale),
    UNIQUE(slug)
);

-- Enable RLS for blog_translations
ALTER TABLE blog_translations ENABLE ROW LEVEL SECURITY;

-- Policies for blogs
DROP POLICY IF EXISTS "Public blogs are viewable by everyone" ON blogs;
CREATE POLICY "Public blogs are viewable by everyone" 
ON blogs FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert blogs" ON blogs;
CREATE POLICY "Admins can insert blogs" 
ON blogs FOR INSERT 
WITH CHECK (
    auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admins can update blogs" ON blogs;
CREATE POLICY "Admins can update blogs" 
ON blogs FOR UPDATE 
USING (
    auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admins can delete blogs" ON blogs;
CREATE POLICY "Admins can delete blogs" 
ON blogs FOR DELETE 
USING (
    auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- Policies for blog_translations
DROP POLICY IF EXISTS "Public blog translations are viewable by everyone" ON blog_translations;
CREATE POLICY "Public blog translations are viewable by everyone" 
ON blog_translations FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert blog translations" ON blog_translations;
CREATE POLICY "Admins can insert blog translations" 
ON blog_translations FOR INSERT 
WITH CHECK (
    auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admins can update blog translations" ON blog_translations;
CREATE POLICY "Admins can update blog translations" 
ON blog_translations FOR UPDATE 
USING (
    auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admins can delete blog translations" ON blog_translations;
CREATE POLICY "Admins can delete blog translations" 
ON blog_translations FOR DELETE 
USING (
    auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for blogs updated_at
DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Allow public read access to blog images
DROP POLICY IF EXISTS "Public Access Blog Images" ON storage.objects;
CREATE POLICY "Public Access Blog Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' AND (storage.foldername(name))[1] = 'blog_image' );

-- Allow authenticated users (admins) to upload blog images
DROP POLICY IF EXISTS "Auth Upload Blog Images" ON storage.objects;
CREATE POLICY "Auth Upload Blog Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'assets' AND (storage.foldername(name))[1] = 'blog_image' );

-- Allow authenticated users (admins) to update blog images
DROP POLICY IF EXISTS "Auth Update Blog Images" ON storage.objects;
CREATE POLICY "Auth Update Blog Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'assets' AND (storage.foldername(name))[1] = 'blog_image' );

-- Allow authenticated users (admins) to delete blog images
DROP POLICY IF EXISTS "Auth Delete Blog Images" ON storage.objects;
CREATE POLICY "Auth Delete Blog Images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'assets' AND (storage.foldername(name))[1] = 'blog_image' );
