-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true);

-- Create storage policies for business images
CREATE POLICY "Business owners can upload their images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Business owners can view their images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Business owners can update their images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Business owners can delete their images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view business images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-images');

-- Add image columns to businesses table
ALTER TABLE businesses 
ADD COLUMN image_1_url TEXT,
ADD COLUMN image_2_url TEXT,
ADD COLUMN image_3_url TEXT;