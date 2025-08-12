-- Fix critical security issue: Restrict profile visibility to profile owners only
-- Drop the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- If there's a legitimate need for some public profile information (like display names for social features),
-- this should be handled separately with a dedicated public_profiles view or specific fields,
-- rather than exposing all profile data to everyone.