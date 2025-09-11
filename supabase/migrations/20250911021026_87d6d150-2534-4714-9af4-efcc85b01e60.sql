-- Create media_type enum
CREATE TYPE media_type AS ENUM ('carousel', 'image', 'youtube');

-- Create business_media table
CREATE TABLE IF NOT EXISTS public.business_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  media_type media_type NOT NULL,
  images jsonb,                -- array: [{ url, alt, width, height }]
  youtube_url text,
  youtube_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT coalesce( (auth.jwt()->>'role') = 'admin', false );
$$;

-- Enable RLS
ALTER TABLE public.business_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_media
CREATE POLICY "select media for owners & admins" ON public.business_media
FOR SELECT USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_media.business_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "insert media for owners & admins" ON public.business_media
FOR INSERT WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_media.business_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "update media for owners & admins" ON public.business_media
FOR UPDATE USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_media.business_id
      AND b.user_id = auth.uid()
  )
) WITH CHECK (true);

CREATE POLICY "delete media for owners & admins" ON public.business_media
FOR DELETE USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_media.business_id
      AND b.user_id = auth.uid()
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Create trigger for business_media
DROP TRIGGER IF EXISTS trg_touch_business_media ON public.business_media;
CREATE TRIGGER trg_touch_business_media 
  BEFORE UPDATE ON public.business_media
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Create business-media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('business-media', 'business-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for business-media bucket
CREATE POLICY "Business owners can upload media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'business-media' AND
  (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE auth.uid() = b.user_id
      AND (storage.foldername(name))[1] = b.id::text
    )
  )
);

CREATE POLICY "Business owners can view their media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'business-media' AND
  (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE auth.uid() = b.user_id
      AND (storage.foldername(name))[1] = b.id::text
    )
  )
);

CREATE POLICY "Business owners can update their media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'business-media' AND
  (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE auth.uid() = b.user_id
      AND (storage.foldername(name))[1] = b.id::text
    )
  )
);

CREATE POLICY "Business owners can delete their media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'business-media' AND
  (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE auth.uid() = b.user_id
      AND (storage.foldername(name))[1] = b.id::text
    )
  )
);