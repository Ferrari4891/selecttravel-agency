import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'analytics@mysmartguide.online';

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    console.log('Analytics report scheduler triggered');

    // Get report settings that are due
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentDate = now.getDate();
    const currentHour = now.getHours();

    const { data: settings, error: settingsError } = await supabase
      .from('analytics_report_settings')
      .select(`
        *,
        businesses!inner(
          id,
          business_name,
          subscription_tier,
          status
        )
      `)
      .eq('is_active', true)
      .eq('businesses.subscription_tier', 'firstclass')
      .eq('businesses.status', 'approved');

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw settingsError;
    }

    for (const setting of settings || []) {
      try {
        // Check if report should be sent based on frequency
        const shouldSend = checkIfShouldSend(setting, currentDay, currentDate, currentHour);
        
        if (!shouldSend) {
          console.log(`Skipping report for ${setting.businesses.business_name} - not due yet`);
          continue;
        }

        // Fetch analytics data
        const { data: analytics } = await supabase.rpc('get_business_analytics_summary', {
          p_business_id: setting.business_id,
          p_days: setting.frequency === 'daily' ? 1 : setting.frequency === 'weekly' ? 7 : 30
        });

        if (!analytics) {
          console.error('No analytics data found');
          continue;
        }

        // Generate HTML email
        const html = generateReportHTML(setting.businesses, analytics, setting.frequency);

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: fromEmail,
          to: [setting.recipient_email],
          subject: `${setting.frequency.charAt(0).toUpperCase() + setting.frequency.slice(1)} Analytics Report - ${setting.businesses.business_name}`,
          html,
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
          continue;
        }

        // Update last_sent_at
        await supabase
          .from('analytics_report_settings')
          .update({ last_sent_at: now.toISOString() })
          .eq('id', setting.id);

        console.log(`Sent analytics report to ${setting.recipient_email}`);
      } catch (error: any) {
        console.error(`Error processing report for ${setting.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: settings?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Analytics report error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function checkIfShouldSend(setting: any, currentDay: string, currentDate: number, currentHour: number): boolean {
  const [targetHour] = setting.send_time.split(':').map(Number);
  
  if (currentHour !== targetHour) return false;

  // Check if already sent recently
  if (setting.last_sent_at) {
    const lastSent = new Date(setting.last_sent_at);
    const hoursSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
    
    if (setting.frequency === 'daily' && hoursSinceLastSent < 23) return false;
    if (setting.frequency === 'weekly' && hoursSinceLastSent < 167) return false;
    if (setting.frequency === 'monthly' && hoursSinceLastSent < 720) return false;
  }

  if (setting.frequency === 'weekly') {
    return setting.send_day?.toLowerCase() === currentDay;
  }
  
  if (setting.frequency === 'monthly') {
    return setting.send_date === currentDate;
  }

  return true; // daily
}

function generateReportHTML(business: any, analytics: any, frequency: string): string {
  const period = frequency === 'daily' ? 'Yesterday' : frequency === 'weekly' ? 'This Week' : 'This Month';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .metric-card { background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #000; }
          .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .metric-value { font-size: 24px; font-weight: bold; color: #000; margin: 5px 0; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${business.business_name}</h1>
          <p>${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Analytics Report</p>
        </div>

        <div class="section">
          <div class="section-title">📊 Online Presence</div>
          <div class="metric-card">
            <div class="metric-label">Profile Views (${period})</div>
            <div class="metric-value">${analytics.online?.today || 0}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Profile Views</div>
            <div class="metric-value">${analytics.online?.total_views || 0}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Unique Visitors</div>
            <div class="metric-value">${analytics.online?.unique_visitors || 0}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🏪 Physical Visits</div>
          <div class="metric-card">
            <div class="metric-label">Visits (${period})</div>
            <div class="metric-value">${analytics.physical?.today || 0}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Visits</div>
            <div class="metric-value">${analytics.physical?.total_visits || 0}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Unique Members</div>
            <div class="metric-value">${analytics.physical?.unique_members || 0}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🎟️ Vouchers</div>
          <div class="metric-card">
            <div class="metric-label">Active Vouchers</div>
            <div class="metric-value">${analytics.vouchers?.active_vouchers || 0}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Redemptions</div>
            <div class="metric-value">${analytics.vouchers?.total_redemptions || 0}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">💳 Gift Cards</div>
          <div class="metric-card">
            <div class="metric-label">Active Gift Cards</div>
            <div class="metric-value">${analytics.gift_cards?.active_cards || 0}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Value</div>
            <div class="metric-value">$${analytics.gift_cards?.total_amount || 0}</div>
          </div>
        </div>

        <p style="text-align: center; color: #666; margin-top: 30px;">
          Powered by mysmartguide.online
        </p>
      </body>
    </html>
  `;
}