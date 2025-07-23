-- Create audio files storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-files', 'audio-files', true);

-- Create policies for public access to audio files
CREATE POLICY "Anyone can view audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio-files');

-- Allow authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio-files' AND auth.role() = 'authenticated');

-- Allow authenticated users to update audio files
CREATE POLICY "Authenticated users can update audio files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'audio-files' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete audio files
CREATE POLICY "Authenticated users can delete audio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio-files' AND auth.role() = 'authenticated');