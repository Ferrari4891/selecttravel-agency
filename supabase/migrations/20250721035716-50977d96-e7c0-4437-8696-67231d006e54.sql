-- Add social media fields to businesses table
ALTER TABLE public.businesses 
ADD COLUMN facebook TEXT,
ADD COLUMN instagram TEXT,
ADD COLUMN twitter TEXT,
ADD COLUMN linkedin TEXT;