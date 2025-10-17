import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, DollarSign, Edit, Check, X } from 'lucide-react';

interface PriceLevelSetting {
  id: string;
  level: string;
  min_price: number;
  max_price: number;
  description: string;
}

export const PriceLevelManagement: React.FC = () => {
  const [settings, setSettings] = useState<PriceLevelSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PriceLevelSetting>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPriceLevelSettings();
  }, []);

  const fetchPriceLevelSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('price_level_settings')
        .select('*')
        .order('level');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching price level settings:', error);
      toast({
        title: "Error",
        description: "Failed to load price level settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (setting: PriceLevelSetting) => {
    setEditingId(setting.id);
    setEditData({
      min_price: setting.min_price,
      max_price: setting.max_price,
      description: setting.description,
    });
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('price_level_settings')
        .update({
          min_price: editData.min_price,
          max_price: editData.max_price,
          description: editData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchPriceLevelSettings();
      setEditingId(null);
      setEditData({});

      toast({
        title: "Success",
        description: "Price level setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating price level setting:', error);
      toast({
        title: "Error",
        description: "Failed to update price level setting",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const getPriceLevelColor = (level: string) => {
    switch (level) {
      case '$': return 'text-green-600 bg-green-50';
      case '$$': return 'text-yellow-600 bg-yellow-50';
      case '$$$': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Price Level Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Configure price ranges for the three pricing levels. These ranges help users filter businesses by their budget preferences.
        </p>

        <div className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-green-50 hover:text-green-600 ${getPriceLevelColor(setting.level)}`}>
                  {setting.level} Level
                </div>
                {editingId !== setting.id && (
                  <Button
                    onClick={() => handleEdit(setting)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {editingId === setting.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`min-${setting.id}`}>Minimum Price ($)</Label>
                      <Input
                        id={`min-${setting.id}`}
                        type="number"
                        value={editData.min_price || 0}
                        onChange={(e) => setEditData({ ...editData, min_price: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`max-${setting.id}`}>Maximum Price ($)</Label>
                      <Input
                        id={`max-${setting.id}`}
                        type="number"
                        value={editData.max_price || 0}
                        onChange={(e) => setEditData({ ...editData, max_price: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`desc-${setting.id}`}>Description</Label>
                    <Textarea
                      id={`desc-${setting.id}`}
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      placeholder="Brief description of this price level"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave(setting.id)}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">Range:</span>
                    <span>${setting.min_price} - ${setting.max_price}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {setting.description}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};