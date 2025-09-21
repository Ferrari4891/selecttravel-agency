-- Add the missing columns that the BusinessProfile form expects
ALTER TABLE public.businesses 
ADD COLUMN business_category TEXT,
ADD COLUMN business_subtype TEXT,
ADD COLUMN business_specific_type TEXT;

-- Migrate existing data to new structure
-- Convert existing business_type values to the new structure
UPDATE public.businesses 
SET 
  business_category = CASE 
    WHEN business_type ILIKE '%restaurant%' OR business_type = 'Eat' THEN 'Food'
    WHEN business_type ILIKE '%bar%' OR business_type = 'Drink' THEN 'Drink'
    ELSE 'Food' -- Default to Food for unknown types
  END,
  business_subtype = CASE 
    WHEN business_subcategory = 'casual-dining' THEN 'Restaurants'
    WHEN business_subcategory = 'fine-dining' THEN 'Restaurants'
    WHEN business_subcategory = 'fast-food' THEN 'Fast Food'
    WHEN business_type ILIKE '%bar%' THEN 'Bars'
    WHEN business_type ILIKE '%club%' THEN 'Clubs'
    WHEN business_type = 'Eat' THEN 'Restaurants'
    WHEN business_type = 'Drink' THEN 'Bars'
    ELSE 'Restaurants' -- Default
  END,
  business_specific_type = CASE 
    WHEN business_subcategory = 'casual-dining' THEN 'International Food'
    WHEN business_subcategory = 'fine-dining' THEN 'International Food'
    WHEN business_subcategory = 'fast-food' THEN 'Burger Chains'
    ELSE NULL
  END
WHERE business_category IS NULL;

-- Update the business_type field to be consistent with the new structure
UPDATE public.businesses 
SET business_type = business_category || ' - ' || business_subtype || 
  CASE 
    WHEN business_specific_type IS NOT NULL THEN ' (' || business_specific_type || ')'
    ELSE ''
  END
WHERE business_category IS NOT NULL AND business_subtype IS NOT NULL;