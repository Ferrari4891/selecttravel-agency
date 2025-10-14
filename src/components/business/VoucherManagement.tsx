import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Ticket, Plus, Percent, DollarSign, Gift, Eye, Users, Calendar } from 'lucide-react';

interface VoucherManagementProps {
  businessId: string;
  subscriptionTier: string;
}

interface Voucher {
  id: string;
  voucher_type: 'percentage_discount' | 'fixed_amount' | 'buy_one_get_one';
  title: string;
  description?: string;
  discount_value: number;
  min_purchase_amount: number;
  max_uses?: number;
  current_uses: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface VoucherUsage {
  id: string;
  voucher_id: string;
  user_email?: string;
  used_at: string;
  amount_saved: number;
}

export const VoucherManagement: React.FC<VoucherManagementProps> = ({ 
  businessId, 
  subscriptionTier 
}) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [usage, setUsage] = useState<VoucherUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    voucher_type: 'percentage_discount' as const,
    title: '',
    description: '',
    discount_value: '',
    min_purchase_amount: '0',
    max_uses: '',
    end_date: ''
  });
  const { toast } = useToast();

  // Check if first class subscriber
  const isFirstClass = subscriptionTier === 'firstclass';

  useEffect(() => {
    if (!isFirstClass) return;

    fetchVouchers();
    fetchUsage();
    setupRealTimeSubscription();
  }, [businessId, isFirstClass]);

  const fetchVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('business_vouchers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load vouchers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('voucher_usage')
        .select('*')
        .order('used_at', { ascending: false });

      if (error) throw error;
      setUsage(data || []);
    } catch (error: any) {
      console.error('Error fetching voucher usage:', error);
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel('voucher-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voucher_usage'
        },
        () => {
          fetchUsage();
          fetchVouchers(); // Refresh to update current_uses
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createVoucher = async () => {
    if (!formData.title.trim() || !formData.discount_value || !formData.end_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title, Discount Value, and End Date).",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('business_vouchers')
        .insert({
          business_id: businessId,
          voucher_type: formData.voucher_type,
          title: formData.title,
          description: formData.description || null,
          discount_value: parseFloat(formData.discount_value),
          min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          end_date: formData.end_date
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Voucher created successfully.",
      });

      setIsDialogOpen(false);
      setFormData({
        voucher_type: 'percentage_discount',
        title: '',
        description: '',
        discount_value: '',
        min_purchase_amount: '0',
        max_uses: '',
        end_date: ''
      });
      fetchVouchers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create voucher.",
        variant: "destructive",
      });
    }
  };

  const toggleVoucherStatus = async (voucherId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('business_vouchers')
        .update({ is_active: !currentStatus })
        .eq('id', voucherId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Voucher ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });

      fetchVouchers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update voucher status.",
        variant: "destructive",
      });
    }
  };

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case 'percentage_discount': return <Percent className="h-4 w-4" />;
      case 'fixed_amount': return <DollarSign className="h-4 w-4" />;
      case 'buy_one_get_one': return <Gift className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage_discount': return 'Percentage Discount';
      case 'fixed_amount': return 'Fixed Amount Off';
      case 'buy_one_get_one': return 'Buy One Get One';
      default: return type;
    }
  };

  const getVoucherUsageForVoucher = (voucherId: string) => {
    return usage.filter(u => u.voucher_id === voucherId);
  };

  if (!isFirstClass) {
    return (
      <Card className="border-8 border-white shadow-md">
        <CardContent className="text-center py-8">
          <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Voucher Management</h3>
          <p className="text-muted-foreground mb-4">
            Upgrade to First Class to create and manage vouchers for your business.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <div>Loading vouchers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Voucher Management</h2>
          <p className="text-muted-foreground">Create and manage discount vouchers for your customers</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Voucher</DialogTitle>
              <DialogDescription>
                Choose from 3 voucher types and set your discount parameters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="voucher-type" className="text-sm font-medium">
                  Voucher Type
                </Label>
                <Select
                  value={formData.voucher_type}
                  onValueChange={(value: any) => setFormData({ ...formData, voucher_type: value })}
                >
                  <SelectTrigger id="voucher-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="percentage_discount">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Percentage Discount
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed_amount">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Fixed Amount Off
                      </div>
                    </SelectItem>
                    <SelectItem value="buy_one_get_one">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Buy One Get One
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucher-title" className="text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="voucher-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Special 20% Off"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucher-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="voucher-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your offer..."
                  rows={3}
                  className="w-full resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucher-discount" className="text-sm font-medium">
                  {formData.voucher_type === 'percentage_discount' ? 'Discount Percentage' :
                   formData.voucher_type === 'fixed_amount' ? 'Discount Amount ($)' : 'Free Items Quantity'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="voucher-discount"
                  type="number"
                  min="0"
                  step={formData.voucher_type === 'percentage_discount' ? '1' : '0.01'}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.voucher_type === 'percentage_discount' ? '20' : '10'}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucher-min-purchase" className="text-sm font-medium">
                  Minimum Purchase Amount ($)
                </Label>
                <Input
                  id="voucher-min-purchase"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_purchase_amount}
                  onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                  placeholder="0"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucher-max-uses" className="text-sm font-medium">
                  Maximum Uses (optional)
                </Label>
                <Input
                  id="voucher-max-uses"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Leave empty for unlimited uses"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucher-end-date" className="text-sm font-medium">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="voucher-end-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full"
                />
              </div>

              <Button onClick={createVoucher} className="w-full mt-6">
                <Plus className="h-4 w-4 mr-2" />
                Create Voucher
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vouchers List */}
      {vouchers.length > 0 ? (
        <div className="space-y-4">
          {vouchers.map((voucher) => {
            const voucherUsage = getVoucherUsageForVoucher(voucher.id);
            const isExpired = new Date(voucher.end_date) < new Date();
            const isMaxUsesReached = voucher.max_uses && voucher.current_uses >= voucher.max_uses;
            
            return (
              <Card key={voucher.id} className="border-8 border-white shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getVoucherIcon(voucher.voucher_type)}
                      <CardTitle className="text-lg">{voucher.title}</CardTitle>
                      <Badge variant={voucher.is_active && !isExpired && !isMaxUsesReached ? "default" : "secondary"}>
                        {isExpired ? 'Expired' : 
                         isMaxUsesReached ? 'Max Uses Reached' :
                         voucher.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVoucherStatus(voucher.id, voucher.is_active)}
                      disabled={isExpired || isMaxUsesReached}
                    >
                      {voucher.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                  <CardDescription>
                    {getVoucherTypeLabel(voucher.voucher_type)} • 
                    {voucher.voucher_type === 'percentage_discount' ? `${voucher.discount_value}% off` :
                     voucher.voucher_type === 'fixed_amount' ? `$${voucher.discount_value} off` :
                     `Get ${voucher.discount_value} free items`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {voucher.description && (
                      <p className="text-sm text-muted-foreground">{voucher.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{voucher.current_uses} uses</span>
                        {voucher.max_uses && <span>/ {voucher.max_uses} max</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Expires {new Date(voucher.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {voucher.min_purchase_amount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Minimum purchase: ${voucher.min_purchase_amount}
                      </p>
                    )}

                    {voucherUsage.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium mb-1">Recent Usage:</p>
                        <div className="space-y-1">
                          {voucherUsage.slice(0, 3).map((use) => (
                            <div key={use.id} className="text-xs text-muted-foreground flex justify-between">
                              <span>{use.user_email || 'Anonymous'}</span>
                              <span>Saved ${use.amount_saved}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-8 border-white shadow-md">
          <CardContent className="text-center py-8">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Vouchers Created</h3>
            <p className="text-muted-foreground mb-4">
              Create your first voucher to start offering discounts to your customers.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Voucher
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};