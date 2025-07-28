-- Create collections table for organizing saved businesses
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Create policies for collections
CREATE POLICY "Users can view their own collections" 
ON public.collections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections" 
ON public.collections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
ON public.collections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
ON public.collections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Public collections are viewable by everyone
CREATE POLICY "Public collections are viewable by everyone" 
ON public.collections 
FOR SELECT 
USING (is_public = true);

-- Add collection_id to saved_restaurants table
ALTER TABLE public.saved_restaurants 
ADD COLUMN collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL;

-- Create trigger for automatic timestamp updates on collections
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create sharing tokens table for public sharing links
CREATE TABLE public.collection_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sharing table
ALTER TABLE public.collection_shares ENABLE ROW LEVEL SECURITY;

-- Policies for sharing
CREATE POLICY "Users can manage shares for their collections" 
ON public.collection_shares 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.collections 
  WHERE collections.id = collection_shares.collection_id 
  AND collections.user_id = auth.uid()
));

-- Anyone can view shared collections via token
CREATE POLICY "Anyone can view shared collections" 
ON public.collection_shares 
FOR SELECT 
USING (expires_at IS NULL OR expires_at > now());