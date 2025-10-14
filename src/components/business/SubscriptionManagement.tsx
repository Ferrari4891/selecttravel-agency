import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X } from 'lucide-react';

interface SubscriptionManagementProps {
  business: any;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  annual_discount_percentage: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ business }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      setSubscriptionPlans((data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? (plan.features as string[]) : []
      })));
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    // Note: This would integrate with Stripe in a real implementation
    toast({
      title: "Stripe Integration Required",
      description: "To enable subscriptions, you'll need to set up Stripe integration with your secret key.",
      variant: "destructive",
    });
  };

  if (loading) {
    return <div className="p-6">Loading subscription plans...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {business?.subscription_tier ? 
                  subscriptionPlans.find(p => p.tier === business.subscription_tier)?.name || 'Unknown Plan'
                  : 'Trial Plan'
                }
              </h3>
              <p className="text-sm text-muted-foreground">
                Status: {business?.subscription_status || 'trial'}
              </p>
              {business?.subscription_end_date && (
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(business.subscription_end_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <Badge variant={business?.subscription_status === 'active' ? 'default' : 'secondary'}>
              {business?.subscription_status || 'Trial'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>
            Select the plan that best fits your business needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={selectedPlan === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPlan('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={selectedPlan === 'annual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPlan('annual')}
              >
                Annual (Save up to 17%)
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {subscriptionPlans.map((plan) => {
              const currentPrice = selectedPlan === 'monthly' ? plan.monthly_price : plan.annual_price;
              const isCurrentPlan = business?.subscription_tier === plan.tier;
              const isPopular = plan.tier === 'firstclass'; // Most premium plan is popular
              
              return (
                <Card key={plan.tier} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${isPopular ? 'border-primary' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge>Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {isCurrentPlan && <Badge variant="outline">Current</Badge>}
                    </CardTitle>
                    <div className="text-3xl font-bold">
                      ${currentPrice}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{selectedPlan === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {selectedPlan === 'annual' && plan.annual_discount_percentage > 0 && (
                      <div className="text-sm text-green-600">
                        Save {plan.annual_discount_percentage}% with annual billing
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan ? "outline" : "default"}
                      disabled={isCurrentPlan}
                      onClick={() => handleUpgrade(plan.tier)}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {(!business?.subscription_tier || business?.subscription_tier === 'trial') && (
        <Card>
          <CardHeader>
            <CardTitle>Trial Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You're currently on a trial plan with limited features. Upgrade to unlock the full potential of your business listing.
            </p>
            <Button onClick={() => handleUpgrade('economy')} className="w-full">
              Choose a Plan to Get Started
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { SubscriptionManagement };