import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, Eye, Users, MapPin, Ticket, CreditCard, 
  Activity, DollarSign, Calendar, BarChart3 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

interface ComprehensiveAnalyticsProps {
  businessId: string;
  subscriptionTier: string;
}

interface AnalyticsSummary {
  online: {
    total_views: number;
    unique_visitors: number;
    today: number;
    this_week: number;
    this_month: number;
  };
  physical: {
    total_visits: number;
    unique_members: number;
    today: number;
    this_week: number;
    this_month: number;
  };
  vouchers: {
    active_vouchers: number;
    total_vouchers: number;
    total_redemptions: number;
  };
  gift_cards: {
    active_cards: number;
    total_amount: number;
    redeemed_count: number;
  };
}

export function ComprehensiveAnalytics({ businessId, subscriptionTier }: ComprehensiveAnalyticsProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsSummary();
    fetchDetailedData();
    
    // Set up real-time subscriptions
    const viewsChannel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'business_views',
          filter: `business_id=eq.${businessId}`
        },
        () => {
          fetchAnalyticsSummary();
          fetchDetailedData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'member_visits',
          filter: `business_id=eq.${businessId}`
        },
        () => {
          fetchAnalyticsSummary();
          fetchDetailedData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(viewsChannel);
    };
  }, [businessId, timeRange]);

  const fetchAnalyticsSummary = async () => {
    try {
      const { data, error } = await supabase.rpc('get_business_analytics_summary', {
        p_business_id: businessId,
        p_days: parseInt(timeRange)
      });

      if (error) throw error;
      if (data) {
        setSummary(data as unknown as AnalyticsSummary);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedData = async () => {
    try {
      const daysAgo = parseInt(timeRange);
      const startDate = subDays(new Date(), daysAgo);

      // Fetch online views
      const { data: views } = await supabase
        .from('business_views')
        .select('viewed_at, visitor_ip')
        .eq('business_id', businessId)
        .gte('viewed_at', startDate.toISOString());

      // Fetch physical visits
      const { data: visits } = await supabase
        .from('member_visits')
        .select('visit_date, card_id')
        .eq('business_id', businessId)
        .gte('visit_date', startDate.toISOString());

      // Process daily data
      const dailyMap = new Map<string, { date: string; online: number; physical: number }>();
      
      for (let i = 0; i < daysAgo; i++) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        dailyMap.set(dateStr, {
          date: format(date, 'MMM dd'),
          online: 0,
          physical: 0
        });
      }

      views?.forEach(v => {
        const dateStr = format(new Date(v.viewed_at), 'yyyy-MM-dd');
        const data = dailyMap.get(dateStr);
        if (data) data.online++;
      });

      visits?.forEach(v => {
        const dateStr = format(new Date(v.visit_date), 'yyyy-MM-dd');
        const data = dailyMap.get(dateStr);
        if (data) data.physical++;
      });

      const sortedDaily = Array.from(dailyMap.values()).reverse();
      setDailyData(sortedDaily);

      // Process hourly data for today
      const hourlyMap = new Map<number, { hour: string; views: number; visits: number }>();
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, {
          hour: `${i.toString().padStart(2, '0')}:00`,
          views: 0,
          visits: 0
        });
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      views?.forEach(v => {
        const viewDate = new Date(v.viewed_at);
        if (format(viewDate, 'yyyy-MM-dd') === today) {
          const hour = viewDate.getHours();
          const data = hourlyMap.get(hour);
          if (data) data.views++;
        }
      });

      visits?.forEach(v => {
        const visitDate = new Date(v.visit_date);
        if (format(visitDate, 'yyyy-MM-dd') === today) {
          const hour = visitDate.getHours();
          const data = hourlyMap.get(hour);
          if (data) data.visits++;
        }
      });

      setHourlyData(Array.from(hourlyMap.values()));
    } catch (error) {
      console.error('Error fetching detailed data:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    );
  }

  const totalInteractions = summary.online.total_views + summary.physical.total_visits;
  const todayTotal = summary.online.today + summary.physical.today;
  const weekTotal = summary.online.this_week + summary.physical.this_week;

  const channelData = [
    { name: 'Online', value: summary.online.total_views, color: 'hsl(var(--primary))' },
    { name: 'Physical', value: summary.physical.total_visits, color: 'hsl(var(--secondary))' }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={(val) => setTimeRange(val as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="online">Online</TabsTrigger>
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="h-4 w-4 text-primary" />
                  Total Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All channels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayTotal}</div>
                <p className="text-xs text-muted-foreground">Online + Physical</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weekTotal}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  Unique Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(summary.online.unique_visitors + summary.physical.unique_members).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total unique</p>
              </CardContent>
            </Card>
          </div>

          {/* Channel Distribution */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interaction Channels</CardTitle>
                <CardDescription>Distribution of online vs physical interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Trend</CardTitle>
                <CardDescription>Online and physical interactions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="online" stroke="hsl(var(--primary))" strokeWidth={2} name="Online" />
                    <Line type="monotone" dataKey="physical" stroke="hsl(var(--secondary))" strokeWidth={2} name="Physical" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Today's Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Hourly Activity</CardTitle>
              <CardDescription>Real-time breakdown by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(var(--primary))" name="Online Views" />
                  <Bar dataKey="visits" fill="hsl(var(--secondary))" name="Physical Visits" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONLINE TAB */}
        <TabsContent value="online" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Eye className="h-4 w-4" />
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.online.total_views.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Unique Visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.online.unique_visitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Unique IPs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.online.this_week}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.online.today}</div>
                <p className="text-xs text-muted-foreground">So far</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Online Views Trend</CardTitle>
              <CardDescription>Daily online views over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="online" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PHYSICAL TAB */}
        <TabsContent value="physical" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  Total Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.physical.total_visits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Unique Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.physical.unique_members.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Different members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.physical.this_week}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.physical.today}</div>
                <p className="text-xs text-muted-foreground">So far</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Physical Visits Trend</CardTitle>
              <CardDescription>Daily member visits over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="physical" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Ticket className="h-4 w-4" />
                  Active Vouchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.vouchers.active_vouchers}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <BarChart3 className="h-4 w-4" />
                  Total Redemptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.vouchers.total_redemptions}</div>
                <p className="text-xs text-muted-foreground">All vouchers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4" />
                  Active Gift Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.gift_cards.active_cards}</div>
                <p className="text-xs text-muted-foreground">Unredeemed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  Gift Card Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.gift_cards.total_amount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Active balance</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Performance</CardTitle>
                <CardDescription>Overview of your voucher program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50">
                  <span className="text-sm font-medium">Total Vouchers Created</span>
                  <span className="text-lg font-bold">{summary.vouchers.total_vouchers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50">
                  <span className="text-sm font-medium">Currently Active</span>
                  <span className="text-lg font-bold text-primary">{summary.vouchers.active_vouchers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50">
                  <span className="text-sm font-medium">Total Redemptions</span>
                  <span className="text-lg font-bold text-secondary">{summary.vouchers.total_redemptions}</span>
                </div>
                {summary.vouchers.total_vouchers > 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted/50">
                    <span className="text-sm font-medium">Avg Redemptions per Voucher</span>
                    <span className="text-lg font-bold">
                      {(summary.vouchers.total_redemptions / summary.vouchers.total_vouchers).toFixed(1)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gift Card Metrics</CardTitle>
                <CardDescription>Gift card sales and redemptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50">
                  <span className="text-sm font-medium">Active Cards</span>
                  <span className="text-lg font-bold">{summary.gift_cards.active_cards}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50">
                  <span className="text-sm font-medium">Redeemed Cards</span>
                  <span className="text-lg font-bold">{summary.gift_cards.redeemed_count}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50">
                  <span className="text-sm font-medium">Active Balance</span>
                  <span className="text-lg font-bold text-primary">${summary.gift_cards.total_amount.toFixed(2)}</span>
                </div>
                {(summary.gift_cards.active_cards + summary.gift_cards.redeemed_count) > 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted/50">
                    <span className="text-sm font-medium">Redemption Rate</span>
                    <span className="text-lg font-bold">
                      {((summary.gift_cards.redeemed_count / (summary.gift_cards.active_cards + summary.gift_cards.redeemed_count)) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tier Recommendation */}
      {subscriptionTier !== 'firstclass' && totalInteractions > 50 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Upgrade Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your {totalInteractions} interactions, upgrading to <strong>First Class</strong> would give you:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary" />
                Real-time analytics updates
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary" />
                Member QR code scanning
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary" />
                Advanced voucher management
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary" />
                Priority support
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
