-- Update Economy Class subscription plan
UPDATE subscription_plans
SET 
  monthly_price = 0.00,
  annual_price = 0.00,
  description = 'Essential features for small businesses getting started',
  features = jsonb_build_array(
    'Basic business listing',
    'Contact information',
    'Business hours',
    'Up to 3 images',
    'Social media links',
    'Location on map'
  )
WHERE tier = 'economy';

-- Update Business Class subscription plan  
UPDATE subscription_plans
SET 
  monthly_price = 43.33,
  annual_price = 442.00,
  annual_discount_percentage = 15,
  description = 'Enhanced features for growing businesses',
  features = jsonb_build_array(
    'Everything in Economy Class',
    'Priority listing in search results',
    'Unlimited images',
    'Customer reviews and ratings',
    'Basic analytics dashboard',
    'Email notifications',
    'Enhanced search visibility',
    'Business profile customization'
  )
WHERE tier = 'business';

-- Update First Class subscription plan
UPDATE subscription_plans
SET 
  monthly_price = 86.67,
  annual_price = 884.00,
  annual_discount_percentage = 15,
  description = 'Premium features for established businesses',
  features = jsonb_build_array(
    'Everything in Business Class',
    'Featured placement (top of listings)',
    'Advanced analytics with detailed insights',
    'Create and manage discount vouchers',
    'Gift card management system',
    'Member visit tracking with QR scanning',
    'Priority customer support',
    'Custom branding options',
    'Video header for profile',
    'Export analytics data',
    'API access for integrations'
  )
WHERE tier = 'firstclass';