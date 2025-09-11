import { supabase } from '@/integrations/supabase/client';

export type MediaType = 'carousel' | 'image' | 'youtube';

export interface BusinessMediaImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface BusinessMedia {
  id: string;
  business_id: string;
  media_type: MediaType;
  images?: any; // jsonb in database
  youtube_url?: string;
  youtube_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Extract YouTube ID from URL
 */
export const extractYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.split("/")[1] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
    }
    return null;
  } catch { 
    return null; 
  }
};

/**
 * Validate YouTube ID format
 */
export const isValidYouTubeId = (id: string): boolean => {
  return /^[A-Za-z0-9_-]{6,20}$/.test(id);
};

/**
 * Upload and process image
 */
export async function uploadAndProcessImage(file: File, businessId: string): Promise<string> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Accepted: JPG, PNG, WEBP, GIF, HEIC');
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB');
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "");
  const fileName = `${timestamp}-${sanitizedName}`;
  const objectName = `${businessId}/original/${fileName}`;

  console.log('Uploading image:', { fileName, objectName, size: file.size });

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('business-media')
    .upload(objectName, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  console.log('Image uploaded successfully, calling processing function...');

  // Call Edge Function to process image (create derivatives)
  try {
    const response = await supabase.functions.invoke('process-image-16x9', {
      body: { 
        businessId, 
        objectName,
        derivatives: ["1920x1080", "1280x720", "640x360"]
      }
    });

    if (response.error) {
      console.error('Processing function error:', response.error);
      throw new Error(`Image processing failed: ${response.error.message}`);
    }

    console.log('Image processing completed:', response.data);
  } catch (error) {
    console.error('Edge function call failed:', error);
    // Don't throw here - we can still use the original image
    console.warn('Continuing with original image due to processing failure');
  }

  return objectName;
}

/**
 * Get signed URL for an image
 */
export async function getSignedImageUrl(path: string, expiresIn: number = 43200): Promise<string> {
  const { data, error } = await supabase.storage
    .from('business-media')
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Error creating signed URL:', error);
    throw new Error(`Failed to get image URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Get business media
 */
export async function getBusinessMedia(businessId: string): Promise<BusinessMedia | null> {
  const { data, error } = await supabase
    .from('business_media')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching business media:', error);
    throw new Error(`Failed to fetch media: ${error.message}`);
  }

  return data as BusinessMedia;
}

/**
 * Save business media
 */
export async function saveBusinessMedia(mediaData: {
  business_id: string;
  media_type: MediaType;
  images?: any;
  youtube_url?: string;
  youtube_id?: string;
}): Promise<BusinessMedia> {
  const { data, error } = await supabase
    .from('business_media')
    .upsert(mediaData, {
      onConflict: 'business_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving business media:', error);
    throw new Error(`Failed to save media: ${error.message}`);
  }

  return data as BusinessMedia;
}

/**
 * Delete business media and associated files
 */
export async function deleteBusinessMedia(businessId: string): Promise<void> {
  // Delete database record
  const { error: dbError } = await supabase
    .from('business_media')
    .delete()
    .eq('business_id', businessId);

  if (dbError) {
    console.error('Error deleting business media record:', dbError);
    throw new Error(`Failed to delete media record: ${dbError.message}`);
  }

  // Delete storage files
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('business-media')
      .list(businessId, {
        limit: 1000,
        offset: 0
      });

    if (listError) {
      console.warn('Error listing files for deletion:', listError);
      return;
    }

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${businessId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('business-media')
        .remove(filePaths);

      if (deleteError) {
        console.warn('Error deleting storage files:', deleteError);
      }
    }
  } catch (error) {
    console.warn('Error during file cleanup:', error);
  }
}