-- Add gift cards support to businesses table
ALTER TABLE public.businesses 
ADD COLUMN gift_cards_enabled boolean DEFAULT false;

-- Create gift_cards table
CREATE TABLE public.gift_cards (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid NOT NULL,
    recipient_name text NOT NULL,
    recipient_email text NOT NULL,
    recipient_phone text,
    message text,
    amount numeric(10,2) NOT NULL,
    qr_code text NOT NULL UNIQUE,
    numeric_code text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
    purchased_by_email text NOT NULL,
    purchased_by_name text NOT NULL,
    stripe_payment_intent_id text,
    expires_at timestamp with time zone DEFAULT (now() + interval '1 year'),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT fk_gift_cards_business FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

-- Create gift_card_redemptions table
CREATE TABLE public.gift_card_redemptions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gift_card_id uuid NOT NULL,
    redeemed_amount numeric(10,2) NOT NULL,
    remaining_balance numeric(10,2) NOT NULL DEFAULT 0,
    redeemed_at timestamp with time zone NOT NULL DEFAULT now(),
    redeemed_by_staff text,
    notes text,
    CONSTRAINT fk_redemptions_gift_card FOREIGN KEY (gift_card_id) REFERENCES public.gift_cards(id) ON DELETE CASCADE
);

-- Enable RLS on gift_cards table
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gift_cards
CREATE POLICY "Business owners can view their gift cards" 
ON public.gift_cards 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = gift_cards.business_id 
    AND businesses.user_id = auth.uid()
));

CREATE POLICY "Business owners can manage their gift cards" 
ON public.gift_cards 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = gift_cards.business_id 
    AND businesses.user_id = auth.uid()
));

CREATE POLICY "Anyone can insert gift cards" 
ON public.gift_cards 
FOR INSERT 
WITH CHECK (true);

-- Enable RLS on gift_card_redemptions table
ALTER TABLE public.gift_card_redemptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gift_card_redemptions
CREATE POLICY "Business owners can view redemptions for their gift cards" 
ON public.gift_card_redemptions 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.gift_cards gc
    JOIN public.businesses b ON b.id = gc.business_id
    WHERE gc.id = gift_card_redemptions.gift_card_id 
    AND b.user_id = auth.uid()
));

CREATE POLICY "Business owners can manage redemptions for their gift cards" 
ON public.gift_card_redemptions 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.gift_cards gc
    JOIN public.businesses b ON b.id = gc.business_id
    WHERE gc.id = gift_card_redemptions.gift_card_id 
    AND b.user_id = auth.uid()
));

-- Add triggers for updated_at
CREATE TRIGGER update_gift_cards_updated_at
    BEFORE UPDATE ON public.gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_gift_cards_business_id ON public.gift_cards(business_id);
CREATE INDEX idx_gift_cards_qr_code ON public.gift_cards(qr_code);
CREATE INDEX idx_gift_cards_numeric_code ON public.gift_cards(numeric_code);
CREATE INDEX idx_gift_cards_status ON public.gift_cards(status);
CREATE INDEX idx_gift_card_redemptions_gift_card_id ON public.gift_card_redemptions(gift_card_id);