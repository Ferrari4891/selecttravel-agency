-- Allow administrators to manage business subscriptions via RLS
-- Add admin SELECT and UPDATE policies on public.businesses

BEGIN;

-- Admins can view all businesses
CREATE POLICY "Admins can view all businesses"
ON public.businesses
FOR SELECT
USING (is_admin());

-- Admins can update any business (status, subscription fields, etc.)
CREATE POLICY "Admins can update any business"
ON public.businesses
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

COMMIT;