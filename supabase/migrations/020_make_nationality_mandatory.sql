-- Migration to make nationality mandatory
-- This adds a NOT NULL constraint to the nationality column

-- First, ensure there are no null values (fallback to 'United States' if any still exist)
-- This is a safety measure, though we should have migrated them already
UPDATE user_profiles 
SET nationality = 'United States' 
WHERE nationality IS NULL OR nationality = '';

-- Now add the NOT NULL constraint
ALTER TABLE user_profiles 
ALTER COLUMN nationality SET NOT NULL;
