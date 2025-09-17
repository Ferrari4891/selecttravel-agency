-- Add support for multiple categories for first-class businesses
ALTER TABLE public.businesses 
ADD COLUMN business_categories TEXT[] DEFAULT ARRAY[business_type];

-- Update existing businesses to have their current business_type in the array
UPDATE public.businesses 
SET business_categories = ARRAY[business_type] 
WHERE business_categories IS NULL;

-- Create index for better performance on category searches
CREATE INDEX idx_businesses_categories ON public.businesses USING GIN(business_categories);