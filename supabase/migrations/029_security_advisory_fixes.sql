-- Migration 029: Security Advisory Fixes
-- Fixes "Function Search Path Mutable" and "RLS Policy Always True" warnings from Supabase Security Advisor

-- 1. Fix Function Search Paths
-- Explicitly set search_path to public to prevent schema hijacking
-- We use ALTER FUNCTION ... SET search_path = public;

BEGIN;

-- Known functions from migrations
ALTER FUNCTION public.get_admin_user_ids() SET search_path = public;
ALTER FUNCTION public.handle_new_booking_notification() SET search_path = public;
ALTER FUNCTION public.handle_booking_update_notification() SET search_path = public;
ALTER FUNCTION public.handle_new_contact_notification() SET search_path = public;
ALTER FUNCTION public.handle_new_user_notification() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.create_user_profile_on_signup() SET search_path = public;

-- 2. Refine RLS Policies
-- "Always True" policies are risky. We restrict them to stricter checks.

-- Bookings: Restrict INSERT to 'pending' status
-- Previous policy was: WITH CHECK (true)
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
CREATE POLICY "Anyone can create bookings"
ON bookings FOR INSERT
WITH CHECK (status = 'pending');

-- Contact Submissions: Restrict INSERT to 'pending' status
-- Previous policy was: WITH CHECK (true)
DROP POLICY IF EXISTS "Public insert access - contact_submissions" ON contact_submissions;
CREATE POLICY "Public insert access - contact_submissions"
ON contact_submissions FOR INSERT
WITH CHECK (status = 'pending');

COMMIT;

-- 3. Handle potentially missing functions (defined manually or remotely)
-- These are executed in a DO block to avoid failure if they don't exist in the local environment
DO $$
BEGIN
    -- validate_contact_submission
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_contact_submission') THEN
        EXECUTE 'ALTER FUNCTION public.validate_contact_submission() SET search_path = public';
    END IF;

    -- is_user_owned
    -- Note: We assume it has no arguments or is unique. If it has arguments, this dynamic SQL might fail if not specific.
    -- We try to target it by name.
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_user_owned') THEN
         -- Attempt to find the specific signature to alter
         -- strict naming might be needed if overloaded, but usually isn't for this type of function.
         EXECUTE 'ALTER FUNCTION public.is_user_owned SET search_path = public';
    END IF;
END $$;
