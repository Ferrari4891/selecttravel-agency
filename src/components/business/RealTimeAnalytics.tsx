import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Eye, Users, Clock } from 'lucide-react';

interface RealTimeAnalyticsProps {
  businessId: string;
  subscriptionTier: string;
}

interface ViewData {
  id: string;
  viewed_at: string;
  visitor_ip?: string;
  referrer?: string;
}

interface AnalyticsMetrics {
  totalViews: number;
  todayViews: number;
  uniqueVisitors: number;
  averageDaily: number;
  peakHour: string;
  topReferrers: { source: string; count: number }[];
  hourlyData: { hour: string; views: number }[];
  dailyData: { date: string; views: number; unique: number }[];
}

export const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({ 
  businessId, 
  subscriptionTier 
}) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalViews: 0,
    todayViews: 0,
    uniqueVisitors: 0,
    averageDaily: 0,
    peakHour: '12:00',
    topReferrers: [],
    hourlyData: [],
    dailyData: []
  });
  const [loading, setLoading] = useState(true);
  const [realTimeViews, setRealTimeViews] = useState(0);
  const { toast } = useToast();

  // Check if first class subscriber
  const isFirstClass = subscriptionTier === 'firstclass';

  useEffect(() => {
    if (!isFirstClass) return;

    fetchAnalytics();
    setupRealTimeSubscription();
  }, [businessId, isFirstClass]);

  const fetchAnalytics = async () => {
    try {
      const { data: views, error } = await supabase
        .from('business_views')
        .select('*')
        .eq('business_id', businessId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;

      if (views) {
        const processed = processAnalyticsData(views);
        setMetrics(processed);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel('business-views-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'business_views',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          setRealTimeViews(prev => prev + 1);
          // Refresh analytics every 10 new views
          if (realTimeViews % 10 === 0) {
            fetchAnalytics();
          }
          
          toast({
            title: "👁️ New View!",
            description: "Someone just viewed your business listing",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const processAnalyticsData = (views: ViewData[]): AnalyticsMetrics => {
    const now = new Date();
    const today = now.toDateString();
    
    // Basic metrics
    const totalViews = views.length;
    const todayViews = views.filter(v => new Date(v.viewed_at).toDateString() === today).length;
    const uniqueVisitors = new Set(views.map(v => v.visitor_ip).filter(Boolean)).size;
    
    // Daily data for last 7 days
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayViews = views.filter(v => new Date(v.viewed_at).toDateString() === dateStr);
      
      dailyData.push({
        date: date.toLocaleDateString(),
        views: dayViews.length,
        unique: new Set(dayViews.map(v => v.visitor_ip).filter(Boolean)).size
      });
    }
    
    // Hourly data for today
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      const hourViews = views.filter(v => {
        const viewDate = new Date(v.viewed_at);
        return viewDate.toDateString() === today && viewDate.getHours() === hour;
      }).length;
      
      hourlyData.push({ hour: hourStr, views: hourViews });
    }
    
    // Peak hour
    const peakHourData = hourlyData.reduce((max, current) => 
      current.views > max.views ? current : max, hourlyData[0]
    );
    
    // Top referrers
    const referrerCounts: { [key: string]: number } = {};
    views.forEach(v => {
      if (v.referrer) {
        const domain = new URL(v.referrer).hostname || 'Direct';
        referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
      } else {
        referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
      }
    });
    
    const topReferrers = Object.entries(referrerCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const averageDaily = dailyData.length > 0 
      ? Math.round(dailyData.reduce((sum, day) => sum + day.views, 0) / dailyData.length)
      : 0;

    return {
      totalViews,
      todayViews,
      uniqueVisitors,
      averageDaily,
      peakHour: peakHourData?.hour || '12:00',
      topReferrers,
      hourlyData,
      dailyData
    };
  };

  if (!isFirstClass) {
    return (
      <Card className="border-8 border-white shadow-md">
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Real-Time Analytics</h3>
          <p className="text-muted-foreground mb-4">
            Upgrade to First Class to unlock real-time performance tracking and advanced analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <div>Loading real-time analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Real-time metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-8 border-white shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border-8 border-white shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayViews}</div>
            <p className="text-xs text-muted-foreground">+{realTimeViews} live</p>
          </CardContent>
        </Card>

        <Card className="border-8 border-white shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Unique Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">Total unique</p>
          </CardContent>
        </Card>

        <Card className="border-8 border-white shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Peak Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.peakHour}</div>
            <p className="text-xs text-muted-foreground">Most active</p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly views chart */}
      <Card className="border-8 border-white shadow-md">
        <CardHeader>
          <CardTitle>Today's Activity</CardTitle>
          <CardDescription>Hourly views throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly trend */}
      <Card className="border-8 border-white shadow-md">
        <CardHeader>
          <CardTitle>7-Day Trend</CardTitle>
          <CardDescription>Views and unique visitors over the last week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Total Views"
              />
              <Line 
                type="monotone" 
                dataKey="unique" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                name="Unique Visitors"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top referrers */}
      <Card className="border-8 border-white shadow-md">
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
          <CardDescription>Where your visitors are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.topReferrers.map((referrer, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{referrer.source}</span>
                <span className="text-sm font-medium">{referrer.count} views</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};