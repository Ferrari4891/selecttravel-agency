-- Function to generate unique card numbers
CREATE OR REPLACE FUNCTION generate_unique_card_number()
RETURNS text AS $$
DECLARE
  card_num text;
BEGIN
  LOOP
    card_num := 'MC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.member_cards WHERE card_number = card_num);
  END LOOP;
  RETURN card_num;
END;
$$ LANGUAGE plpgsql;

-- Backfill for authenticated members (profiles)
INSERT INTO public.member_cards (
  profile_id,
  card_number,
  qr_code_data,
  member_name,
  member_email,
  issued_at
)
SELECT 
  p.user_id,
  generate_unique_card_number(),
  jsonb_build_object(
    'type', 'member_card',
    'card_number', generate_unique_card_number(),
    'member_id', p.user_id::text,
    'issued', NOW()::text
  )::text,
  COALESCE(p.display_name, p.first_name || ' ' || p.last_name, 'Member'),
  p.email,
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.member_cards mc WHERE mc.profile_id = p.user_id
);

-- Backfill for simple members
INSERT INTO public.member_cards (
  simple_member_id,
  card_number,
  qr_code_data,
  member_name,
  member_email,
  issued_at
)
SELECT 
  sm.id,
  generate_unique_card_number(),
  jsonb_build_object(
    'type', 'member_card',
    'card_number', generate_unique_card_number(),
    'member_id', sm.id::text,
    'issued', NOW()::text
  )::text,
  sm.display_name,
  sm.email,
  NOW()
FROM public.simple_members sm
WHERE NOT EXISTS (
  SELECT 1 FROM public.member_cards mc WHERE mc.simple_member_id = sm.id
);