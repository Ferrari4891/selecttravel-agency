-- Add subcategory column for businesses
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS business_subcategory text;

-- Function to allow admins to update business subscription reliably
CREATE OR REPLACE FUNCTION public.admin_update_business_subscription(
  p_business_id uuid,
  p_tier text,
  p_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure caller is an admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can update subscriptions';
  END IF;

  -- Perform update
  UPDATE public.businesses
  SET
    subscription_tier = p_tier,
    subscription_status = p_status,
    subscription_end_date = CASE
      WHEN p_status = 'active' THEN (now() + interval '30 days')
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = p_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;
END;
$$;