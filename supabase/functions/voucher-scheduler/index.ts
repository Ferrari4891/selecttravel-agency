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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Voucher scheduler triggered');

    // Get schedules that are due to run
    const now = new Date();
    const { data: schedules, error: schedError } = await supabase
      .from('voucher_schedules')
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
      .eq('businesses.status', 'approved')
      .lte('next_trigger_at', now.toISOString());

    if (schedError) {
      console.error('Error fetching schedules:', schedError);
      throw schedError;
    }

    console.log(`Found ${schedules?.length || 0} schedules to process`);

    for (const schedule of schedules || []) {
      console.log(`Processing schedule: ${schedule.schedule_name} (${schedule.id})`);

      try {
        // Create voucher from template
        const template = schedule.voucher_template;
        const { data: voucher, error: voucherError } = await supabase
          .from('business_vouchers')
          .insert({
            business_id: schedule.business_id,
            title: template.title,
            description: template.description,
            voucher_type: template.voucher_type,
            discount_value: template.discount_value,
            min_purchase_amount: template.min_purchase_amount || 0,
            max_uses: template.max_uses,
            start_date: now.toISOString(),
            end_date: template.end_date || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (voucherError) {
          console.error('Error creating voucher:', voucherError);
          // Log failure
          await supabase.from('scheduled_voucher_logs').insert({
            schedule_id: schedule.id,
            status: 'failed',
            error_message: voucherError.message,
          });
          continue;
        }

        console.log(`Created voucher: ${voucher.id}`);

        // Log success
        await supabase.from('scheduled_voucher_logs').insert({
          schedule_id: schedule.id,
          voucher_id: voucher.id,
          status: 'success',
        });

        // Calculate next trigger time
        const nextTrigger = calculateNextTrigger(
          schedule.recurrence_pattern,
          schedule.recurrence_details
        );

        // Update schedule
        await supabase
          .from('voucher_schedules')
          .update({
            last_triggered_at: now.toISOString(),
            next_trigger_at: nextTrigger.toISOString(),
          })
          .eq('id', schedule.id);

        console.log(`Updated schedule next trigger to: ${nextTrigger.toISOString()}`);
      } catch (error: any) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
        await supabase.from('scheduled_voucher_logs').insert({
          schedule_id: schedule.id,
          status: 'failed',
          error_message: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: schedules?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Voucher scheduler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateNextTrigger(pattern: string, details: any): Date {
  const now = new Date();
  
  switch (pattern) {
    case 'daily':
      const dailyNext = new Date(now);
      dailyNext.setDate(dailyNext.getDate() + 1);
      if (details.time) {
        const [hours, minutes] = details.time.split(':');
        dailyNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      return dailyNext;

    case 'weekly':
      const weeklyNext = new Date(now);
      weeklyNext.setDate(weeklyNext.getDate() + 7);
      if (details.time) {
        const [hours, minutes] = details.time.split(':');
        weeklyNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      return weeklyNext;

    case 'monthly':
      const monthlyNext = new Date(now);
      monthlyNext.setMonth(monthlyNext.getMonth() + 1);
      if (details.day_of_month) {
        monthlyNext.setDate(details.day_of_month);
      }
      if (details.time) {
        const [hours, minutes] = details.time.split(':');
        monthlyNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      return monthlyNext;

    default:
      const defaultNext = new Date(now);
      defaultNext.setDate(defaultNext.getDate() + 1);
      return defaultNext;
  }
}