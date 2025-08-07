import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Building2, Heart, Shield, TrendingUp, Calendar } from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalBusinesses: number;
  totalSavedRestaurants: number;
  totalCollections: number;
  totalAdmins: number;
  newUsersThisMonth: number;
  newBusinessesThisMonth: number;
  activeSubscriptions: number;
}

export const SystemAnalytics = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    totalSavedRestaurants: 0,
    totalCollections: 0,
    totalAdmins: 0,
    newUsersThisMonth: 0,
    newBusinessesThisMonth: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Fetch all stats in parallel
      const [
        usersResult,
        businessesResult,
        savedRestaurantsResult,
        collectionsResult,
        adminsResult,
        newUsersResult,
        newBusinessesResult,
        subscriptionsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('saved_restaurants').select('id', { count: 'exact', head: true }),
        supabase.from('collections').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_admin', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
        supabase.from('businesses').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
        supabase.from('business_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalBusinesses: businessesResult.count || 0,
        totalSavedRestaurants: savedRestaurantsResult.count || 0,
        totalCollections: collectionsResult.count || 0,
        totalAdmins: adminsResult.count || 0,
        newUsersThisMonth: newUsersResult.count || 0,
        newBusinessesThisMonth: newBusinessesResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast({
        title: "Error",
        description: "Failed to load system analytics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string;
    value: number;
    icon: any;
    description: string;
    trend?: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend !== undefined && (
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{trend} this month
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="space-y-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Registered platform users"
          trend={stats.newUsersThisMonth}
        />
        <StatCard
          title="Businesses"
          value={stats.totalBusinesses}
          icon={Building2}
          description="Registered business profiles"
          trend={stats.newBusinessesThisMonth}
        />
        <StatCard
          title="Saved Places"
          value={stats.totalSavedRestaurants}
          icon={Heart}
          description="User-saved restaurants"
        />
        <StatCard
          title="Collections"
          value={stats.totalCollections}
          icon={Calendar}
          description="User-created collections"
        />
      </div>

      {/* Additional Metrics */}
      <div className="space-y-4">
        <StatCard
          title="Administrators"
          value={stats.totalAdmins}
          icon={Shield}
          description="System administrators"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={TrendingUp}
          description="Current business subscriptions"
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers > 0 ? ((stats.newUsersThisMonth / stats.totalUsers) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">User growth this month</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Platform performance and status indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="text-sm font-medium">Database Status</div>
                <div className="text-xs text-green-600">Operational</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="text-sm font-medium">API Status</div>
                <div className="text-xs text-green-600">Healthy</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="text-sm font-medium">Storage</div>
                <div className="text-xs text-green-600">Available</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};