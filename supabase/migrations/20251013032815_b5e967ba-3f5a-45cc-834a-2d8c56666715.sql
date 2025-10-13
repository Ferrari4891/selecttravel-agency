-- Member cards table (unified for both member types)
CREATE TABLE public.member_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to either authenticated or simple member
  profile_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  simple_member_id uuid REFERENCES public.simple_members(id) ON DELETE CASCADE,
  
  -- Card details
  card_number text UNIQUE NOT NULL,
  qr_code_data text NOT NULL,
  
  -- Member info (denormalized for quick access)
  member_name text NOT NULL,
  member_email text NOT NULL,
  
  -- Status
  is_active boolean DEFAULT true,
  issued_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure only one type of member link
  CONSTRAINT member_link_check CHECK (
    (profile_id IS NOT NULL AND simple_member_id IS NULL) OR
    (profile_id IS NULL AND simple_member_id IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_member_cards_profile_id ON public.member_cards(profile_id);
CREATE INDEX idx_member_cards_simple_member_id ON public.member_cards(simple_member_id);
CREATE INDEX idx_member_cards_card_number ON public.member_cards(card_number);
CREATE INDEX idx_member_cards_member_email ON public.member_cards(member_email);

-- RLS Policies
ALTER TABLE public.member_cards ENABLE ROW LEVEL SECURITY;

-- Members can view their own card
CREATE POLICY "Members can view own card" ON public.member_cards
  FOR SELECT
  USING (
    auth.uid() = profile_id OR
    member_email = (auth.jwt() ->> 'email')
  );

-- First-class businesses can scan cards for tracking
CREATE POLICY "First class businesses can scan cards" ON public.member_cards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.user_id = auth.uid()
      AND businesses.subscription_tier = 'firstclass'
      AND businesses.status = 'approved'
    )
  );

-- Service role can manage all cards (for edge functions)
CREATE POLICY "Service role can manage cards" ON public.member_cards
  FOR ALL
  USING (true);

-- Trigger to auto-create card for new profiles
CREATE OR REPLACE FUNCTION public.create_member_card_for_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  card_num text;
BEGIN
  -- Generate unique card number (format: year + random 6 digits)
  card_num := TO_CHAR(NOW(), 'YYYY') || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.member_cards WHERE card_number = card_num) LOOP
    card_num := TO_CHAR(NOW(), 'YYYY') || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  END LOOP;
  
  -- Create the card
  INSERT INTO public.member_cards (
    profile_id,
    card_number,
    qr_code_data,
    member_name,
    member_email
  ) VALUES (
    NEW.user_id,
    card_num,
    jsonb_build_object(
      'type', 'member_card',
      'card_number', card_num,
      'member_id', NEW.user_id,
      'issued', NOW()
    )::text,
    COALESCE(NEW.display_name, NEW.first_name || ' ' || NEW.last_name, 'Member'),
    NEW.email
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_card_on_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_member_card_for_profile();

-- Trigger to auto-create card for new simple members
CREATE OR REPLACE FUNCTION public.create_member_card_for_simple_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  card_num text;
BEGIN
  -- Generate unique card number
  card_num := TO_CHAR(NOW(), 'YYYY') || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.member_cards WHERE card_number = card_num) LOOP
    card_num := TO_CHAR(NOW(), 'YYYY') || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  END LOOP;
  
  -- Create the card
  INSERT INTO public.member_cards (
    simple_member_id,
    card_number,
    qr_code_data,
    member_name,
    member_email
  ) VALUES (
    NEW.id,
    card_num,
    jsonb_build_object(
      'type', 'member_card',
      'card_number', card_num,
      'member_id', NEW.id,
      'issued', NOW()
    )::text,
    NEW.display_name,
    NEW.email
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_card_on_simple_member_insert
  AFTER INSERT ON public.simple_members
  FOR EACH ROW
  EXECUTE FUNCTION public.create_member_card_for_simple_member();