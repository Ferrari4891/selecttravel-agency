import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Home, Shield, Users, Building2, BarChart3, Settings } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { BusinessManagement } from '@/components/admin/BusinessManagement';
import { BusinessApprovalDashboard } from '@/components/admin/BusinessApprovalDashboard';
import { SystemAnalytics } from '@/components/admin/SystemAnalytics';
import { AdminSettings } from '@/components/admin/AdminSettings';
import MobileContainer from '@/components/MobileContainer';
import heroImage from "@/assets/hero-business-centre.jpg";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        navigate('/dashboard');
        return;
      }

      if (!data?.is_admin) {
        toast({
          title: "Access Denied",
          description: "You do not have administrator privileges.",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <div>Verifying administrator access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MobileContainer>
      <div className="min-h-screen bg-background">
        {/* Hero Section - Mobile Optimized */}
        <div className="relative w-full h-48 md:h-64 mb-4">
          <img 
            src={heroImage} 
            alt="Administrator Dashboard" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-white" />
                <h1 className="text-2xl md:text-4xl font-bold">Administrator Dashboard</h1>
              </div>
              <p className="text-sm md:text-lg">System administrator panel</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 pb-8 space-y-4">
          {/* Header Actions */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Member Dashboard
            </Button>
          </div>
          <Tabs defaultValue="approvals" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger value="approvals" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building2 className="h-4 w-4 mr-2" />
                Business Approvals
              </TabsTrigger>
              <TabsTrigger value="analytics" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="businesses" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building2 className="h-4 w-4 mr-2" />
                Businesses
              </TabsTrigger>
              <TabsTrigger value="settings" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approvals" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Business Approvals</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Review and approve new business applications to make them visible to visitors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <BusinessApprovalDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">System Analytics</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Monitor platform performance, user activity, and system metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <SystemAnalytics />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">User Management</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Manage user accounts, roles, and access permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <UserManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="businesses" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Business Management</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Oversee business listings, subscriptions, and compliance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <BusinessManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">System Settings</CardTitle>
                  <CardDescription className="text-sm md:text-base text-center text-muted-foreground">
                    Configure platform settings, permissions, and system parameters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <AdminSettings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileContainer>
  );
};

export default AdminDashboard;