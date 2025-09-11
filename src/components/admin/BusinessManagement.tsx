import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Building2, Calendar, CreditCard, MapPin, Edit } from 'lucide-react';
import { EditBusinessDialog } from './EditBusinessDialog';

interface Business {
  id: string;
  business_name: string;
  business_type: string;
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
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    } catch (error) {
      console.error('Error updating business status:', error);
      toast({
        title: "Error",
        description: "Failed to update business status.",
        variant: "destructive"
      });
    }
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setIsEditDialogOpen(true);
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
    if (!status) return <Badge variant="outline">No Subscription</Badge>;
    
    const color = status === 'active' ? 'default' : 
                  status === 'trial' ? 'secondary' : 'destructive';
    
    return (
      <Badge variant={color}>
        {tier ? `${tier} - ${status}` : status}
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
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
        
        <div className="flex gap-4">
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
                <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBusiness(business)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Business
                  </Button>
                  <Select
                    value={business.status}
                    onValueChange={(value) => updateBusinessStatus(business.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
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
        onUpdate={handleBusinessUpdate}
      />
    </div>
  );
};