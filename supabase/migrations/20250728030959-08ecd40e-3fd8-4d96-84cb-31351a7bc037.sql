-- Fix the RLS policy issue by ensuring all tables with RLS enabled have proper policies
-- The warning is likely about the Test Eat table that has RLS enabled but no policies

-- Add basic RLS policies to Test Eat table to make it publicly readable
CREATE POLICY "Anyone can view Test Eat data" 
ON public."Test Eat" 
FOR SELECT 
USING (true);