import { supabase } from '@/integrations/supabase/client';

/**
 * Upload an image to Supabase Storage
 */
export const uploadImage = async (file: File, fileName?: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const finalFileName = fileName || `${Math.random().toString(36).substring(2)}.${fileExt}`;

  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }

  const { error } = await supabase.storage
    .from('heroimages')
    .upload(finalFileName, file);

  if (error) throw error;

  return finalFileName;
};

/**
 * Get public URL for an image in Supabase Storage
 */
export const getImageUrl = (fileName: string): string => {
  const { data } = supabase.storage
    .from('heroimages')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

/**
 * Delete an image from Supabase Storage
 */
export const deleteImage = async (fileName: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('heroimages')
    .remove([fileName]);

  if (error) throw error;
};

/**
 * List all images in the bucket
 */
export const listImages = async (): Promise<any[]> => {
  const { data, error } = await supabase.storage
    .from('heroimages')
    .list('', {
      limit: 100,
      offset: 0,
    });

  if (error) throw error;
  return data || [];
};

/**
 * Download an image from Supabase Storage
 */
export const downloadImage = async (fileName: string): Promise<Blob> => {
  const { data, error } = await supabase.storage
    .from('heroimages')
    .download(fileName);

  if (error) throw error;
  return data;
};