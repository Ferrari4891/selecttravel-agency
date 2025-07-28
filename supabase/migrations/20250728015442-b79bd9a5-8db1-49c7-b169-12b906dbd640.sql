-- Create table for saved restaurants
CREATE TABLE public.saved_restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  restaurant_address TEXT NOT NULL,
  restaurant_data JSONB NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_name, restaurant_address)
);

-- Enable Row Level Security
ALTER TABLE public.saved_restaurants ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own saved restaurants" 
ON public.saved_restaurants 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save restaurants" 
ON public.saved_restaurants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved restaurants" 
ON public.saved_restaurants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved restaurants" 
ON public.saved_restaurants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_restaurants_updated_at
BEFORE UPDATE ON public.saved_restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();