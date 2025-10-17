import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Upload, Save, Image as ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AIImageGeneratorProps {
  businessId: string;
}

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ businessId }) => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: 'Please upload an image file',
          variant: 'destructive'
        });
        return;
      }

      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async (type: 'generate' | 'edit') => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please enter a description for your image',
        variant: 'destructive'
      });
      return;
    }

    if (type === 'edit' && !uploadedImagePreview) {
      toast({
        title: 'Image required',
        description: 'Please upload an image to edit',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-image', {
        body: {
          type,
          prompt: prompt.trim(),
          imageUrl: type === 'edit' ? uploadedImagePreview : undefined
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: 'Success',
          description: 'Image generated successfully!'
        });
      } else {
        throw new Error('No image returned');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate image',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveImage = async () => {
    if (!generatedImage) {
      toast({
        title: 'No image to save',
        description: 'Please generate an image first',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert base64 to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      
      // Create file from blob
      const fileName = `ai-generated-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Upload to business-media bucket
      const { error: uploadError } = await supabase.storage
        .from('business-media')
        .upload(`${businessId}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-media')
        .getPublicUrl(`${businessId}/${fileName}`);

      toast({
        title: 'Image saved',
        description: 'Your AI-generated image has been saved to your business media'
      });

      // Reset form
      setGeneratedImage('');
      setPrompt('');
      setUploadedImage(null);
      setUploadedImagePreview('');

    } catch (error: any) {
      console.error('Error saving image:', error);
      toast({
        title: 'Save failed',
        description: error.message || 'Failed to save image',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Image Generator
        </CardTitle>
        <CardDescription>
          Generate or edit images with AI (16:9 aspect ratio)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate New</TabsTrigger>
            <TabsTrigger value="edit">Edit Image</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="generate-prompt">Image Description</Label>
              <Textarea
                id="generate-prompt"
                placeholder="Describe the image you want to generate (e.g., 'A modern restaurant interior with warm lighting')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={() => generateImage('generate')} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="upload-image">Upload Image</Label>
              <Input
                id="upload-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadedImagePreview && (
                <div className="mt-2">
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prompt">Editing Instructions</Label>
              <Textarea
                id="edit-prompt"
                placeholder="Describe how you want to modify the image (e.g., 'Add more lighting', 'Change background to outdoor setting')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={() => generateImage('edit')} 
              disabled={isGenerating || !prompt.trim() || !uploadedImagePreview}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Edit Image
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {generatedImage && (
          <div className="space-y-4 mt-6 p-4 border rounded-lg bg-muted/20">
            <Label>Generated Image (16:9)</Label>
            <AspectRatio ratio={16 / 9}>
              <img
                src={generatedImage}
                alt="AI generated"
                className="w-full h-full object-cover rounded-lg"
              />
            </AspectRatio>
            <Button 
              onClick={saveImage} 
              disabled={isSaving}
              className="w-full"
              variant="default"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Business Media
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};