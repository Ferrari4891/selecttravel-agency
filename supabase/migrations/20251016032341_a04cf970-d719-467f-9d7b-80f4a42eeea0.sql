-- Create table for API keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Business owners can view their own API keys
CREATE POLICY "Business owners can view their API keys"
  ON public.api_keys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = api_keys.business_id
        AND businesses.user_id = auth.uid()
        AND businesses.subscription_tier = 'firstclass'
    )
  );

-- Business owners can create API keys (First Class only)
CREATE POLICY "First class businesses can create API keys"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = api_keys.business_id
        AND businesses.user_id = auth.uid()
        AND businesses.subscription_tier = 'firstclass'
    )
  );

-- Business owners can update their API keys
CREATE POLICY "Business owners can update their API keys"
  ON public.api_keys
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = api_keys.business_id
        AND businesses.user_id = auth.uid()
    )
  );

-- Business owners can delete their API keys
CREATE POLICY "Business owners can delete their API keys"
  ON public.api_keys
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = api_keys.business_id
        AND businesses.user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_business_id ON public.api_keys(business_id);