-- Add business hours column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN business_hours JSONB DEFAULT '{}';

-- Create a comment to document the structure of business_hours JSONB
COMMENT ON COLUMN public.businesses.business_hours IS 'Business hours stored as JSONB with structure: {
  "monday": {"open": "09:00", "close": "17:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
  "thursday": {"open": "09:00", "close": "17:00", "closed": false},
  "friday": {"open": "09:00", "close": "17:00", "closed": false},
  "saturday": {"open": "10:00", "close": "16:00", "closed": false},
  "sunday": {"open": "10:00", "close": "16:00", "closed": true}
}';