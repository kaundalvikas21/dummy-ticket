-- Migration to update existing nationality codes to full country names
-- This fixes the issue where nationalities were stored as codes (e.g., 'IN', 'US')
-- instead of full names (e.g., 'India', 'United States')

UPDATE user_profiles 
SET nationality = CASE nationality
  WHEN 'US' THEN 'United States'
  WHEN 'UK' THEN 'United Kingdom'
  WHEN 'CA' THEN 'Canada'
  WHEN 'AU' THEN 'Australia'
  WHEN 'IN' THEN 'India'
  WHEN 'DE' THEN 'Germany'
  WHEN 'FR' THEN 'France'
  WHEN 'IT' THEN 'Italy'
  WHEN 'ES' THEN 'Spain'
  WHEN 'JP' THEN 'Japan'
  WHEN 'CN' THEN 'China'
  WHEN 'SG' THEN 'Singapore'
  WHEN 'AE' THEN 'United Arab Emirates'
  WHEN 'SA' THEN 'Saudi Arabia'
  WHEN 'NZ' THEN 'New Zealand'
  WHEN 'KR' THEN 'South Korea'
  WHEN 'BR' THEN 'Brazil'
  WHEN 'ZA' THEN 'South Africa'
  WHEN 'MX' THEN 'Mexico'
  WHEN 'TH' THEN 'Thailand'
  ELSE nationality -- Keep existing value if it doesn't match any code (or is already full name)
END
WHERE nationality IN (
  'US', 'UK', 'CA', 'AU', 'IN', 'DE', 'FR', 'IT', 'ES', 'JP', 
  'CN', 'SG', 'AE', 'SA', 'NZ', 'KR', 'BR', 'ZA', 'MX', 'TH'
);
