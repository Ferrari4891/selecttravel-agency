-- Create storage policies for heroimages bucket

-- Policy to allow users to view all images in heroimages bucket
CREATE POLICY "Allow public read access to heroimages" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'heroimages');

-- Policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload heroimages" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'heroimages' AND auth.role() = 'authenticated');

-- Policy to allow users to update their own uploaded images
CREATE POLICY "Allow users to update their own heroimages" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'heroimages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to delete their own uploaded images
CREATE POLICY "Allow users to delete their own heroimages" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'heroimages' AND auth.uid()::text = (storage.foldername(name))[1]);