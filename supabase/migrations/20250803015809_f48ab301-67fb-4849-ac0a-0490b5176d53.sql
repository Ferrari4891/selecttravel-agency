-- Make the heroimages bucket public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'heroimages';

-- Create storage policies for the heroimages bucket
-- Allow public access to view images
CREATE POLICY "Public Access to View Images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'heroimages');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Users Can Upload Images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'heroimages' AND auth.role() = 'authenticated');

-- Allow authenticated users to update/replace images
CREATE POLICY "Authenticated Users Can Update Images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'heroimages' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images  
CREATE POLICY "Authenticated Users Can Delete Images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'heroimages' AND auth.role() = 'authenticated');

-- Create a profiles table extension for admin roles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create an admin user management function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = is_admin.user_id 
        AND profiles.is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;