import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationEmailRequest {
  invitationId: string;
  groupName: string;
  restaurantName: string;
  restaurantAddress: string;
  city: string;
  country: string;
  proposedDate: string;
  rsvpDeadline: string;
  customMessage: string;
  inviteToken: string;
  creatorEmail: string;
  recipientEmails: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      groupName,
      restaurantName,
      restaurantAddress,
      city,
      country,
      proposedDate,
      rsvpDeadline,
      customMessage,
      inviteToken,
      creatorEmail,
      recipientEmails,
    }: SendInvitationEmailRequest = await req.json();

    const rsvpUrl = `${Deno.env.get("SUPABASE_URL")?.replace("https://urczlhjnztiaxdsatueu.supabase.co", "https://1ed2fa2c-3af1-45b5-9d04-0c04fc523b24.lovableproject.com")}/rsvp/${inviteToken}`;
    
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Send individual emails to each recipient
    const emailPromises = recipientEmails.map(async (email) => {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're Invited: ${groupName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e1e5e9; border-top: none; }
            .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
            .detail-label { font-weight: bold; color: #495057; }
            .detail-value { color: #6c757d; }
            @media (max-width: 600px) { .detail-row { flex-direction: column; } .detail-label, .detail-value { margin: 2px 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <h2>${groupName}</h2>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            
            <p>You've been invited to join <strong>${groupName}</strong> by ${creatorEmail}.</p>
            
            ${customMessage ? `<blockquote style="border-left: 4px solid #667eea; padding-left: 20px; margin: 20px 0; font-style: italic; color: #6c757d;">"${customMessage}"</blockquote>` : ''}
            
            <div class="event-details">
              <h3>📍 Event Details</h3>
              <div class="detail-row">
                <span class="detail-label">Restaurant:</span>
                <span class="detail-value">${restaurantName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${restaurantAddress}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${city}, ${country}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${formatDate(proposedDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">RSVP by:</span>
                <span class="detail-value">${formatDate(rsvpDeadline)}</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${rsvpUrl}" class="cta-button">RSVP NOW</a>
            </div>
            
            <p><strong>Can't make it?</strong> No worries! Just click the link above to let the organizer know.</p>
            
            <p>If you're not already a member, you can sign up for free to save your favorite places and manage your RSVPs easily.</p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              This invitation was sent through Smart Guide Books<br>
              <a href="${rsvpUrl}" style="color: #667eea;">Click here if the button above doesn't work</a>
            </p>
          </div>
        </body>
        </html>
      `;

      return resend.emails.send({
        from: "Smart Guide Books <invitations@resend.dev>",
        to: [email],
        subject: `🎉 You're invited: ${groupName}`,
        html: emailHtml,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Email sending results: ${successful} successful, ${failed} failed`);

    if (failed > 0) {
      console.error('Some emails failed to send:', results.filter(r => r.status === 'rejected'));
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successful, 
      failed: failed,
      message: `Successfully sent ${successful} invitations${failed > 0 ? `, ${failed} failed` : ''}`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-emails function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);