-- Update subscription tier constraint to include 'firstclass'
ALTER TABLE public.businesses 
DROP CONSTRAINT businesses_subscription_tier_check;

ALTER TABLE public.businesses 
ADD CONSTRAINT businesses_subscription_tier_check 
CHECK (subscription_tier = ANY (ARRAY['basic'::text, 'premium'::text, 'enterprise'::text, 'firstclass'::text]));