-- Add voucher code fields to business_vouchers
ALTER TABLE public.business_vouchers 
ADD COLUMN IF NOT EXISTS voucher_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT;

-- Create index for faster voucher code lookups
CREATE INDEX IF NOT EXISTS idx_voucher_code ON public.business_vouchers(voucher_code);

-- Create voucher_usage table for tracking redemptions (without business_id FK)
CREATE TABLE IF NOT EXISTS public.voucher_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES public.business_vouchers(id) ON DELETE CASCADE,
  user_email TEXT,
  redeemed_by_name TEXT,
  amount_saved NUMERIC NOT NULL DEFAULT 0,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on voucher_usage
ALTER TABLE public.voucher_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view voucher usage (for transparency)
DROP POLICY IF EXISTS "Anyone can view voucher usage" ON public.voucher_usage;
CREATE POLICY "Anyone can view voucher usage"
  ON public.voucher_usage
  FOR SELECT
  USING (true);

-- Policy: Business owners can view their voucher usage through join
DROP POLICY IF EXISTS "Business owners can view their voucher usage" ON public.voucher_usage;
CREATE POLICY "Business owners can view their voucher usage"
  ON public.voucher_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_vouchers bv
      JOIN public.businesses b ON b.id = bv.business_id
      WHERE bv.id = voucher_usage.voucher_id
      AND b.user_id = auth.uid()
    )
  );

-- Policy: First class businesses can record redemptions
DROP POLICY IF EXISTS "First class businesses can record redemptions" ON public.voucher_usage;
CREATE POLICY "First class businesses can record redemptions"
  ON public.voucher_usage
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_vouchers bv
      JOIN public.businesses b ON b.id = bv.business_id
      WHERE bv.id = voucher_usage.voucher_id
      AND b.user_id = auth.uid()
      AND b.subscription_tier = 'firstclass'
    )
  );

-- Update RLS policies for business_vouchers to allow public viewing of active vouchers
DROP POLICY IF EXISTS "Anyone can view active non-expired vouchers" ON public.business_vouchers;
CREATE POLICY "Anyone can view active non-expired vouchers"
  ON public.business_vouchers
  FOR SELECT
  USING (
    is_active = true 
    AND end_date > now()
    AND start_date <= now()
  );

-- Function to generate unique voucher code
CREATE OR REPLACE FUNCTION public.generate_voucher_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate format: VCH-XXXXXX (6 random alphanumeric chars)
    code := 'VCH-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.business_vouchers WHERE voucher_code = code) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Trigger to auto-generate voucher codes on insert
CREATE OR REPLACE FUNCTION public.set_voucher_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.voucher_code IS NULL THEN
    NEW.voucher_code := public.generate_voucher_code();
  END IF;
  
  IF NEW.qr_code_data IS NULL THEN
    NEW.qr_code_data := jsonb_build_object(
      'type', 'voucher',
      'code', NEW.voucher_code,
      'voucher_id', NEW.id,
      'business_id', NEW.business_id
    )::text;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_voucher_code ON public.business_vouchers;
CREATE TRIGGER trigger_set_voucher_code
  BEFORE INSERT ON public.business_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_voucher_code();