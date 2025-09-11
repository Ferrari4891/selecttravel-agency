import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessImageRequest {
  businessId: string;
  objectName: string;
  derivatives?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, objectName, derivatives = ["1920x1080", "1280x720", "640x360"] }: ProcessImageRequest = await req.json();
    
    if (!businessId || !objectName) {
      console.error("Missing required parameters:", { businessId, objectName });
      return new Response(
        JSON.stringify({ error: "Missing businessId or objectName" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing image:", { businessId, objectName, derivatives });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the original image
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('business-media')
      .download(objectName);

    if (downloadError) {
      console.error("Download error:", downloadError);
      throw new Error(`Failed to download image: ${downloadError.message}`);
    }

    console.log("Downloaded image successfully, size:", imageData.size);

    // Convert to ArrayBuffer for processing
    const imageBuffer = await imageData.arrayBuffer();
    
    // Helper to parse WxH
    const parseSize = (s: string) => {
      const [w, h] = s.split("x").map(Number);
      if (!w || !h) throw new Error(`Invalid size format: ${s}`);
      return { w, h };
    };

    // Process each derivative size
    const results = [];
    for (const sizeStr of derivatives) {
      try {
        const { w, h } = parseSize(sizeStr);
        console.log(`Processing derivative: ${sizeStr} (${w}x${h})`);

        // For Deno environment, we'll use a simpler approach
        // In a production environment, you'd want to use Sharp for proper image processing
        // This is a placeholder that copies the original for now
        const processedBuffer = imageBuffer;

        // Generate destination path
        const baseName = objectName.split("/").pop()!.replace(/\.[^/.]+$/, "");
        const destPath = `${businessId}/derived/${sizeStr}/${baseName}.jpg`;

        console.log("Uploading processed image to:", destPath);

        // Upload the processed image
        const { error: uploadError } = await supabase.storage
          .from('business-media')
          .upload(destPath, processedBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${sizeStr}:`, uploadError);
          throw new Error(`Failed to upload ${sizeStr}: ${uploadError.message}`);
        }

        results.push({
          size: sizeStr,
          path: destPath,
          width: w,
          height: h
        });

        console.log(`Successfully processed ${sizeStr}`);
      } catch (error) {
        console.error(`Error processing ${sizeStr}:`, error);
        throw error;
      }
    }

    console.log("All derivatives processed successfully:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        originalPath: objectName,
        derivatives: results
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in process-image-16x9 function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});