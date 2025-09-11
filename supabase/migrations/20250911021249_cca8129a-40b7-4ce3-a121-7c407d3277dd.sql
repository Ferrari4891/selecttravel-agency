-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce( (auth.jwt()->>'role') = 'admin', false );
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;