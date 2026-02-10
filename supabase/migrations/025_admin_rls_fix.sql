-- Migration 025: Admin RLS Fix
-- Allow users with 'admin' role to see and manage all profiles using JWT claims

-- Add policy for Admins to SELECT all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- Add policy for Admins to DELETE all profiles
CREATE POLICY "Admins can delete all profiles" 
ON public.user_profiles 
FOR DELETE 
TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- Add policy for Admins to UPDATE all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);
