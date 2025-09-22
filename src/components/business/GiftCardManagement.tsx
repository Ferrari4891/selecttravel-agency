import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit3, DollarSign } from 'lucide-react';

interface GiftCardAmount {
  id: string;
  amount: number;
  isActive: boolean;
}

interface GiftCardManagementProps {
  businessId: string;
  subscriptionTier: string;
  giftCardsEnabled: boolean;
  onToggleGiftCards: (enabled: boolean) => void;
}

export function GiftCardManagement({ 
  businessId, 
  subscriptionTier, 
  giftCardsEnabled,
  onToggleGiftCards 
}: GiftCardManagementProps) {
  const [amounts, setAmounts] = useState<GiftCardAmount[]>([]);
  const [newAmount, setNewAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if First Class subscription
  const isFirstClass = subscriptionTier === 'firstclass';

  useEffect(() => {
    if (businessId && isFirstClass && giftCardsEnabled) {
      loadGiftCardAmounts();
    }
  }, [businessId, isFirstClass, giftCardsEnabled]);

  const loadGiftCardAmounts = async () => {
    try {
      // Load from business metadata or create default amounts
      const { data: business, error } = await supabase
        .from('businesses')
        .select('business_hours') // Using business_hours as metadata storage
        .eq('id', businessId)
        .maybeSingle();

      if (error) throw error;

      const metadata = (business?.business_hours as any) || {};
      const giftCardAmounts = metadata.gift_card_amounts || [
        { id: '1', amount: 25, isActive: true },
        { id: '2', amount: 50, isActive: true },
        { id: '3', amount: 100, isActive: true }
      ];

      setAmounts(giftCardAmounts);
    } catch (error) {
      console.error('Error loading gift card amounts:', error);
    }
  };

  const saveGiftCardAmounts = async (newAmounts: GiftCardAmount[]) => {
    try {
      const { data: business, error: fetchError } = await supabase
        .from('businesses')
        .select('business_hours')
        .eq('id', businessId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const metadata = (business?.business_hours as any) || {};
      metadata.gift_card_amounts = newAmounts;

      const { error } = await supabase
        .from('businesses')
        .update({ business_hours: metadata })
        .eq('id', businessId);

      if (error) throw error;

      setAmounts(newAmounts);
      toast({
        title: "Success",
        description: "Gift card amounts updated successfully.",
      });
    } catch (error) {
      console.error('Error saving gift card amounts:', error);
      toast({
        title: "Error",
        description: "Failed to update gift card amounts.",
        variant: "destructive",
      });
    }
  };

  const handleToggleGiftCards = async () => {
    if (!isFirstClass) {
      toast({
        title: "Upgrade Required",
        description: "Gift cards are only available for First Class subscribers.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ gift_cards_enabled: !giftCardsEnabled })
        .eq('id', businessId);

      if (error) throw error;

      onToggleGiftCards(!giftCardsEnabled);
      toast({
        title: giftCardsEnabled ? "Gift Cards Disabled" : "Gift Cards Enabled",
        description: giftCardsEnabled 
          ? "Gift card purchases have been disabled."
          : "Your customers can now purchase gift cards from your business.",
      });
    } catch (error) {
      console.error('Error updating gift card settings:', error);
      toast({
        title: "Error",
        description: "Failed to update gift card settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAmount = async () => {
    const amount = parseFloat(newAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    if (amounts.some(a => a.amount === amount)) {
      toast({
        title: "Duplicate Amount",
        description: "This amount already exists.",
        variant: "destructive",
      });
      return;
    }

    const newAmountObj: GiftCardAmount = {
      id: Date.now().toString(),
      amount,
      isActive: true
    };

    const updatedAmounts = [...amounts, newAmountObj].sort((a, b) => a.amount - b.amount);
    await saveGiftCardAmounts(updatedAmounts);
    setNewAmount('');
  };

  const removeAmount = async (id: string) => {
    const updatedAmounts = amounts.filter(a => a.id !== id);
    await saveGiftCardAmounts(updatedAmounts);
  };

  const startEdit = (amount: GiftCardAmount) => {
    setEditingId(amount.id);
    setEditAmount(amount.amount.toString());
  };

  const saveEdit = async () => {
    const amount = parseFloat(editAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates (excluding current item)
    if (amounts.some(a => a.id !== editingId && a.amount === amount)) {
      toast({
        title: "Duplicate Amount",
        description: "This amount already exists.",
        variant: "destructive",
      });
      return;
    }

    const updatedAmounts = amounts.map(a => 
      a.id === editingId ? { ...a, amount } : a
    ).sort((a, b) => a.amount - b.amount);

    await saveGiftCardAmounts(updatedAmounts);
    setEditingId(null);
    setEditAmount('');
  };

  const toggleAmountActive = async (id: string) => {
    const updatedAmounts = amounts.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    await saveGiftCardAmounts(updatedAmounts);
  };

  if (!isFirstClass) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gift Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Badge variant="outline" className="mb-2">First Class Required</Badge>
            <p className="text-sm text-muted-foreground">
              Gift card management is only available for First Class subscribers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Gift Card Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label className="font-medium">Enable Gift Cards</Label>
            <p className="text-sm text-muted-foreground">
              Allow customers to purchase gift cards for your business
            </p>
          </div>
          <Button
            variant={giftCardsEnabled ? "default" : "outline"}
            onClick={handleToggleGiftCards}
            disabled={loading}
            className="rounded-none"
          >
            {giftCardsEnabled ? "Enabled" : "Enable"}
          </Button>
        </div>

        {giftCardsEnabled && (
          <>
            {/* Add New Amount */}
            <div className="space-y-2">
              <Label>Add Gift Card Amount</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Enter amount (e.g. 25)"
                  className="rounded-none"
                  min="1"
                  step="0.01"
                />
                <Button 
                  onClick={addAmount}
                  className="rounded-none"
                  disabled={!newAmount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Current Amounts */}
            <div className="space-y-2">
              <Label>Available Amounts</Label>
              <div className="space-y-2">
                {amounts.map((amount) => (
                  <div key={amount.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    {editingId === amount.id ? (
                      <>
                        <Input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="rounded-none flex-1"
                          min="1"
                          step="0.01"
                        />
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          className="rounded-none"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          className="rounded-none"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span className="font-medium">${amount.amount.toFixed(2)}</span>
                          {!amount.isActive && (
                            <Badge variant="secondary" className="ml-2">Inactive</Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAmountActive(amount.id)}
                          className="rounded-none"
                        >
                          {amount.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(amount)}
                          className="rounded-none"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAmount(amount.id)}
                          className="rounded-none"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
                {amounts.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No gift card amounts configured. Add some amounts above.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}