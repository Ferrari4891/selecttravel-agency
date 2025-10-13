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
import { VoucherManagement } from '@/components/business/VoucherManagement';
import { BusinessQRScanner } from '@/components/business/BusinessQRScanner';
import { BusinessVisitDashboard } from '@/components/business/BusinessVisitDashboard';
import { useToast } from '@/hooks/use-toast';
import { Home } from 'lucide-react';
import MobileContainer from '@/components/MobileContainer';
import heroImage from "@/assets/hero-business-centre.jpg";
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
  return <MobileContainer>
    <div className="min-h-screen bg-background">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative w-full h-48 md:h-64 mb-4">
        <img 
          src={heroImage} 
          alt="Business Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Business Dashboard</h1>
            <p className="text-sm md:text-lg">Welcome, {user?.email}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pb-8 space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button onClick={signOut} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
        {!business ? <Card className="border shadow-md">
            <CardHeader className="text-center space-y-4 pb-6">
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground">Create Your Business Profile</CardTitle>
              <CardDescription className="text-sm md:text-base leading-relaxed mx-auto">
                Get started by setting up your comprehensive business profile to unlock all platform features and maximize your business potential.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessProfile onBusinessCreated={handleBusinessCreated} />
            </CardContent>
          </Card> : <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger value="profile" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Business Profile</TabsTrigger>
              <TabsTrigger value="media" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Media</TabsTrigger>
              {business.subscription_tier === 'firstclass' && (
                <TabsTrigger value="visits" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Visit Tracking</TabsTrigger>
              )}
              <TabsTrigger value="analytics" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Analytics</TabsTrigger>
              <TabsTrigger value="vouchers" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Vouchers</TabsTrigger>
              <TabsTrigger value="subscription" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Business Profile</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Manage your business information and settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <BusinessProfile business={business} onBusinessUpdated={setBusiness} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Media Management</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Upload and manage your business media.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  <BusinessMediaForm businessId={business.id} />
                  <BusinessMediaPreview media={null} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Business Analytics</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Track your business performance and metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <BusinessAnalytics businessId={business.id} subscriptionTier={business.subscription_tier || 'trial'} />
                </CardContent>
              </Card>
            </TabsContent>

            {business.subscription_tier === 'firstclass' && (
              <TabsContent value="visits" className="space-y-4">
                <Card className="border shadow-md bg-background">
                  <CardHeader className="bg-background p-4">
                    <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Member Visit Tracking</CardTitle>
                    <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                      Scan member QR codes and track visits to your business.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-6">
                    <BusinessQRScanner businessId={business.id} />
                    <BusinessVisitDashboard businessId={business.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="vouchers" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Voucher Management</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Create and manage discount vouchers for your customers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <VoucherManagement businessId={business.id} subscriptionTier={business.subscription_tier || 'trial'} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Subscription Management</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Manage your subscription plan and billing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <SubscriptionManagement business={business} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>}
        </div>
      </div>
    </MobileContainer>;
};
export default Dashboard;