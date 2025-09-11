import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { BusinessMedia, BusinessMediaImage, getSignedImageUrl } from '@/lib/businessMedia';

interface BusinessMediaPreviewProps {
  media: BusinessMedia | null;
  loading?: boolean;
}

export function BusinessMediaPreview({ media, loading }: BusinessMediaPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Load signed URLs for images
  useEffect(() => {
    if (media && media.images && Array.isArray(media.images) && media.images.length > 0) {
      loadImageUrls();
    } else {
      setImageUrls([]);
    }
  }, [media]);

  const loadImageUrls = async () => {
    if (!media?.images) return;
    
    setLoadingImages(true);
    try {
      const urls = await Promise.all(
        (media.images as BusinessMediaImage[]).map(async (img) => {
          try {
            return await getSignedImageUrl(img.url);
          } catch (error) {
            console.error('Error loading image URL:', error);
            return '';
          }
        })
      );
      setImageUrls(urls.filter(Boolean));
    } catch (error) {
      console.error('Error loading image URLs:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Auto-play carousel
  useEffect(() => {
    if (media?.media_type === 'carousel' && isPlaying && imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [media?.media_type, isPlaying, imageUrls.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (media?.media_type === 'carousel' && imageUrls.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
        } else if (e.key === ' ') {
          e.preventDefault();
          setIsPlaying(prev => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [media?.media_type, imageUrls.length]);

  if (loading || loadingImages) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading media preview...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!media) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Media Preview</CardTitle>
          <CardDescription>No media configured yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Upload images or add a YouTube video to see your business media here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCarousel = () => {
    if (imageUrls.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-muted">
          <p className="text-muted-foreground">Images not available</p>
        </div>
      );
    }

    return (
      <div 
        className="relative aspect-video bg-black overflow-hidden group"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        <img
          src={imageUrls[currentImageIndex]}
          alt={(media.images as BusinessMediaImage[])?.[currentImageIndex]?.alt || `Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Controls */}
        {imageUrls.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            {/* Dots indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {imageUrls.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 bg-white transition-opacity ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSingleImage = () => {
    if (imageUrls.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-muted">
          <p className="text-muted-foreground">Image not available</p>
        </div>
      );
    }

    return (
      <div className="aspect-video bg-black overflow-hidden">
        <img
          src={imageUrls[0]}
          alt={(media.images as BusinessMediaImage[])?.[0]?.alt || 'Business image'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const renderYouTube = () => {
    if (!media.youtube_id) {
      return (
        <div className="flex items-center justify-center h-64 bg-muted">
          <p className="text-muted-foreground">YouTube video not available</p>
        </div>
      );
    }

    return (
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${media.youtube_id}`}
          title="Business video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Preview</CardTitle>
        <CardDescription>
          {media.media_type === 'carousel' && 'Image carousel (auto-play 2s, hover to pause)'}
          {media.media_type === 'image' && 'Business image'}
          {media.media_type === 'youtube' && 'YouTube video'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {media.media_type === 'carousel' && renderCarousel()}
        {media.media_type === 'image' && renderSingleImage()}
        {media.media_type === 'youtube' && renderYouTube()}
        
        {media.media_type === 'carousel' && imageUrls.length > 1 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Use arrow keys or click buttons to navigate. Press space to play/pause.
          </p>
        )}
      </CardContent>
    </Card>
  );
}