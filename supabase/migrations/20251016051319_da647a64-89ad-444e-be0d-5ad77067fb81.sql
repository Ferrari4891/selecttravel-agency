-- First, drop the old check constraint on subscription_tier
ALTER TABLE public.businesses 
DROP CONSTRAINT IF EXISTS businesses_subscription_tier_check;

-- Add new check constraint with updated tier names
ALTER TABLE public.businesses 
ADD CONSTRAINT businesses_subscription_tier_check 
CHECK (subscription_tier IN ('firstclass', 'business', 'economy', 'premium', 'basic', NULL));

-- Update subscription tier names to new naming convention
UPDATE public.businesses 
SET subscription_tier = 'business' 
WHERE subscription_tier = 'premium';

UPDATE public.businesses 
SET subscription_tier = 'economy' 
WHERE subscription_tier = 'basic';

-- Now remove old tier names from constraint (optional, for cleanup)
ALTER TABLE public.businesses 
DROP CONSTRAINT businesses_subscription_tier_check;

ALTER TABLE public.businesses 
ADD CONSTRAINT businesses_subscription_tier_check 
CHECK (subscription_tier IN ('firstclass', 'business', 'economy', NULL));