import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Gift, Building2, Calendar, DollarSign, User, QrCode, RefreshCw } from 'lucide-react';

interface GiftCard {
  id: string;
  business_id: string;
  amount: number;
  expires_at: string | null;
  created_at: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  message: string | null;
  qr_code: string;
  numeric_code: string;
  status: string;
  purchased_by_email: string;
  purchased_by_name: string;
  stripe_payment_intent_id: string | null;
  business?: {
    business_name: string;
    city: string;
    country: string;
  };
}

export const GiftCardManagement = () => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [businessFilter, setBusinessFilter] = useState<string>('all');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchGiftCards();
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, business_name, city, country')
        .eq('gift_cards_enabled', true)
        .order('business_name');

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchGiftCards = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select(`
          *,
          business:businesses!inner(
            business_name,
            city,
            country
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGiftCards(data || []);
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      toast({
        title: "Error",
        description: "Failed to load gift cards.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGiftCardStatus = async (giftCardId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ status: newStatus })
        .eq('id', giftCardId);

      if (error) throw error;

      setGiftCards(giftCards.map(card => 
        card.id === giftCardId 
          ? { ...card, status: newStatus }
          : card
      ));

      toast({
        title: "Success",
        description: `Gift card status updated to ${newStatus}.`
      });
    } catch (error: any) {
      console.error('Error updating gift card status:', error);
      toast({
        title: "Error",
        description: "Failed to update gift card status.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, expiresAt: string | null) => {
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'redeemed':
        return <Badge variant="secondary">Redeemed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = 
      card.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.purchased_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.numeric_code.includes(searchTerm) ||
      card.business?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    const matchesBusiness = businessFilter === 'all' || card.business_id === businessFilter;
    
    return matchesSearch && matchesStatus && matchesBusiness;
  });

  const getTotalValue = () => {
    return filteredGiftCards
      .filter(card => card.status === 'active')
      .reduce((sum, card) => sum + Number(card.amount), 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading gift cards...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Gift Card Management</h2>
        </div>
        <Button onClick={fetchGiftCards} variant="outline" size="sm" className="rounded-none">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by recipient, code, or business..."
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
              <SelectItem value="redeemed">Redeemed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={businessFilter} onValueChange={setBusinessFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-none">
              <SelectValue placeholder="Business" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Businesses</SelectItem>
              {businesses.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{filteredGiftCards.length}</div>
              <div className="text-sm text-muted-foreground">Total Gift Cards</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredGiftCards.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {filteredGiftCards.filter(c => c.status === 'redeemed').length}
              </div>
              <div className="text-sm text-muted-foreground">Redeemed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalValue())}</div>
              <div className="text-sm text-muted-foreground">Active Value</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gift Cards List */}
      <div className="grid gap-4">
        {filteredGiftCards.map((card) => (
          <Card key={card.id} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-base">{formatCurrency(Number(card.amount))}</div>
                      <div className="text-sm text-muted-foreground">{card.business?.business_name}</div>
                    </div>
                  </div>
                  {getStatusBadge(card.status, card.expires_at)}
                </div>

                {/* Card Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Recipient:</span>
                      <span>{card.recipient_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Business:</span>
                      <span>{card.business?.business_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Code:</span>
                      <span className="font-mono">{card.numeric_code}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Purchased:</span>
                      <span>{new Date(card.created_at).toLocaleDateString()}</span>
                    </div>
                    {card.expires_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Expires:</span>
                        <span>{new Date(card.expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Purchased by:</span>
                      <span>{card.purchased_by_name}</span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {card.message && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-1">Message:</div>
                    <div className="text-sm">{card.message}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    ID: {card.id.slice(0, 8)}...
                  </div>
                  <Select
                    value={card.status}
                    onValueChange={(value) => updateGiftCardStatus(card.id, value)}
                  >
                    <SelectTrigger className="w-[140px] rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="redeemed">Redeemed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGiftCards.length === 0 && (
        <Card className="border shadow-sm">
          <CardContent className="text-center py-12">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <div className="text-muted-foreground">No gift cards found matching your criteria.</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};