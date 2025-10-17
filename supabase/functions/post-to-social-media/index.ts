import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voucher_id, business_id } = await req.json();

    if (!voucher_id || !business_id) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing social media post for voucher: ${voucher_id}`);

    // Check if auto-posting is enabled
    const { data: settings } = await supabase
      .from('social_media_auto_post_settings')
      .select('*')
      .eq('business_id', business_id)
      .eq('auto_post_enabled', true)
      .single();

    if (!settings || settings.platforms.length === 0) {
      console.log('Auto-posting not enabled or no platforms configured');
      return new Response(
        JSON.stringify({ success: false, message: 'Auto-posting not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get voucher details
    const { data: voucher } = await supabase
      .from('business_vouchers')
      .select('*, businesses(business_name, website)')
      .eq('id', voucher_id)
      .single();

    if (!voucher) {
      throw new Error('Voucher not found');
    }

    // Get active social media connections
    const { data: connections } = await supabase
      .from('social_media_connections')
      .select('*')
      .eq('business_id', business_id)
      .eq('is_active', true)
      .in('platform', settings.platforms);

    if (!connections || connections.length === 0) {
      console.log('No active social media connections found');
      return new Response(
        JSON.stringify({ success: false, message: 'No active connections' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate post content
    const postContent = generatePostContent(voucher, settings, voucher.businesses);

    // Post to each platform
    for (const connection of connections) {
      try {
        let postId = null;
        let status = 'success';
        let errorMessage = null;

        if (connection.platform === 'facebook' || connection.platform === 'instagram') {
          const result = await postToMeta(connection, postContent, connection.platform);
          postId = result.id;
        }

        // Log the post
        await supabase.from('social_media_posts').insert({
          business_id,
          voucher_id,
          platform: connection.platform,
          post_id: postId,
          post_content: postContent,
          status,
          error_message: errorMessage,
        });

        console.log(`Posted to ${connection.platform}: ${postId}`);
      } catch (error: any) {
        console.error(`Error posting to ${connection.platform}:`, error);
        
        // Log the failure
        await supabase.from('social_media_posts').insert({
          business_id,
          voucher_id,
          platform: connection.platform,
          post_content: postContent,
          status: 'failed',
          error_message: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, posted_count: connections.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Social media post error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePostContent(voucher: any, settings: any, business: any): string {
  let content = settings.post_template;

  // Replace template variables
  content = content.replace('{voucher_title}', voucher.title);
  content = content.replace('{discount}', `${voucher.discount_value}${voucher.voucher_type === 'percentage' ? '%' : '$'} OFF`);
  content = content.replace('{expiry}', new Date(voucher.end_date).toLocaleDateString());
  content = content.replace('{business_name}', business.business_name);

  if (settings.include_voucher_code && voucher.voucher_code) {
    content += `\n\nUse code: ${voucher.voucher_code}`;
  }

  if (settings.include_business_link && business.website) {
    content += `\n\nVisit us: ${business.website}`;
  }

  return content;
}

async function postToMeta(connection: any, message: string, platform: string): Promise<any> {
  const endpoint = platform === 'facebook' 
    ? `https://graph.facebook.com/v18.0/${connection.account_id}/feed`
    : `https://graph.facebook.com/v18.0/${connection.account_id}/media`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      access_token: connection.access_token,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to post to Meta');
  }

  return await response.json();
}