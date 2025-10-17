-- Create voucher schedules table
CREATE TABLE public.voucher_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  voucher_template JSONB NOT NULL,
  recurrence_pattern TEXT NOT NULL CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'custom')),
  recurrence_details JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  next_trigger_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled voucher logs table
CREATE TABLE public.scheduled_voucher_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.voucher_schedules(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES public.business_vouchers(id) ON DELETE SET NULL,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT
);

-- Create analytics report settings table
CREATE TABLE public.analytics_report_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  send_day TEXT,
  send_date INTEGER CHECK (send_date BETWEEN 1 AND 28),
  send_time TEXT NOT NULL DEFAULT '09:00',
  recipient_email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social media connections table
CREATE TABLE public.social_media_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter')),
  access_token TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, platform)
);

-- Create social media auto post settings table
CREATE TABLE public.social_media_auto_post_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  auto_post_enabled BOOLEAN NOT NULL DEFAULT false,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  post_template TEXT NOT NULL DEFAULT 'Check out our new offer: {voucher_title} - {discount}! Valid until {expiry}.',
  include_voucher_code BOOLEAN NOT NULL DEFAULT true,
  include_business_link BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social media posts table
CREATE TABLE public.social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES public.business_vouchers(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  post_id TEXT,
  post_content TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.voucher_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_voucher_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_report_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_auto_post_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voucher_schedules
CREATE POLICY "First class businesses can view their schedules"
  ON public.voucher_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = voucher_schedules.business_id
      AND businesses.user_id = auth.uid()
      AND businesses.subscription_tier = 'firstclass'
    )
  );

CREATE POLICY "First class businesses can manage their schedules"
  ON public.voucher_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = voucher_schedules.business_id
      AND businesses.user_id = auth.uid()
      AND businesses.subscription_tier = 'firstclass'
    )
  );

-- RLS Policies for scheduled_voucher_logs
CREATE POLICY "First class businesses can view their logs"
  ON public.scheduled_voucher_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.voucher_schedules vs
      JOIN public.businesses b ON vs.business_id = b.id
      WHERE vs.id = scheduled_voucher_logs.schedule_id
      AND b.user_id = auth.uid()
      AND b.subscription_tier = 'firstclass'
    )
  );

-- RLS Policies for analytics_report_settings
CREATE POLICY "First class businesses can manage their report settings"
  ON public.analytics_report_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = analytics_report_settings.business_id
      AND businesses.user_id = auth.uid()
      AND businesses.subscription_tier = 'firstclass'
    )
  );

-- RLS Policies for social_media_connections
CREATE POLICY "First class businesses can manage their connections"
  ON public.social_media_connections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = social_media_connections.business_id
      AND businesses.user_id = auth.uid()
      AND businesses.subscription_tier = 'firstclass'
    )
  );

-- RLS Policies for social_media_auto_post_settings
CREATE POLICY "First class businesses can manage their auto post settings"
  ON public.social_media_auto_post_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = social_media_auto_post_settings.business_id
      AND businesses.user_id = auth.uid()
      AND businesses.subscription_tier = 'firstclass'
    )
  );

-- RLS Policies for social_media_posts
CREATE POLICY "First class businesses can view their posts"
  ON public.social_media_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = social_media_posts.business_id
      AND businesses.user_id = auth.uid()
      AND businesses.subscription_tier = 'firstclass'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_voucher_schedules_business_id ON public.voucher_schedules(business_id);
CREATE INDEX idx_voucher_schedules_next_trigger ON public.voucher_schedules(next_trigger_at) WHERE is_active = true;
CREATE INDEX idx_scheduled_voucher_logs_schedule_id ON public.scheduled_voucher_logs(schedule_id);
CREATE INDEX idx_analytics_report_settings_business_id ON public.analytics_report_settings(business_id);
CREATE INDEX idx_social_media_connections_business_id ON public.social_media_connections(business_id);
CREATE INDEX idx_social_media_posts_business_id ON public.social_media_posts(business_id);
CREATE INDEX idx_social_media_posts_voucher_id ON public.social_media_posts(voucher_id);

-- Add updated_at triggers
CREATE TRIGGER update_voucher_schedules_updated_at
  BEFORE UPDATE ON public.voucher_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER update_analytics_report_settings_updated_at
  BEFORE UPDATE ON public.analytics_report_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER update_social_media_connections_updated_at
  BEFORE UPDATE ON public.social_media_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER update_social_media_auto_post_settings_updated_at
  BEFORE UPDATE ON public.social_media_auto_post_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();