import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Building2, Calendar, CreditCard, MapPin, Edit, Crown, Zap } from 'lucide-react';
import { EditBusinessDialog } from './EditBusinessDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Business {
  id: string;
  business_name: string;
  business_type: string;
  business_subcategory: string | null;
  business_category: string | null;
  business_subtype: string | null;
  business_specific_type: string | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  status: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_end_date: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  logo_url: string | null;
  image_1_url: string | null;
  image_2_url: string | null;
  image_3_url: string | null;
  wheelchair_access: boolean | null;
  extended_hours: boolean | null;
  gluten_free: boolean | null;
  low_noise: boolean | null;
  public_transport: boolean | null;
  pet_friendly: boolean | null;
  outdoor_seating: boolean | null;
  senior_discounts: boolean | null;
  online_booking: boolean | null;
  air_conditioned: boolean | null;
  business_hours: any;
  admin_notes: string | null;
  rejection_reason: string | null;
  gift_cards_enabled: boolean | null;
  created_at: string;
  user_id: string;
}

export const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    console.log('fetchBusinesses called - refreshing business list');
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched businesses:', data?.length, 'businesses');
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load businesses.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessStatus = async (businessId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status: newStatus })
        .eq('id', businessId);

      if (error) throw error;

      setBusinesses(businesses.map(business => 
        business.id === businessId 
          ? { ...business, status: newStatus }
          : business
      ));

      toast({
        title: "Success",
        description: `Business status updated to ${newStatus}.`
      });
    } catch (error: any) {
      console.error('Error updating business status:', error);
      toast({
        title: "Error",
        description: error?.message ? `Failed to update business status: ${error.message}` : "Failed to update business status.",
        variant: "destructive"
      });
    }
  };

  const updateSubscription = async (businessId: string, tier: string | null, status: string) => {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) {
        toast({
          title: "Not signed in",
          description: "Please sign in to manage subscriptions.",
          variant: "destructive",
        });
        return;
      }

      // Verify admin privileges explicitly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (profileError || !profile?.is_admin) {
        toast({
          title: "Insufficient permissions",
          description: "You must be an administrator to update subscriptions.",
          variant: "destructive",
        });
        return;
      }

      // Align with DB constraint: when status is 'trial', tier must be NULL
      const tierToSend = status === 'trial' ? null : tier;

      // Use SECURITY DEFINER RPC to ensure admin updates bypass RLS safely
      const { data: _rpcData, error: rpcError } = await supabase.rpc(
        'admin_update_business_subscription',
        {
          p_business_id: businessId,
          p_tier: tierToSend,
          p_status: status,
        }
      );

      if (rpcError) throw rpcError;

      // Mirror the expected end date locally for immediate UI feedback
      const endDate = status === 'active'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      setBusinesses(businesses.map(business => 
        business.id === businessId 
          ? { 
              ...business, 
              subscription_tier: tierToSend,
              subscription_status: status,
              subscription_end_date: endDate
            }
          : business
      ));

      toast({
        title: "Success",
        description: `Subscription updated to ${tierToSend ?? 'none'} (${status}).`
      });

      setIsSubscriptionDialogOpen(false);
      setSelectedBusiness(null);
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: error?.message ? `Failed to update subscription: ${error.message}` : "Failed to update subscription.",
        variant: "destructive"
      });
    }
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setIsEditDialogOpen(true);
  };

  const handleManageSubscription = (business: Business) => {
    setSelectedBusiness(business);
    setIsSubscriptionDialogOpen(true);
  };

  const handleBusinessUpdate = (updatedBusiness: Business) => {
    setBusinesses(businesses.map(business => 
      business.id === updatedBusiness.id ? updatedBusiness : business
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (status: string | null, tier: string | null) => {
    if (!status || !tier) return <Badge variant="outline">No Subscription</Badge>;
    
    const isActive = status === 'active';
    const isFirstClass = tier === 'firstclass' || tier === 'premium' || tier === 'enterprise';
    
    return (
      <Badge variant={isActive ? 'default' : 'secondary'} className={isFirstClass ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : ''}>
        {isFirstClass && <Crown className="h-3 w-3 mr-1" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)} - {status}
      </Badge>
    );
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || business.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-8">Loading businesses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search, Filter and Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-none w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] rounded-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-center sm:justify-end gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{businesses.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {businesses.filter(b => b.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </div>
      </div>

      {/* Businesses Grid */}
      <div className="grid gap-4">
        {filteredBusinesses.map((business) => (
          <Card key={business.id} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Business Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-base">{business.business_name}</div>
                      <div className="text-sm text-muted-foreground">{business.business_type}</div>
                    </div>
                  </div>
                  {getStatusBadge(business.status)}
                </div>

                {/* Business Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{business.city}, {business.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Registered: {new Date(business.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Subscription:</span>
                    {getSubscriptionBadge(business.subscription_status, business.subscription_tier)}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBusiness(business)}
                      className="flex items-center gap-2 justify-center rounded-none w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageSubscription(business)}
                      className="flex items-center gap-2 justify-center rounded-none w-full sm:w-auto"
                    >
                      <Zap className="h-4 w-4" />
                      Subscription
                    </Button>
                  </div>
                  <Select
                    value={business.status}
                    onValueChange={(value) => updateBusinessStatus(business.id, value)}
                  >
                    <SelectTrigger className="w-full sm:w-[140px] rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <Card className="border shadow-sm">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <div className="text-muted-foreground">No businesses found matching your criteria.</div>
          </CardContent>
        </Card>
      )}

      <EditBusinessDialog
        business={editingBusiness}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingBusiness(null);
        }}
        onBusinessUpdated={() => {
          fetchBusinesses();
          setIsEditDialogOpen(false);
          setEditingBusiness(null);
        }}
      />

      {/* Subscription Management Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Update subscription tier and status for {selectedBusiness?.business_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBusiness && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium">Current Subscription</div>
                <div className="mt-1">
                  {getSubscriptionBadge(selectedBusiness.subscription_status, selectedBusiness.subscription_tier)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Quick Actions</div>
                
                <div className="grid gap-2">
                  <Button
                    onClick={() => updateSubscription(selectedBusiness.id, null, 'trial')}
                    variant="outline"
                    className="justify-start rounded-none w-full"
                  >
                    Set to Trial Status
                  </Button>
                  
                  <Button
                    onClick={() => updateSubscription(selectedBusiness.id, 'basic', 'active')}
                    variant="outline"
                    className="justify-start rounded-none w-full"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Activate Basic Plan
                  </Button>
                  
                  <Button
                    onClick={() => updateSubscription(selectedBusiness.id, 'premium', 'active')}
                    variant="outline"
                    className="justify-start rounded-none w-full bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                  >
                    <Crown className="h-4 w-4 mr-2 text-yellow-600" />
                    Activate Premium Plan
                  </Button>
                  
                  <Button
                    onClick={() => updateSubscription(selectedBusiness.id, selectedBusiness.subscription_tier ?? null, 'canceled')}
                    variant="destructive"
                    className="justify-start rounded-none w-full"
                  >
                    Suspend Subscription
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};