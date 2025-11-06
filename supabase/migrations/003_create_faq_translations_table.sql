 CREATE TABLE faq_translations (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   faq_id UUID REFERENCES faqs(id) ON DELETE CASCADE,
   locale VARCHAR(10) NOT NULL,
   question TEXT NOT NULL,
   answer TEXT NOT NULL,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   UNIQUE(faq_id, locale)
 );