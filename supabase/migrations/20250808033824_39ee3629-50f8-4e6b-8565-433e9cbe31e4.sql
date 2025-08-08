-- Add business amenity columns to match member preferences
ALTER TABLE public.businesses 
ADD COLUMN wheelchair_access boolean DEFAULT false,
ADD COLUMN extended_hours boolean DEFAULT false,
ADD COLUMN gluten_free boolean DEFAULT false,
ADD COLUMN low_noise boolean DEFAULT false,
ADD COLUMN public_transport boolean DEFAULT false,
ADD COLUMN pet_friendly boolean DEFAULT false,
ADD COLUMN outdoor_seating boolean DEFAULT false,
ADD COLUMN senior_discounts boolean DEFAULT false,
ADD COLUMN online_booking boolean DEFAULT false,
ADD COLUMN air_conditioned boolean DEFAULT false;