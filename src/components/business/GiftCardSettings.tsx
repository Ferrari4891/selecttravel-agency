import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GiftCardSettingsProps {
  businessId: string;
  giftCardsEnabled: boolean;
  subscriptionTier: string;
  onToggle: (enabled: boolean) => void;
}

export function GiftCardSettings({ 
  businessId, 
  giftCardsEnabled, 
  subscriptionTier,
  onToggle 
}: GiftCardSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (enabled: boolean) => {
    if (subscriptionTier !== 'firstclass') {
      toast({
        title: "Upgrade Required",
        description: "Gift cards are only available for First Class subscribers.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ gift_cards_enabled: enabled })
        .eq('id', businessId);

      if (error) throw error;

      onToggle(enabled);
      toast({
        title: enabled ? "Gift Cards Enabled" : "Gift Cards Disabled",
        description: enabled 
          ? "Your customers can now purchase gift cards from your business."
          : "Gift card purchases have been disabled.",
      });
    } catch (error) {
      console.error('Error updating gift card settings:', error);
      toast({
        title: "Error",
        description: "Failed to update gift card settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gift Card Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="gift-cards-toggle">Enable Gift Cards</Label>
            <p className="text-sm text-muted-foreground">
              Allow customers to purchase gift cards for your business
              {subscriptionTier !== 'firstclass' && (
                <span className="text-orange-600"> (First Class subscription required)</span>
              )}
            </p>
          </div>
          <Switch
            id="gift-cards-toggle"
            checked={giftCardsEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || subscriptionTier !== 'firstclass'}
          />
        </div>
      </CardContent>
    </Card>
  );
}