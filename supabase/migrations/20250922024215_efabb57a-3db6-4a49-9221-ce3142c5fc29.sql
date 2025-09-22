-- Create custom cities table for user-added cities
CREATE TABLE public.custom_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  added_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, country)
);

-- Enable RLS on custom cities
ALTER TABLE public.custom_cities ENABLE ROW LEVEL SECURITY;

-- Create policies for custom cities
CREATE POLICY "Anyone can view approved active cities" 
ON public.custom_cities 
FOR SELECT 
USING (is_approved = true AND is_active = true);

CREATE POLICY "Authenticated users can add cities" 
ON public.custom_cities 
FOR INSERT 
WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can view their own submitted cities" 
ON public.custom_cities 
FOR SELECT 
USING (auth.uid() = added_by);

CREATE POLICY "Admins can manage all custom cities" 
ON public.custom_cities 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND is_admin = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND is_admin = true
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_custom_cities_updated_at
BEFORE UPDATE ON public.custom_cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();