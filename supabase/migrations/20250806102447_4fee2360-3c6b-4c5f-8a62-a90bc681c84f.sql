-- Create group invitations table
CREATE TABLE public.group_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  group_name TEXT NOT NULL,
  saved_restaurant_id UUID NOT NULL,
  proposed_date TIMESTAMP WITH TIME ZONE NOT NULL,
  rsvp_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  custom_message TEXT,
  invite_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'base64url'),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(invite_token)
);

-- Create invitation RSVPs table  
CREATE TABLE public.invitation_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL,
  invitee_email TEXT NOT NULL,
  invitee_user_id UUID,
  response TEXT CHECK (response IN ('yes', 'no', 'maybe', 'pending')),
  guest_count INTEGER DEFAULT 1,
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(invitation_id, invitee_email)
);

-- Enable Row Level Security
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_invitations
CREATE POLICY "Users can create their own invitations" 
ON public.group_invitations 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can view their own invitations" 
ON public.group_invitations 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can update their own invitations" 
ON public.group_invitations 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view active invitations by token" 
ON public.group_invitations 
FOR SELECT 
USING (status = 'active');

-- RLS Policies for invitation_rsvps
CREATE POLICY "Invitation creators can view all RSVPs for their invitations" 
ON public.invitation_rsvps 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.group_invitations 
  WHERE id = invitation_rsvps.invitation_id 
  AND creator_id = auth.uid()
));

CREATE POLICY "Users can view their own RSVP responses" 
ON public.invitation_rsvps 
FOR SELECT 
USING (auth.uid() = invitee_user_id OR auth.uid() = ANY(
  SELECT creator_id FROM public.group_invitations 
  WHERE id = invitation_rsvps.invitation_id
));

CREATE POLICY "Anyone can insert RSVP responses" 
ON public.invitation_rsvps 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own RSVP responses" 
ON public.invitation_rsvps 
FOR UPDATE 
USING (auth.uid() = invitee_user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_group_invitations_updated_at
BEFORE UPDATE ON public.group_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key references (but not to auth.users per guidelines)
ALTER TABLE public.group_invitations 
ADD CONSTRAINT fk_saved_restaurant 
FOREIGN KEY (saved_restaurant_id) REFERENCES public.saved_restaurants(id) ON DELETE CASCADE;

ALTER TABLE public.invitation_rsvps 
ADD CONSTRAINT fk_invitation 
FOREIGN KEY (invitation_id) REFERENCES public.group_invitations(id) ON DELETE CASCADE;