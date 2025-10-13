-- Fix function search path for generate_unique_card_number
DROP FUNCTION IF EXISTS generate_unique_card_number();

CREATE OR REPLACE FUNCTION generate_unique_card_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  card_num text;
BEGIN
  LOOP
    card_num := 'MC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.member_cards WHERE card_number = card_num);
  END LOOP;
  RETURN card_num;
END;
$$;

-- Create member_visits table for Phase 2
CREATE TABLE IF NOT EXISTS public.member_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.member_cards(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  visit_date timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_visits_card_id ON public.member_visits(card_id);
CREATE INDEX IF NOT EXISTS idx_member_visits_business_id ON public.member_visits(business_id);
CREATE INDEX IF NOT EXISTS idx_member_visits_visit_date ON public.member_visits(visit_date);

-- Enable RLS
ALTER TABLE public.member_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Members can view their own visits
CREATE POLICY "Members can view their own visits"
ON public.member_visits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.member_cards mc
    WHERE mc.id = member_visits.card_id
    AND (mc.profile_id = auth.uid() OR mc.simple_member_id IN (
      SELECT id FROM public.simple_members WHERE email = (auth.jwt() ->> 'email')
    ))
  )
);

-- RLS Policies: First-class businesses can view their own visits
CREATE POLICY "Businesses can view their visits"
ON public.member_visits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = member_visits.business_id
    AND b.user_id = auth.uid()
    AND b.subscription_tier = 'firstclass'
  )
);

-- RLS Policies: First-class businesses can insert visits
CREATE POLICY "Businesses can record visits"
ON public.member_visits
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = member_visits.business_id
    AND b.user_id = auth.uid()
    AND b.subscription_tier = 'firstclass'
    AND b.status = 'approved'
  )
);

-- RLS Policies: Admins can manage all visits
CREATE POLICY "Admins can manage all visits"
ON public.member_visits
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.is_admin = true
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_member_visits_updated_at
BEFORE UPDATE ON public.member_visits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();