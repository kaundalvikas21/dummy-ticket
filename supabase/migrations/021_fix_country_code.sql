-- Fix country_code constraint and update user creation trigger
-- This migration allows numeric country codes (e.g. +1) instead of just ISO codes

-- 1. Relax the constraint on country_code
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS valid_country_code;

-- Add new constraint matching dial codes (starts with + followed by digits, or NULL)
-- We also allow simple text to be safe, but ideally it should be specific
ALTER TABLE user_profiles ADD CONSTRAINT valid_country_code 
  CHECK (country_code ~ '^\+[0-9]+$' OR country_code IS NULL);

-- 2. Update the profile creation trigger to capture country_code
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with auth_user_id, leave user_id NULL for pure auth users
  INSERT INTO public.user_profiles (
    auth_user_id,
    first_name,
    last_name,
    phone_number,
    country_code,  -- Added country_code
    nationality,
    preferred_language,
    role,
    created_at,
    updated_at
  )
  SELECT
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'country_code', -- Capture country_code from metadata
    NEW.raw_user_meta_data->>'nationality',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE auth_user_id = NEW.id
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE NOTICE 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
