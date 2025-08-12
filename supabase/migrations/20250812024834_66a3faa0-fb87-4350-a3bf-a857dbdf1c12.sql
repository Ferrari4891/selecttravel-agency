-- Fix critical security issue: Restrict "Test Eat" table access to authenticated users only
-- Drop the overly permissive policy that allows anyone (including unauthenticated users) to view restaurant data
DROP POLICY IF EXISTS "Anyone can view Test Eat data" ON public."Test Eat";

-- Create a secure policy that only allows authenticated users to view restaurant data
CREATE POLICY "Authenticated users can view restaurant data" 
ON public."Test Eat" 
FOR SELECT 
TO authenticated
USING (true);

-- This ensures that:
-- 1. Only logged-in users can access restaurant contact information
-- 2. Anonymous/unauthenticated users cannot harvest email addresses or phone numbers
-- 3. Restaurant privacy is better protected while maintaining functionality for legitimate users