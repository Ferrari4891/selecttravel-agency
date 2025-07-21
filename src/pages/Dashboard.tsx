import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessProfile } from '@/components/business/BusinessProfile';
import { BusinessAnalytics } from '@/components/business/BusinessAnalytics';
import { SubscriptionManagement } from '@/components/business/SubscriptionManagement';
import { useToast } from '@/hooks/use-toast';

interface Business {
  id: string;
  business_name: string;
  business_type: string;
  description: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_end_date: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBusiness();
    }
  }, [user]);

  const fetchBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast({
        title: "Error",
        description: "Failed to load business information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessCreated = (newBusiness: Business) => {
    setBusiness(newBusiness);
    toast({
      title: "Success",
      description: "Business profile created successfully!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-sm border-b-8 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Business Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!business ? (
          <Card className="border-8 border-white shadow-md">
            <CardHeader>
              <CardTitle>Create Your Business Profile</CardTitle>
              <CardDescription>
                Get started by setting up your business profile to access all features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessProfile onBusinessCreated={handleBusinessCreated} />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Business Profile</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="border-8 border-white shadow-md">
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>
                    Manage your business information and settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessProfile 
                    business={business} 
                    onBusinessUpdated={setBusiness} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="border-8 border-white shadow-md">
                <CardHeader>
                  <CardTitle>Business Analytics</CardTitle>
                  <CardDescription>
                    Track your business performance and metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessAnalytics businessId={business.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card className="border-8 border-white shadow-md">
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>
                    Manage your subscription plan and billing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionManagement business={business} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;