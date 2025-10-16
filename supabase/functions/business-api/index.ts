import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract API key from header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required. Include x-api-key header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash and validate API key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*, businesses!inner(id, business_name, subscription_tier, status)')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (keyError || !apiKeyData) {
      console.error('Invalid API key:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check subscription tier
    if (apiKeyData.businesses.subscription_tier !== 'firstclass') {
      return new Response(
        JSON.stringify({ error: 'API access requires First Class subscription' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const now = Date.now();
    const rateLimitKey = keyHash;
    const rateLimitEntry = rateLimitMap.get(rateLimitKey);
    
    if (rateLimitEntry && rateLimitEntry.resetAt > now) {
      if (rateLimitEntry.count >= apiKeyData.rate_limit_per_minute) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': apiKeyData.rate_limit_per_minute.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitEntry.resetAt.toString(),
            } 
          }
        );
      }
      rateLimitEntry.count++;
    } else {
      rateLimitMap.set(rateLimitKey, { count: 1, resetAt: now + 60000 });
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    const businessId = apiKeyData.businesses.id;
    const url = new URL(req.url);
    const path = url.pathname.replace('/business-api', '');
    const method = req.method;

    // Route requests
    if (path === '/business' && method === 'GET') {
      // Get business profile
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/analytics' && method === 'GET') {
      // Get analytics summary
      const days = parseInt(url.searchParams.get('days') || '30');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [viewsData, visitsData, vouchersData, giftCardsData] = await Promise.all([
        supabase.from('business_views')
          .select('*')
          .eq('business_id', businessId)
          .gte('viewed_at', startDate.toISOString()),
        
        supabase.from('member_visits')
          .select('*')
          .eq('business_id', businessId)
          .gte('visit_date', startDate.toISOString()),
        
        supabase.from('business_vouchers')
          .select('*')
          .eq('business_id', businessId),
        
        supabase.from('gift_cards')
          .select('*')
          .eq('business_id', businessId),
      ]);

      const analytics = {
        online_views: {
          total: viewsData.data?.length || 0,
          unique_visitors: new Set(viewsData.data?.map(v => v.visitor_ip)).size,
        },
        physical_visits: {
          total: visitsData.data?.length || 0,
          unique_members: new Set(visitsData.data?.map(v => v.card_id)).size,
        },
        vouchers: {
          active: vouchersData.data?.filter(v => v.is_active && new Date(v.end_date) > new Date()).length || 0,
          total_redemptions: vouchersData.data?.reduce((sum, v) => sum + (v.current_uses || 0), 0) || 0,
        },
        gift_cards: {
          active: giftCardsData.data?.filter(g => g.status === 'active').length || 0,
          total_value: giftCardsData.data?.filter(g => g.status === 'active')
            .reduce((sum, g) => sum + parseFloat(g.amount), 0) || 0,
        },
      };

      return new Response(JSON.stringify(analytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/vouchers' && method === 'GET') {
      // Get all vouchers
      const { data, error } = await supabase
        .from('business_vouchers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/vouchers' && method === 'POST') {
      // Create voucher
      const body = await req.json();
      const { data, error } = await supabase
        .from('business_vouchers')
        .insert([{ ...body, business_id: businessId }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.startsWith('/vouchers/') && method === 'PATCH') {
      // Update voucher
      const voucherId = path.split('/')[2];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('business_vouchers')
        .update(body)
        .eq('id', voucherId)
        .eq('business_id', businessId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/gift-cards' && method === 'GET') {
      // Get all gift cards
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
