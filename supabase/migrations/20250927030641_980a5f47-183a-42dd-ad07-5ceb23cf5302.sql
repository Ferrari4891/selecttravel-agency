-- Create table for city requests with email notifications
CREATE TABLE public.city_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    city_name TEXT NOT NULL,
    country TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    requester_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    request_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notified_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.city_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for city requests
CREATE POLICY "Anyone can submit city requests" 
ON public.city_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own requests" 
ON public.city_requests 
FOR SELECT 
USING (requester_email = (auth.jwt() ->> 'email'::text) OR requester_email IN (
    SELECT email FROM simple_members WHERE email = city_requests.requester_email
));

CREATE POLICY "Admins can manage all city requests" 
ON public.city_requests 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_city_requests_updated_at
BEFORE UPDATE ON public.city_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_city_requests_status ON public.city_requests(status);
CREATE INDEX idx_city_requests_email ON public.city_requests(requester_email);