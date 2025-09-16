import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Crown, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  annual_discount_percentage: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export const EnhancedSubscriptionManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setPlans((data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? (plan.features as string[]) : []
      })));
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: editingPlan.name,
          description: editingPlan.description,
          monthly_price: editingPlan.monthly_price,
          annual_price: editingPlan.annual_price,
          annual_discount_percentage: editingPlan.annual_discount_percentage,
          features: editingPlan.features,
          is_active: editingPlan.is_active,
        })
        .eq('id', editingPlan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });

      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    }
  };

  const handleAddFeature = () => {
    if (!editingPlan || !newFeature.trim()) return;

    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, newFeature.trim()]
    });
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPlan) return;

    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <div className="p-6">Loading subscription plans...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Enhanced Subscription Management</h2>
      
      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {plan.tier === 'firstclass' && <Crown className="h-4 w-4 text-yellow-600" />}
                {plan.tier === 'premium' && <Zap className="h-4 w-4 text-purple-600" />}
                {plan.tier === 'basic' && <Settings className="h-4 w-4 text-blue-600" />}
                {plan.name}
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingPlan({ ...plan })}
                className="rounded-none"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {editingPlan?.id === plan.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="rounded-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tier">Tier</Label>
                      <Input
                        id="tier"
                        value={editingPlan.tier}
                        disabled
                        className="bg-muted rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingPlan.description || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                      className="rounded-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="monthly_price">Monthly Price ($)</Label>
                      <Input
                        id="monthly_price"
                        type="number"
                        step="0.01"
                        value={editingPlan.monthly_price}
                        onChange={(e) => setEditingPlan({ ...editingPlan, monthly_price: parseFloat(e.target.value) || 0 })}
                        className="rounded-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="annual_price">Annual Price ($)</Label>
                      <Input
                        id="annual_price"
                        type="number"
                        step="0.01"
                        value={editingPlan.annual_price}
                        onChange={(e) => setEditingPlan({ ...editingPlan, annual_price: parseFloat(e.target.value) || 0 })}
                        className="rounded-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Annual Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={editingPlan.annual_discount_percentage}
                        onChange={(e) => setEditingPlan({ ...editingPlan, annual_discount_percentage: parseFloat(e.target.value) || 0 })}
                        className="rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Features</Label>
                    <div className="space-y-2">
                      {editingPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={feature} disabled className="flex-1 rounded-none" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFeature(index)}
                            className="rounded-none"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new feature..."
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                          className="rounded-none"
                        />
                        <Button onClick={handleAddFeature} size="sm" className="rounded-none">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSavePlan} className="rounded-none">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingPlan(null)} className="rounded-none">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">{plan.description}</p>
                  
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-medium">Monthly:</span> ${plan.monthly_price}
                    </div>
                    <div>
                      <span className="font-medium">Annual:</span> ${plan.annual_price}
                    </div>
                    <div>
                      <span className="font-medium">Annual Discount:</span> {plan.annual_discount_percentage}%
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Features:</span>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};