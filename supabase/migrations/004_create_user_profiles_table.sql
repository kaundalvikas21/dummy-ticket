-- Create user profiles table with personal information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  country_code TEXT,
  date_of_birth DATE,
  nationality TEXT,
   passport_number VARCHAR(50),
    address TEXT,
  city TEXT,
  postal_code TEXT,
  preferred_language TEXT DEFAULT 'en',
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}',
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_id UNIQUE (user_id),
  CONSTRAINT valid_country_code CHECK (country_code ~ '^[A-Z]{2}$' OR country_code IS NULL)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country_code ON user_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality ON user_profiles(nationality);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();