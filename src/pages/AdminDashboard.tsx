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
import { SystemAnalytics } from '@/components/admin/SystemAnalytics';
import { AdminSettings } from '@/components/admin/AdminSettings';

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
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b-8 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Administrator Dashboard
              </h1>
            </div>
            
            <p className="text-sm text-gray-600">
              System administrator panel - {user?.email}
            </p>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Users className="h-4 w-4 mr-2" />
                Member Dashboard
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="businesses" className="text-xs sm:text-sm">
              <Building2 className="h-4 w-4 mr-1" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <Card className="border shadow-md bg-background">
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>
                  Monitor platform performance, user activity, and system metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border shadow-md bg-background">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and access permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="businesses">
            <Card className="border shadow-md bg-background">
              <CardHeader>
                <CardTitle>Business Management</CardTitle>
                <CardDescription>
                  Oversee business listings, subscriptions, and compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border shadow-md bg-background">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure platform settings, permissions, and system parameters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;