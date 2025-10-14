-- Phase 1: Database Enhancement for Comprehensive Analytics

-- Create customer interaction events table for future extensibility
CREATE TABLE IF NOT EXISTS public.customer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'visit', 'voucher_redeem', 'gift_card_purchase', etc.
  customer_identifier TEXT, -- email, IP, or member ID
  interaction_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on customer interactions
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_interactions
CREATE POLICY "Business owners can view their interactions"
  ON public.customer_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = customer_interactions.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert interactions"
  ON public.customer_interactions
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_interactions_business_id 
  ON public.customer_interactions(business_id);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_type 
  ON public.customer_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_at 
  ON public.customer_interactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_views_business_id_date 
  ON public.business_views(business_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_visits_business_id_date 
  ON public.member_visits(business_id, visit_date DESC);

-- Create aggregated analytics view
CREATE OR REPLACE VIEW public.business_analytics_overview AS
SELECT 
  b.id as business_id,
  b.business_name,
  b.subscription_tier,
  -- Online metrics
  COUNT(DISTINCT bv.id) as total_online_views,
  COUNT(DISTINCT bv.id) FILTER (WHERE bv.viewed_at >= CURRENT_DATE) as today_online_views,
  COUNT(DISTINCT bv.id) FILTER (WHERE bv.viewed_at >= CURRENT_DATE - INTERVAL '7 days') as week_online_views,
  COUNT(DISTINCT bv.id) FILTER (WHERE bv.viewed_at >= CURRENT_DATE - INTERVAL '30 days') as month_online_views,
  COUNT(DISTINCT bv.visitor_ip) as unique_online_visitors,
  -- Physical visit metrics
  COUNT(DISTINCT mv.id) as total_physical_visits,
  COUNT(DISTINCT mv.id) FILTER (WHERE mv.visit_date >= CURRENT_DATE) as today_physical_visits,
  COUNT(DISTINCT mv.id) FILTER (WHERE mv.visit_date >= CURRENT_DATE - INTERVAL '7 days') as week_physical_visits,
  COUNT(DISTINCT mv.id) FILTER (WHERE mv.visit_date >= CURRENT_DATE - INTERVAL '30 days') as month_physical_visits,
  COUNT(DISTINCT mv.card_id) as unique_physical_visitors,
  -- Combined metrics
  (COUNT(DISTINCT bv.id) + COUNT(DISTINCT mv.id)) as total_interactions,
  (COUNT(DISTINCT bv.id) FILTER (WHERE bv.viewed_at >= CURRENT_DATE) + 
   COUNT(DISTINCT mv.id) FILTER (WHERE mv.visit_date >= CURRENT_DATE)) as today_total_interactions
FROM public.businesses b
LEFT JOIN public.business_views bv ON b.id = bv.business_id
LEFT JOIN public.member_visits mv ON b.id = mv.business_id
WHERE b.status = 'approved'
GROUP BY b.id, b.business_name, b.subscription_tier;

-- Grant select on view to authenticated users
GRANT SELECT ON public.business_analytics_overview TO authenticated;

-- Function to get business analytics summary
CREATE OR REPLACE FUNCTION public.get_business_analytics_summary(p_business_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user owns this business
  IF NOT EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = p_business_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to business analytics';
  END IF;

  SELECT jsonb_build_object(
    'online', jsonb_build_object(
      'total_views', COUNT(DISTINCT bv.id),
      'unique_visitors', COUNT(DISTINCT bv.visitor_ip),
      'today', COUNT(DISTINCT bv.id) FILTER (WHERE bv.viewed_at >= CURRENT_DATE),
      'this_week', COUNT(DISTINCT bv.id) FILTER (WHERE bv.viewed_at >= CURRENT_DATE - INTERVAL '7 days'),
      'this_month', COUNT(DISTINCT bv.id) FILTER (WHERE bv.viewed_at >= CURRENT_DATE - INTERVAL '30 days')
    ),
    'physical', jsonb_build_object(
      'total_visits', COUNT(DISTINCT mv.id),
      'unique_members', COUNT(DISTINCT mv.card_id),
      'today', COUNT(DISTINCT mv.id) FILTER (WHERE mv.visit_date >= CURRENT_DATE),
      'this_week', COUNT(DISTINCT mv.id) FILTER (WHERE mv.visit_date >= CURRENT_DATE - INTERVAL '7 days'),
      'this_month', COUNT(DISTINCT mv.id) FILTER (WHERE mv.visit_date >= CURRENT_DATE - INTERVAL '30 days')
    ),
    'vouchers', jsonb_build_object(
      'active_vouchers', COUNT(DISTINCT v.id) FILTER (WHERE v.is_active = true AND v.end_date > now()),
      'total_vouchers', COUNT(DISTINCT v.id),
      'total_redemptions', COALESCE(SUM(v.current_uses), 0)
    ),
    'gift_cards', jsonb_build_object(
      'active_cards', COUNT(DISTINCT gc.id) FILTER (WHERE gc.status = 'active'),
      'total_amount', COALESCE(SUM(gc.amount) FILTER (WHERE gc.status = 'active'), 0),
      'redeemed_count', COUNT(DISTINCT gc.id) FILTER (WHERE gc.status = 'redeemed')
    )
  ) INTO result
  FROM public.businesses b
  LEFT JOIN public.business_views bv ON b.id = bv.business_id 
    AND bv.viewed_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  LEFT JOIN public.member_visits mv ON b.id = mv.business_id
    AND mv.visit_date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  LEFT JOIN public.business_vouchers v ON b.id = v.business_id
  LEFT JOIN public.gift_cards gc ON b.id = gc.business_id
  WHERE b.id = p_business_id
  GROUP BY b.id;

  RETURN result;
END;
$$;

-- Enable realtime for customer_interactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_interactions;

-- Add trigger for updated_at
CREATE TRIGGER update_customer_interactions_updated_at
  BEFORE UPDATE ON public.customer_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.customer_interactions IS 'Tracks all customer interactions with businesses for comprehensive analytics';
COMMENT ON FUNCTION public.get_business_analytics_summary IS 'Returns comprehensive analytics summary for a business including online, physical, vouchers, and gift cards';