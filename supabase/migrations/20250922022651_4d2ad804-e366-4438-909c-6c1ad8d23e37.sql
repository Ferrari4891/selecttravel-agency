-- Add new search criteria columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN price_level TEXT CHECK (price_level IN ('$', '$$', '$$$')),
ADD COLUMN cuisine_type TEXT,
ADD COLUMN food_specialties TEXT[],
ADD COLUMN drink_specialties TEXT[];

-- Create price level settings table for admin configuration
CREATE TABLE public.price_level_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL UNIQUE CHECK (level IN ('$', '$$', '$$$')),
  min_price NUMERIC NOT NULL DEFAULT 0,
  max_price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on price level settings
ALTER TABLE public.price_level_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for price level settings
CREATE POLICY "Anyone can view price level settings" 
ON public.price_level_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage price level settings" 
ON public.price_level_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND is_admin = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND is_admin = true
));

-- Insert default price level settings
INSERT INTO public.price_level_settings (level, min_price, max_price, description) VALUES
('$', 0, 15, 'Budget-friendly options'),
('$$', 16, 35, 'Mid-range dining'),
('$$$', 36, 999, 'Premium dining experience');

-- Create predefined cuisine types table
CREATE TABLE public.cuisine_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cuisine types
ALTER TABLE public.cuisine_types ENABLE ROW LEVEL SECURITY;

-- Create policies for cuisine types
CREATE POLICY "Anyone can view active cuisine types" 
ON public.cuisine_types 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage cuisine types" 
ON public.cuisine_types 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND is_admin = true
));

-- Insert common cuisine types
INSERT INTO public.cuisine_types (name, sort_order) VALUES
('Mexican', 1),
('Chinese', 2),
('Italian', 3),
('French', 4),
('Japanese', 5),
('Indian', 6),
('Thai', 7),
('American', 8),
('Mediterranean', 9),
('Korean', 10),
('Vietnamese', 11),
('Greek', 12),
('Spanish', 13),
('Turkish', 14),
('Lebanese', 15);

-- Create predefined food specialties table
CREATE TABLE public.food_specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'main',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on food specialties
ALTER TABLE public.food_specialties ENABLE ROW LEVEL SECURITY;

-- Create policies for food specialties
CREATE POLICY "Anyone can view active food specialties" 
ON public.food_specialties 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage food specialties" 
ON public.food_specialties 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND is_admin = true
));

-- Insert common food specialties
INSERT INTO public.food_specialties (name, category, sort_order) VALUES
('Pizza', 'main', 1),
('Burger', 'main', 2),
('Steak', 'main', 3),
('Pasta', 'main', 4),
('Sushi', 'main', 5),
('Tacos', 'main', 6),
('BBQ', 'main', 7),
('Seafood', 'main', 8),
('Chicken', 'main', 9),
('Salad', 'main', 10),
('Sandwich', 'main', 11),
('Noodles', 'main', 12),
('Curry', 'main', 13),
('Soup', 'main', 14),
('Dessert', 'dessert', 15);

-- Create predefined drink specialties table
CREATE TABLE public.drink_specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'alcoholic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on drink specialties
ALTER TABLE public.drink_specialties ENABLE ROW LEVEL SECURITY;

-- Create policies for drink specialties
CREATE POLICY "Anyone can view active drink specialties" 
ON public.drink_specialties 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage drink specialties" 
ON public.drink_specialties 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND is_admin = true
));

-- Insert common drink specialties
INSERT INTO public.drink_specialties (name, category, sort_order) VALUES
('Craft Beer', 'alcoholic', 1),
('Wine', 'alcoholic', 2),
('Cocktails', 'alcoholic', 3),
('Whiskey', 'alcoholic', 4),
('Vodka', 'alcoholic', 5),
('Gin', 'alcoholic', 6),
('Rum', 'alcoholic', 7),
('Tequila', 'alcoholic', 8),
('Coffee', 'non-alcoholic', 9),
('Tea', 'non-alcoholic', 10),
('Smoothies', 'non-alcoholic', 11),
('Fresh Juice', 'non-alcoholic', 12),
('Soft Drinks', 'non-alcoholic', 13);