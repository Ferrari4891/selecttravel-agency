-- Add language preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN language_preference text DEFAULT 'en';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.language_preference IS 'User preferred language for the interface';