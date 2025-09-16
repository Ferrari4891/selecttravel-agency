import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, TrendingUp, Users, Building2, CreditCard, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TestMarketAnalyticsProps {
  city: string;
}

interface AnalyticsData {
  subscriptionDistribution: Array<{ name: string; value: number; color: string }>;
  monthlySignups: Array<{ month: string; signups: number; upgrades: number }>;
  tierConversion: Array<{ tier: string; conversions: number; revenue: number }>;
  businessTypes: Array<{ type: string; count: number }>;
}

export const TestMarketAnalytics: React.FC<TestMarketAnalyticsProps> = ({ city }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    subscriptionDistribution: [],
    monthlySignups: [],
    tierConversion: [],
    businessTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [city, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch businesses for the selected city
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('city', city);

      if (error) throw error;

      // Process subscription distribution
      const subscriptionCounts = {
        trial: businesses?.filter(b => b.subscription_status === 'trial').length || 0,
        basic: businesses?.filter(b => b.subscription_tier === 'basic' && b.subscription_status === 'active').length || 0,
        premium: businesses?.filter(b => b.subscription_tier === 'premium' && b.subscription_status === 'active').length || 0,
        firstclass: businesses?.filter(b => b.subscription_tier === 'firstclass' && b.subscription_status === 'active').length || 0
      };

      const subscriptionDistribution = [
        { name: 'Trial', value: subscriptionCounts.trial, color: '#64748b' },
        { name: 'Basic', value: subscriptionCounts.basic, color: '#3b82f6' },
        { name: 'Premium', value: subscriptionCounts.premium, color: '#8b5cf6' },
        { name: 'First Class', value: subscriptionCounts.firstclass, color: '#f59e0b' }
      ];

      // Process business types
      const typeGroups = businesses?.reduce((acc: Record<string, number>, business) => {
        acc[business.business_type] = (acc[business.business_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const businessTypes = Object.entries(typeGroups).map(([type, count]) => ({
        type,
        count: count as number
      }));

      // Generate mock monthly data (in a real app, this would come from actual data)
      const monthlySignups = [
        { month: 'Jan', signups: 5, upgrades: 1 },
        { month: 'Feb', signups: 8, upgrades: 2 },
        { month: 'Mar', signups: 12, upgrades: 4 },
        { month: 'Apr', signups: 15, upgrades: 6 },
        { month: 'May', signups: 18, upgrades: 8 },
        { month: 'Jun', signups: 22, upgrades: 10 }
      ];

      // Mock tier conversion data
      const tierConversion = [
        { tier: 'Trial → Basic', conversions: 12, revenue: 1440 },
        { tier: 'Basic → Premium', conversions: 8, revenue: 1600 },
        { tier: 'Premium → First Class', conversions: 4, revenue: 1200 },
        { tier: 'Trial → Premium', conversions: 3, revenue: 900 },
        { tier: 'Trial → First Class', conversions: 2, revenue: 600 }
      ];

      setAnalyticsData({
        subscriptionDistribution,
        monthlySignups,
        tierConversion,
        businessTypes
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const totalBusinesses = analyticsData.subscriptionDistribution.reduce((sum, item) => sum + item.value, 0);
  const totalRevenue = analyticsData.tierConversion.reduce((sum, item) => sum + item.revenue, 0);
  const conversionRate = totalBusinesses > 0 ? ((totalBusinesses - analyticsData.subscriptionDistribution.find(s => s.name === 'Trial')?.value || 0) / totalBusinesses * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48 rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{totalBusinesses}</div>
            <div className="text-sm text-muted-foreground">Total Businesses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">${totalRevenue}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData.monthlySignups[analyticsData.monthlySignups.length - 1]?.signups || 0}
            </div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analyticsData.subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Business Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlySignups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} name="New Signups" />
                <Line type="monotone" dataKey="upgrades" stroke="#10b981" strokeWidth={2} name="Upgrades" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Business Types */}
        <Card>
          <CardHeader>
            <CardTitle>Business Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.businessTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tier Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.tierConversion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'conversions' ? 'Conversions' : 'Revenue']} />
                <Bar dataKey="conversions" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};