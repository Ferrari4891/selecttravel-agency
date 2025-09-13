-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  tier text NOT NULL UNIQUE,
  description text,
  monthly_price numeric(10,2) NOT NULL DEFAULT 0,
  annual_price numeric(10,2) NOT NULL DEFAULT 0,
  annual_discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Create trigger for timestamps
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, description, monthly_price, annual_price, annual_discount_percentage, features, sort_order) VALUES
('Economy Class', 'economy', 'Basic features for small businesses', 29.99, 299.99, 16.67, '["Basic listing", "Contact information", "Business hours", "Up to 3 images"]', 1),
('Business Class', 'business', 'Enhanced features for growing businesses', 59.99, 599.99, 16.67, '["Everything in Economy", "Priority listing", "Unlimited images", "Customer reviews", "Basic analytics"]', 2),
('First Class', 'firstclass', 'Premium features for established businesses', 99.99, 999.99, 16.67, '["Everything in Business", "Featured placement", "Advanced analytics", "Voucher management", "Priority support", "Custom branding"]', 3);