-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = is_admin.user_id 
        AND profiles.is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;