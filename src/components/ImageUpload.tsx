import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Download, Eye } from 'lucide-react';

interface UploadedImage {
  name: string;
  url: string;
  publicUrl: string;
  size: number;
  lastModified: string;
}

export const ImageUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing images
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('heroimages')
        .list('', {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      const imagePromises = data.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from('heroimages')
          .getPublicUrl(file.name);

        return {
          name: file.name,
          url: urlData.publicUrl,
          publicUrl: urlData.publicUrl,
          size: file.metadata?.size || 0,
          lastModified: file.updated_at || file.created_at || '',
        };
      });

      const imageList = await Promise.all(imagePromises);
      setImages(imageList);
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Error loading images",
        description: "Failed to load existing images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const { error: uploadError } = await supabase.storage
        .from('heroimages')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Success!",
        description: "Image uploaded successfully",
      });

      // Reload images
      loadImages();
      
      // Clear the input
      event.target.value = '';
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageName: string) => {
    try {
      const { error } = await supabase.storage
        .from('heroimages')
        .remove([imageName]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Image deleted successfully",
      });

      // Reload images
      loadImages();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadImage = async (imageName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('heroimages')
        .download(imageName);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageName;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Image downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload & Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div className="space-y-2">
            <label htmlFor="image-upload" className="text-sm font-medium">
              Upload Image (Max 5MB)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
                className="flex-1"
              />
              <Button disabled={uploading} variant="outline">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          {/* Images Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Stored Images ({images.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">Loading images...</div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No images uploaded yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card key={image.name} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={image.publicUrl}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="text-sm font-medium truncate">
                        {image.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Size: {formatFileSize(image.size)}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(image.publicUrl, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadImage(image.name)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteImage(image.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Usage Instructions */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">How to use uploaded images in your app:</h4>
            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`// Get public URL for an image
const { data } = supabase.storage
  .from('heroimages')
  .getPublicUrl('your-image.jpg');

// Use in component
<img src={data.publicUrl} alt="Your image" />`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};