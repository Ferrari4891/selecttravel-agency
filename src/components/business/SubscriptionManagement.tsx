import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

interface SubscriptionManagementProps {
  business: any;
}

const subscriptionPlans = [
  {
    id: 'trial',
    name: 'Economy Class - Free',
    price: { monthly: 0, annual: 0 },
    features: [
      'Business Profile Management',
      'Basic Analytics Dashboard',
      'Up to 100 records',
      'Email Support',
      'Mobile App Access'
    ],
    limitations: [
      'Free forever',
      'Basic features only'
    ]
  },
  {
    id: 'economy',
    name: 'Business Class',
    price: { monthly: 45, annual: 486 },
    features: [
      'Everything in Free Plan',
      'Advanced Analytics & Reports',
      'Up to 10,000 records',
      'Priority Support',
      'Custom Integrations',
      'Advanced Team Management',
      'API Access',
      'Data Export/Import'
    ],
    limitations: [
      'Self-service support',
      'Limited customization'
    ]
  },
  {
    id: 'firstclass',
    name: 'First Class',
    price: { monthly: 90, annual: 864 },
    features: [
      'Everything in Economy Class',
      'Unlimited Records',
      'White-label Options',
      'Dedicated Account Manager',
      'Custom Development',
      'Advanced Security Features',
      'Unlimited Team Members',
      'SLA Guarantee',
      'Full Service Support'
    ],
    limitations: []
  }
];

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ business }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { toast } = useToast();

  const handleUpgrade = async (planId: string, planType: string) => {
    // Note: This would integrate with Stripe in a real implementation
    toast({
      title: "Stripe Integration Required",
      description: "To enable subscriptions, you'll need to set up Stripe integration with your secret key.",
      variant: "destructive",
    });
  };

  const currentTier = business?.subscription_tier || 'trial';
  const currentStatus = business?.subscription_status || 'trial';

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card className="border-8 border-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Current Subscription</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Your current plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {currentTier === 'trial' ? 'Economy Class - Free' : 
                   currentTier === 'economy' ? 'Business Class' :
                   currentTier === 'firstclass' ? 'First Class' :
                   currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
                </h3>
                <Badge variant={currentStatus === 'active' ? 'default' : 'secondary'}>
                  {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                </Badge>
              </div>
              {business?.subscription_end_date && (
                <p className="text-sm text-gray-600">
                  {currentStatus === 'trial' ? 'Trial ends:' : 'Next billing:'} {
                    new Date(business.subscription_end_date).toLocaleDateString()
                  }
                </p>
              )}
            </div>
            {currentStatus === 'active' && (
              <Button variant="outline">
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Cycle Selection */}
      <div className="flex justify-center">
        <div className="bg-white border-8 border-white shadow-md rounded-lg p-1">
          <div className="flex">
            {[
              { id: 'monthly', label: 'Monthly' },
              { id: 'annual', label: 'Annual', savings: '20%' }
            ].map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => setSelectedPlan(cycle.id)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedPlan === cycle.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cycle.label}
                {cycle.savings && (
                  <span className="ml-1 text-xs">
                    (Save {cycle.savings})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-6">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = currentTier === plan.id;
          const price = plan.price[selectedPlan as keyof typeof plan.price];
          
          return (
            <Card 
              key={plan.id} 
              className={`border-8 border-white shadow-md relative ${
                isCurrentPlan ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.id === 'economy' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${price}
                  <span className="text-sm font-normal text-gray-600">
                     /{selectedPlan === 'monthly' ? 'mo' : 'year'}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Included:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Limitations:</h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? "secondary" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => handleUpgrade(plan.id, selectedPlan)}
                  >
                    {isCurrentPlan ? 'Current Plan' : 
                     currentTier === 'trial' ? 'Start Subscription' : 'Upgrade'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trial Information */}
      {currentTier === 'trial' && (
        <Card className="border-8 border-white shadow-md bg-background">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Your Currently In Economy Class
              </h3>
              <p className="text-gray-600 mb-4">
                Upgrade to unlock advanced features and continue managing your business effectively.
              </p>
              <div className="text-sm text-gray-500">
                Economy class is FREE forever
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};