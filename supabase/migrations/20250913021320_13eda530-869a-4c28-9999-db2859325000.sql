-- Fix admin subscription update failures by using profiles-based admin check
BEGIN;

DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can update any business" ON public.businesses;

CREATE POLICY "Admins can view all businesses"
ON public.businesses
FOR SELECT
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can update any business"
ON public.businesses
FOR UPDATE
USING (public.is_user_admin(auth.uid()))
WITH CHECK (public.is_user_admin(auth.uid()));

COMMIT;