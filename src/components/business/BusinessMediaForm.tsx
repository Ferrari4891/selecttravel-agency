import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Youtube, Loader2, X, Plus } from 'lucide-react';
import {
  MediaType,
  BusinessMedia,
  BusinessMediaImage,
  extractYouTubeId,
  isValidYouTubeId,
  uploadAndProcessImage,
  getBusinessMedia,
  saveBusinessMedia,
  deleteBusinessMedia,
  getSignedImageUrl
} from '@/lib/businessMedia';

interface BusinessMediaFormProps {
  businessId: string;
  onSave?: (media: BusinessMedia) => void;
}

interface ImageUpload {
  file?: File;
  preview?: string;
  alt: string;
  uploaded?: boolean;
  path?: string;
}

export function BusinessMediaForm({ businessId, onSave }: BusinessMediaFormProps) {
  const [mediaType, setMediaType] = useState<MediaType>('carousel');
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingMedia, setExistingMedia] = useState<BusinessMedia | null>(null);

  // Initialize form with existing data
  useEffect(() => {
    loadExistingMedia();
  }, [businessId]);

  const loadExistingMedia = async () => {
    try {
      setLoading(true);
      const media = await getBusinessMedia(businessId);
      
      if (media) {
        setExistingMedia(media);
        setMediaType(media.media_type);
        
        if (media.media_type === 'youtube') {
          setYoutubeUrl(media.youtube_url || '');
        } else if (media.images && Array.isArray(media.images)) {
          // Load existing images with signed URLs
          const imagePromises = media.images.map(async (img: BusinessMediaImage) => {
            try {
              const signedUrl = await getSignedImageUrl(img.url);
              return {
                preview: signedUrl,
                alt: img.alt,
                uploaded: true,
                path: img.url
              };
            } catch (error) {
              console.error('Error loading image:', error);
              return {
                preview: '',
                alt: img.alt,
                uploaded: true,
                path: img.url
              };
            }
          });
          
          const loadedImages = await Promise.all(imagePromises);
          setImages(loadedImages);
        }
      } else {
        // Initialize empty state based on media type
        initializeImages();
      }
    } catch (error) {
      console.error('Error loading existing media:', error);
      toast({
        title: "Error",
        description: "Failed to load existing media",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeImages = () => {
    if (mediaType === 'carousel') {
      setImages(Array(3).fill(null).map(() => ({ alt: '', uploaded: false })));
    } else if (mediaType === 'image') {
      setImages([{ alt: '', uploaded: false }]);
    } else {
      setImages([]);
    }
  };

  // Reset form when media type changes
  useEffect(() => {
    if (!existingMedia || existingMedia.media_type !== mediaType) {
      initializeImages();
      setYoutubeUrl('');
    }
  }, [mediaType]);

  const handleImageUpload = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      file,
      preview,
      uploaded: false
    };
    setImages(newImages);
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...images];
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview!);
    }
    newImages[index] = { alt: '', uploaded: false };
    setImages(newImages);
  };

  const handleAltTextChange = (index: number, alt: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt };
    setImages(newImages);
  };

  const validateYouTubeUrl = (url: string) => {
    if (!url) return false;
    const id = extractYouTubeId(url);
    return id && isValidYouTubeId(id);
  };

  const validateForm = () => {
    if (mediaType === 'youtube') {
      if (!youtubeUrl || !validateYouTubeUrl(youtubeUrl)) {
        toast({
          title: "Invalid YouTube URL",
          description: "Please enter a valid YouTube URL",
          variant: "destructive"
        });
        return false;
      }
    } else {
      const requiredCount = mediaType === 'carousel' ? 3 : 1;
      const validImages = images.filter(img => 
        (img.file || img.uploaded) && img.alt.trim()
      );
      
      if (validImages.length !== requiredCount) {
        toast({
          title: "Missing images or alt text",
          description: `Please provide ${requiredCount} image(s) with alt text`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      let mediaData: any = {
        business_id: businessId,
        media_type: mediaType
      };

      if (mediaType === 'youtube') {
        const youtubeId = extractYouTubeId(youtubeUrl);
        mediaData.youtube_url = youtubeUrl;
        mediaData.youtube_id = youtubeId;
        mediaData.images = null;
      } else {
        // Upload new images and prepare data
        const imagePromises = images.map(async (img, index) => {
          if (img.file) {
            // Upload new image
            const path = await uploadAndProcessImage(img.file, businessId);
            
            // For now, we'll use the original path and dimensions
            // In production, you'd get the actual dimensions from the processed image
            return {
              url: path,
              alt: img.alt,
              width: 1920,
              height: 1080
            };
          } else if (img.uploaded && img.path) {
            // Keep existing image
            return {
              url: img.path,
              alt: img.alt,
              width: 1920,
              height: 1080
            };
          }
          return null;
        });

        const processedImages = (await Promise.all(imagePromises)).filter(Boolean);
        mediaData.images = processedImages;
        mediaData.youtube_url = null;
        mediaData.youtube_id = null;
      }

      const savedMedia = await saveBusinessMedia(mediaData);
      
      toast({
        title: "Success",
        description: "Business media saved successfully",
      });

      setExistingMedia(savedMedia);
      onSave?.(savedMedia);
      
    } catch (error) {
      console.error('Error saving media:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save media",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingMedia) return;

    if (!confirm('Are you sure you want to delete all business media? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      await deleteBusinessMedia(businessId);
      
      toast({
        title: "Success",
        description: "Business media deleted successfully",
      });

      setExistingMedia(null);
      setImages([]);
      setYoutubeUrl('');
      initializeImages();
      
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete media",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading media...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Media</CardTitle>
        <CardDescription>
          Choose how to showcase your business with images or video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Media Type Selection */}
        <div>
          <Label className="text-base font-medium">Media Type</Label>
          <RadioGroup 
            value={mediaType} 
            onValueChange={(value) => setMediaType(value as MediaType)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="carousel" id="carousel" />
              <Label htmlFor="carousel" className="cursor-pointer">
                3-image carousel (auto-play 2s)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="image" id="image" />
              <Label htmlFor="image" className="cursor-pointer">
                Single image
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="youtube" id="youtube" />
              <Label htmlFor="youtube" className="cursor-pointer">
                YouTube video
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Image Upload Section */}
        {(mediaType === 'carousel' || mediaType === 'image') && (
          <div>
            <Label className="text-base font-medium">
              {mediaType === 'carousel' ? 'Images (3 required)' : 'Image (1 required)'}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Accepted formats: JPG, PNG, WEBP, GIF, HEIC. Max 10MB each.
              All images will be resized/cropped to 16:9 automatically.
            </p>
            
            <div className="grid gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="border border-dashed border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">
                      Image {index + 1} {mediaType === 'carousel' && '(Required)'}
                    </Label>
                    {image.preview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImageRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {image.preview ? (
                    <div className="space-y-3">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover border"
                      />
                      <div>
                        <Label htmlFor={`alt-${index}`}>Alt text (required)</Label>
                        <Input
                          id={`alt-${index}`}
                          value={image.alt}
                          onChange={(e) => handleAltTextChange(index, e.target.value)}
                          placeholder="Describe the image for accessibility"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-border p-8 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                        }}
                        className="hidden"
                        id={`upload-${index}`}
                      />
                      <Label htmlFor={`upload-${index}`} className="cursor-pointer">
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload image
                          </span>
                        </div>
                      </Label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YouTube URL Section */}
        {mediaType === 'youtube' && (
          <div>
            <Label htmlFor="youtube-url" className="text-base font-medium">
              YouTube URL
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Paste a YouTube video URL (supports youtube.com/watch, youtu.be, and youtube.com/shorts)
            </p>
            <Input
              id="youtube-url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-2"
            />
            
            {youtubeUrl && validateYouTubeUrl(youtubeUrl) && (
              <div className="mt-4">
                <Label>Preview</Label>
                <div className="mt-2 aspect-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(youtubeUrl)}`}
                    title="YouTube video preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Media'
            )}
          </Button>
          
          {existingMedia && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={saving}
            >
              Delete All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
