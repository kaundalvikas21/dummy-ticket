-- Sync user emails and update trigger
-- This migration populates the email column and updates the trigger to capture it for new users

-- 1. Update the profile creation trigger to capture email
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with auth_user_id, leave user_id NULL for pure auth users
  INSERT INTO public.user_profiles (
    auth_user_id,
    first_name,
    last_name,
    email,          -- Added email
    phone_number,
    country_code,
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
    NEW.email,      -- Capture email from auth.users
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'country_code',
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

-- 2. Backfill existing users
UPDATE public.user_profiles
SET email = auth.users.email
FROM auth.users
WHERE public.user_profiles.auth_user_id = auth.users.id;

SELECT 'Email sync migration completed' as status;
