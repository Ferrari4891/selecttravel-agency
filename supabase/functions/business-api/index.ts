import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required. Include X-API-Key header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify API key and get business
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, business_id, is_active, rate_limit_per_minute, businesses(id, business_name, subscription_tier)')
      .eq('key_hash', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if business is First Class
    if (keyData.businesses.subscription_tier !== 'firstclass') {
      return new Response(
        JSON.stringify({ error: 'API access requires First Class subscription' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const now = Date.now();
    const rateLimitKey = keyData.id;
    const rateLimit = rateLimitMap.get(rateLimitKey);
    
    if (rateLimit && now < rateLimit.resetTime) {
      if (rateLimit.count >= keyData.rate_limit_per_minute) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      rateLimit.count++;
    } else {
      rateLimitMap.set(rateLimitKey, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    const url = new URL(req.url);
    const path = url.pathname.replace('/business-api', '');
    const businessId = keyData.business_id;

    // Route handlers
    if (path === '/business' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/analytics' && req.method === 'GET') {
      const days = parseInt(url.searchParams.get('days') || '30');
      
      const { data, error } = await supabase.rpc('get_business_analytics_summary', {
        p_business_id: businessId,
        p_days: days
      });

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/vouchers' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('business_vouchers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/vouchers' && req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('business_vouchers')
        .insert({
          business_id: businessId,
          ...body
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/gift-cards' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/visits' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('member_visits')
        .select('*, member_cards(card_number, member_name, member_email)')
        .eq('business_id', businessId)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});