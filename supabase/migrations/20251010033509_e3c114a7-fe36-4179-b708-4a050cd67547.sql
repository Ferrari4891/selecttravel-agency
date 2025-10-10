-- Add custom_amenities column to businesses table for dynamic amenities
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS custom_amenities JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.businesses.custom_amenities IS 'Stores custom amenities added by admins or business owners as key-value pairs';

-- Create index for better performance on JSONB queries
CREATE INDEX IF NOT EXISTS idx_businesses_custom_amenities ON public.businesses USING gin(custom_amenities);