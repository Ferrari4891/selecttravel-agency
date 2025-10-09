-- Add policy to allow anyone to view approved businesses
CREATE POLICY "Anyone can view approved businesses"
ON public.businesses
FOR SELECT
USING (status = 'approved');