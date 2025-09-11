import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessProfile } from '@/components/business/BusinessProfile';
import { BusinessAnalytics } from '@/components/business/BusinessAnalytics';
import { SubscriptionManagement } from '@/components/business/SubscriptionManagement';
import { BusinessMediaForm } from '@/components/business/BusinessMediaForm';
import { BusinessMediaPreview } from '@/components/business/BusinessMediaPreview';
import { useToast } from '@/hooks/use-toast';
import { Home } from 'lucide-react';
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
  const {
    user,
    signOut
  } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      fetchBusiness();
    }
  }, [user]);
  const fetchBusiness = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('businesses').select('*').eq('user_id', user?.id).single();
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast({
        title: "Error",
        description: "Failed to load business information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleBusinessCreated = (newBusiness: Business) => {
    setBusiness(newBusiness);
    toast({
      title: "Success",
      description: "Business profile created successfully!"
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b-8 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 space-y-3">
            {/* Main heading spanning full width */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Business Dashboard
            </h1>
            
            {/* Welcome message on second line */}
            <p className="text-sm text-gray-600">
              Welcome, {user?.email}
            </p>
            
            {/* Buttons on third line */}
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!business ? <Card className="border shadow-md">
            <CardHeader className="text-center space-y-4 pb-6">
              <CardTitle className="text-2xl font-bold text-foreground">Create Your Business Profile</CardTitle>
              <CardDescription className="text-base leading-relaxed max-w-2xl mx-auto">
                Get started by setting up your comprehensive business profile to unlock all platform features and maximize your business potential.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessProfile onBusinessCreated={handleBusinessCreated} />
            </CardContent>
          </Card> : <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 h-auto">
              <TabsTrigger value="profile" className="text-sm font-medium px-4 py-3">Business Profile</TabsTrigger>
              <TabsTrigger value="media" className="text-sm font-medium px-4 py-3">Media</TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm font-medium px-4 py-3">Analytics</TabsTrigger>
              <TabsTrigger value="subscription" className="text-sm font-medium px-4 py-3">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="border shadow-md bg-background">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Business Profile</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Manage your business information and settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessProfile business={business} onBusinessUpdated={setBusiness} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <div className="space-y-6">
                <BusinessMediaForm businessId={business.id} />
                <BusinessMediaPreview media={null} />
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="border shadow-md bg-background">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Business Analytics</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Track your business performance and metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessAnalytics businessId={business.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card className="border shadow-md bg-background">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Subscription Management</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Manage your subscription plan and billing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionManagement business={business} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>}
      </main>
    </div>;
};
export default Dashboard;