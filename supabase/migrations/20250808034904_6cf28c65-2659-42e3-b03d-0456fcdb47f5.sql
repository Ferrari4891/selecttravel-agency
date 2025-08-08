-- Create table for managing amenity options
CREATE TABLE public.amenity_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.amenity_options ENABLE ROW LEVEL SECURITY;

-- Anyone can read active options
CREATE POLICY "Anyone can view active amenity options"
ON public.amenity_options
FOR SELECT
USING (is_active = true);

-- Only admins can manage options
CREATE POLICY "Admins can manage amenity options"
ON public.amenity_options
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Insert default amenity options
INSERT INTO public.amenity_options (option_key, display_name, description, category, sort_order) VALUES
('wheelchair_access', 'Wheelchair Access', 'Fully accessible for wheelchair users', 'accessibility', 1),
('extended_hours', 'Extended Hours', 'Open beyond standard business hours', 'hours', 2),
('gluten_free', 'Gluten Free Options', 'Offers gluten-free menu items', 'dietary', 3),
('low_noise', 'Low Noise Environment', 'Quiet atmosphere suitable for conversation', 'environment', 4),
('public_transport', 'Public Transport Access', 'Easy access via public transportation', 'location', 5),
('pet_friendly', 'Pet Friendly', 'Welcomes pets and service animals', 'policies', 6),
('outdoor_seating', 'Outdoor Seating', 'Has patio, terrace, or outdoor dining area', 'seating', 7),
('senior_discounts', 'Senior Discounts', 'Offers special pricing for seniors', 'pricing', 8),
('online_booking', 'Online Booking', 'Accepts reservations through website or app', 'booking', 9),
('air_conditioned', 'Air Conditioned', 'Climate controlled environment', 'environment', 10);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_amenity_options_updated_at
BEFORE UPDATE ON public.amenity_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();