import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Building2, Users, TrendingUp, Plus, BarChart3, Target } from 'lucide-react';
import { CreateTestBusinessDialog } from './CreateTestBusinessDialog';
import { TestMarketAnalytics } from './TestMarketAnalytics';

interface TestMarketBusiness {
  id: string;
  business_name: string;
  business_type: string;
  city: string;
  country: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  status: string;
  created_at: string;
  user_id: string;
}

export const TestMarketDashboard = () => {
  const [businesses, setBusinesses] = useState<TestMarketBusiness[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<TestMarketBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Danang');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewAnalytics, setViewAnalytics] = useState(false);
  const { toast } = useToast();

  const testMarketCities = ['Danang', 'Ho Chi Minh City', 'Hanoi', 'Bangkok', 'Manila'];

  useEffect(() => {
    fetchTestMarketBusinesses();
  }, [selectedCity]);

  const fetchTestMarketBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('city', selectedCity)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
      setFilteredBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching test market businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load test market businesses.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStats = () => {
    const total = filteredBusinesses.length;
    const trial = filteredBusinesses.filter(b => b.subscription_status === 'trial').length;
    const basic = filteredBusinesses.filter(b => b.subscription_tier === 'basic' && b.subscription_status === 'active').length;
    const premium = filteredBusinesses.filter(b => b.subscription_tier === 'premium' && b.subscription_status === 'active').length;
    const firstclass = filteredBusinesses.filter(b => b.subscription_tier === 'firstclass' && b.subscription_status === 'active').length;

    return { total, trial, basic, premium, firstclass };
  };

  const getStatusBadge = (status: string, tier: string | null, subStatus: string | null) => {
    if (subStatus === 'trial') {
      return <Badge variant="outline">Trial</Badge>;
    }
    if (tier === 'firstclass' && subStatus === 'active') {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">First Class</Badge>;
    }
    if (tier === 'premium' && subStatus === 'active') {
      return <Badge variant="default">Premium</Badge>;
    }
    if (tier === 'basic' && subStatus === 'active') {
      return <Badge variant="secondary">Basic</Badge>;
    }
    return <Badge variant="outline">No Plan</Badge>;
  };

  const stats = getSubscriptionStats();

  if (viewAnalytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Test Market Analytics - {selectedCity}</h2>
          </div>
          <Button onClick={() => setViewAnalytics(false)} variant="outline">
            <Building2 className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <TestMarketAnalytics city={selectedCity} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Test Market Dashboard</h2>
        </div>

        {/* City Selection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label>Test Market:</Label>
          </div>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full sm:w-48 rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {testMarketCities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Businesses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.trial}</div>
            <div className="text-sm text-muted-foreground">Trial</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.basic}</div>
            <div className="text-sm text-muted-foreground">Basic</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.premium}</div>
            <div className="text-sm text-muted-foreground">Premium</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.firstclass}</div>
            <div className="text-sm text-muted-foreground">First Class</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2 rounded-none">
          <Plus className="h-4 w-4" />
          Create Test Business
        </Button>
        <Button onClick={() => setViewAnalytics(true)} variant="outline" className="flex items-center gap-2 rounded-none">
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* Businesses List */}
      {loading ? (
        <div className="text-center py-8">Loading test market businesses...</div>
      ) : (
        <div className="grid gap-4">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{business.business_name}</div>
                      <div className="text-sm text-muted-foreground">{business.business_type}</div>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(business.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(business.status, business.subscription_tier, business.subscription_status)}
                    <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                      {business.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredBusinesses.length === 0 && !loading && (
        <Card className="border shadow-sm">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <div className="text-muted-foreground">No businesses found in {selectedCity}.</div>
            <Button 
              onClick={() => setCreateDialogOpen(true)} 
              className="mt-4 rounded-none"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Test Business
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateTestBusinessDialog 
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        selectedCity={selectedCity}
        onBusinessCreated={fetchTestMarketBusinesses}
      />
    </div>
  );
};