-- Create tables for real-time performance tracking and vouchers

-- Create business_views table for tracking views/visits
CREATE TABLE public.business_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  visitor_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT
);

-- Enable RLS for business_views
ALTER TABLE public.business_views ENABLE ROW LEVEL SECURITY;

-- Create policies for business_views
CREATE POLICY "Business owners can view their analytics" 
ON public.business_views 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.businesses 
  WHERE businesses.id = business_views.business_id 
  AND businesses.user_id = auth.uid()
));

CREATE POLICY "Anyone can record views" 
ON public.business_views 
FOR INSERT 
WITH CHECK (true);

-- Create vouchers table
CREATE TYPE public.voucher_type AS ENUM ('percentage_discount', 'fixed_amount', 'buy_one_get_one');

CREATE TABLE public.business_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  voucher_type voucher_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_value NUMERIC NOT NULL, -- percentage or fixed amount
  min_purchase_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for vouchers
ALTER TABLE public.business_vouchers ENABLE ROW LEVEL SECURITY;

-- Create policies for vouchers - only first class subscribers can manage vouchers
CREATE POLICY "First class subscribers can manage vouchers" 
ON public.business_vouchers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.businesses 
  WHERE businesses.id = business_vouchers.business_id 
  AND businesses.user_id = auth.uid()
  AND businesses.subscription_tier = 'firstclass'
));

CREATE POLICY "Anyone can view active vouchers" 
ON public.business_vouchers 
FOR SELECT 
USING (is_active = true AND end_date > now());

-- Create voucher usage tracking table
CREATE TABLE public.voucher_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID NOT NULL,
  user_email TEXT,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount_saved NUMERIC NOT NULL
);

-- Enable RLS for voucher usage
ALTER TABLE public.voucher_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for voucher usage
CREATE POLICY "Business owners can view voucher usage" 
ON public.voucher_usage 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.business_vouchers bv
  JOIN public.businesses b ON b.id = bv.business_id
  WHERE bv.id = voucher_usage.voucher_id 
  AND b.user_id = auth.uid()
));

CREATE POLICY "Anyone can record voucher usage" 
ON public.voucher_usage 
FOR INSERT 
WITH CHECK (true);

-- Create updated_at trigger for vouchers
CREATE TRIGGER update_business_vouchers_updated_at
  BEFORE UPDATE ON public.business_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add replica identity for real-time updates
ALTER TABLE public.business_views REPLICA IDENTITY FULL;
ALTER TABLE public.business_vouchers REPLICA IDENTITY FULL;
ALTER TABLE public.voucher_usage REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_vouchers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voucher_usage;