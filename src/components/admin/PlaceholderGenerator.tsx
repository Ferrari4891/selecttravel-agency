import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Database } from 'lucide-react';

export const PlaceholderGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      toast({
        title: "Generating Placeholders",
        description: "This may take a few minutes...",
      });

      const { data, error } = await supabase.functions.invoke('generate-placeholders');

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Created ${data.totalCreated} placeholder businesses across all cities`,
      });

    } catch (error: any) {
      console.error('Error generating placeholders:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate placeholder businesses",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Placeholder Business Generator
        </CardTitle>
        <CardDescription>
          Generate 10 BOUNCE BEACH placeholder entries per city across all locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-semibold">What will be created:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>10 entries per city (800+ total businesses)</li>
            <li>All named "BOUNCE BEACH"</li>
            <li>Categories: EAT and DRINK only</li>
            <li>Tiers: 3 First Class, 3 Premium, 4 Basic</li>
            <li>Status: All approved</li>
            <li>Coverage: All countries and cities in the system</li>
          </ul>
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating... This may take several minutes
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Generate All Placeholders
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
