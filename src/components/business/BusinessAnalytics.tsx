import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { RealTimeAnalytics } from './RealTimeAnalytics';
import { VoucherManagement } from './VoucherManagement';

interface BusinessAnalyticsProps {
  businessId: string;
  subscriptionTier: string;
}

interface AnalyticsData {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
}

const metricTypes = [
  'revenue', 'customers', 'orders', 'website_visits', 
  'conversion_rate', 'customer_satisfaction', 'inventory_turnover'
];

export const BusinessAnalytics: React.FC<BusinessAnalyticsProps> = ({ businessId, subscriptionTier }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newMetric, setNewMetric] = useState({
    metric_name: '',
    metric_value: '',
    metric_date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [businessId]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('business_analytics')
        .select('*')
        .eq('business_id', businessId)
        .order('metric_date', { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);
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

  const addMetric = async () => {
    if (!newMetric.metric_name || !newMetric.metric_value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('business_analytics')
        .insert({
          business_id: businessId,
          metric_name: newMetric.metric_name,
          metric_value: parseFloat(newMetric.metric_value),
          metric_date: newMetric.metric_date,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metric added successfully!",
      });

      setNewMetric({
        metric_name: '',
        metric_value: '',
        metric_date: new Date().toISOString().split('T')[0],
      });

      fetchAnalytics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add metric.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const getChartData = (metricName: string) => {
    return analytics
      .filter(item => item.metric_name === metricName)
      .map(item => ({
        date: item.metric_date,
        value: item.metric_value,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMetricSummary = () => {
    const summary: { [key: string]: { total: number; count: number; avg: number } } = {};
    
    analytics.forEach(item => {
      if (!summary[item.metric_name]) {
        summary[item.metric_name] = { total: 0, count: 0, avg: 0 };
      }
      summary[item.metric_name].total += item.metric_value;
      summary[item.metric_name].count += 1;
      summary[item.metric_name].avg = summary[item.metric_name].total / summary[item.metric_name].count;
    });

    return summary;
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  const metricSummary = getMetricSummary();
  const uniqueMetrics = [...new Set(analytics.map(item => item.metric_name))];

  return (
    <Tabs defaultValue="metrics" className="space-y-6">
      <TabsList className="flex flex-col w-full gap-2">
        <TabsTrigger value="metrics" className="w-full">Business Metrics</TabsTrigger>
        <TabsTrigger value="realtime" className="w-full">Real-Time Analytics</TabsTrigger>
        <TabsTrigger value="vouchers" className="w-full">Voucher Management</TabsTrigger>
      </TabsList>

      <TabsContent value="metrics" className="space-y-6">
        {/* Add New Metric */}
        <Card className="border-8 border-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Add New Metric</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Track your business performance by adding key metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="metric_name">Metric Type</Label>
                <Select 
                  value={newMetric.metric_name} 
                  onValueChange={(value) => setNewMetric({ ...newMetric, metric_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="metric_value">Value</Label>
                <Input
                  id="metric_value"
                  type="number"
                  step="0.01"
                  value={newMetric.metric_value}
                  onChange={(e) => setNewMetric({ ...newMetric, metric_value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="metric_date">Date</Label>
                <Input
                  id="metric_date"
                  type="date"
                  value={newMetric.metric_date}
                  onChange={(e) => setNewMetric({ ...newMetric, metric_date: e.target.value })}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={addMetric} disabled={adding}>
                  {adding ? "Adding..." : "Add Metric"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Summary */}
        {Object.keys(metricSummary).length > 0 && (
          <div className="space-y-4">
            {Object.entries(metricSummary).slice(0, 6).map(([metric, data]) => (
              <Card key={metric} className="border-8 border-white shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">
                    {metric.charAt(0).toUpperCase() + metric.slice(1).replace('_', ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{data.avg.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground mt-1">Average value</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts */}
        {uniqueMetrics.length > 0 && (
          <div className="space-y-4">
            {uniqueMetrics.slice(0, 4).map((metric) => {
              const chartData = getChartData(metric);
              if (chartData.length === 0) return null;

              return (
                <Card key={metric} className="border-8 border-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {metric.charAt(0).toUpperCase() + metric.slice(1).replace('_', ' ')} Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {analytics.length === 0 && (
          <Card className="border-8 border-white shadow-md">
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No analytics data yet. Start by adding your first metric!</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="realtime">
        <RealTimeAnalytics businessId={businessId} subscriptionTier={subscriptionTier} />
      </TabsContent>

      <TabsContent value="vouchers">
        <VoucherManagement businessId={businessId} subscriptionTier={subscriptionTier} />
      </TabsContent>
    </Tabs>
  );
};