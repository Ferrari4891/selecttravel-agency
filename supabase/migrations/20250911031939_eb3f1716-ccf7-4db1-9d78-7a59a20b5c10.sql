-- Create business_registrations table for initial business signup
CREATE TABLE public.business_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending_setup',
  auth_user_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for business registrations
CREATE POLICY "Anyone can insert business registrations" 
ON public.business_registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own registrations" 
ON public.business_registrations 
FOR SELECT 
USING (auth.uid() = auth_user_id OR auth_user_id IS NULL);

CREATE POLICY "Users can update their own registrations" 
ON public.business_registrations 
FOR UPDATE 
USING (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_registrations_updated_at
BEFORE UPDATE ON public.business_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();