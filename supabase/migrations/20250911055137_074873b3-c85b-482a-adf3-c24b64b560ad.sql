-- Add approval-related fields to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update status field to have specific values and change default
ALTER TABLE public.businesses 
ALTER COLUMN status SET DEFAULT 'pending';

-- Add a comment to clarify status values
COMMENT ON COLUMN public.businesses.status IS 'Business status: pending, approved, rejected, suspended, active';

-- Create an index for better performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);

-- Create index for approved businesses (most common query)
CREATE INDEX IF NOT EXISTS idx_businesses_approved ON public.businesses(status) WHERE status = 'approved';

-- Update existing 'active' businesses to 'approved' since they're already live
UPDATE public.businesses 
SET status = 'approved', approved_at = created_at 
WHERE status = 'active';

-- Create a function to handle business approval
CREATE OR REPLACE FUNCTION public.approve_business(
  business_id UUID,
  admin_user_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = admin_user_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can approve businesses';
  END IF;

  -- Update the business status
  UPDATE public.businesses 
  SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = admin_user_id,
    admin_notes = notes
  WHERE id = business_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;
END;
$$;

-- Create a function to handle business rejection
CREATE OR REPLACE FUNCTION public.reject_business(
  business_id UUID,
  admin_user_id UUID,
  reason TEXT,
  notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = admin_user_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can reject businesses';
  END IF;

  -- Update the business status
  UPDATE public.businesses 
  SET 
    status = 'rejected',
    rejection_reason = reason,
    admin_notes = notes,
    approved_by = admin_user_id,
    approved_at = NOW()
  WHERE id = business_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;
END;
$$;

-- Add RLS policy for admins to view all businesses
CREATE POLICY "Admins can view all businesses" 
ON public.businesses 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Add RLS policy for public to only see approved businesses
CREATE POLICY "Public can view approved businesses" 
ON public.businesses 
FOR SELECT 
TO anon, authenticated 
USING (status = 'approved');