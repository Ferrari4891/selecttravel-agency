import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroAdvertise from "@/assets/hero-advertise.jpg";
const Advertise = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  
  const features = [
    "Business Profile Management",
    "Analytics Dashboard",
    "Mobile App Access",
    "Team Management",
    "Custom Integrations",
    "API Access",
    "Priority Support",
    "Unlimited Records"
  ];
  
  const plans = [
    {
      id: "trial",
      name: "Economy Class",
      price: { monthly: 0, quarterly: 0, annual: 0 },
      description: "Free forever",
      features: [true, true, true, false, false, false, false, false]
    },
    {
      id: "economy", 
      name: "Business Class",
      price: { monthly: 45, quarterly: 121.5, annual: 486 },
      description: "Perfect for businesses who want to manage themselves - 10% off yearly",
      features: [true, true, true, true, true, true, true, false]
    },
    {
      id: "firstclass",
      name: "First Class", 
      price: { monthly: 90, quarterly: 243, annual: 864 },
      description: "Complete solution with full service support - 20% off annually",
      features: [true, true, true, true, true, true, true, true]
    }
  ];
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
      </div>
      
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden border-8 border-white rounded-none shadow-[0_8px_12px_-4px_rgba(169,169,169,0.4),_-6px_8px_12px_-4px_rgba(169,169,169,0.3),_6px_8px_12px_-4px_rgba(169,169,169,0.3)]">
        <img src={heroAdvertise} alt="Advertise Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white md:text-9xl">ADVERTISING PLANS</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 bg-sky-50">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Advertise Your Business</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to showcase your business and reach more customers. 
            All plans include access to our comprehensive business directory platform.
          </p>
        </div>

        {/* Billing Cycle Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border-8 border-white shadow-md rounded-none p-1">
            <div className="flex">
              {[
                { id: 'monthly', label: 'Monthly' },
                { id: 'quarterly', label: 'Quarterly', savings: '10%' },
                { id: 'annual', label: 'Annual', savings: '20%' }
              ].map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedPlan(cycle.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedPlan === cycle.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
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

        {/* Desktop Table View */}
        <Card className="max-w-4xl mx-auto hidden md:block">
          <CardHeader>
            <CardTitle className="text-6xl text-blue-400">Pricing Plans</CardTitle>
            <CardDescription>
              Compare our advertising packages and find the right fit for your business needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4 text-left">Features</TableHead>
                    {plans.map(plan => <TableHead key={plan.name} className="text-center">
                        <div className="space-y-2">
                          <div className="font-semibold text-lg text-center">{plan.name}</div>
                          <div className="text-primary font-bold text-center">
                            ${plan.price[selectedPlan as keyof typeof plan.price]}
                            <span className="text-sm font-normal text-muted-foreground">
                              /{selectedPlan === 'monthly' ? 'mo' : 
                                 selectedPlan === 'quarterly' ? 'quarter' : 'year'}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground text-center">{plan.description}</div>
                        </div>
                      </TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature, index) => <TableRow key={feature}>
                      <TableCell className="font-medium text-left">{feature}</TableCell>
                      {plans.map(plan => <TableCell key={plan.name} className="text-center">
                          {plan.features[index] ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                        </TableCell>)}
                    </TableRow>)}
                  <TableRow>
                    <TableCell className="font-medium text-left">Calculate ROI</TableCell>
                    {plans.map(plan => <TableCell key={plan.name} className="text-center">
                        <Button variant={plan.name === "First Class" ? "default" : "outline"} className="w-full" asChild>
                          <Link to="/roi">
                            Check ROI
                          </Link>
                        </Button>
                      </TableCell>)}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-left">Get Started</TableCell>
                    {plans.map(plan => <TableCell key={plan.name} className="text-center">
                        <Button variant={plan.name === "First Class" ? "default" : "outline"} className="w-full">
                          Choose {plan.name}
                        </Button>
                      </TableCell>)}
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mobile Stacked Cards View */}
        <div className="md:hidden space-y-6">
          {plans.map(plan => <Card key={plan.name} className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-2xl font-bold text-primary">
                  ${plan.price[selectedPlan as keyof typeof plan.price]}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{selectedPlan === 'monthly' ? 'mo' : 
                       selectedPlan === 'quarterly' ? 'quarter' : 'year'}
                  </span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {features.map((feature, index) => <div key={feature} className="flex items-center justify-between py-2 border-b border-border/50">
                        <span className="text-sm font-medium">{feature}</span>
                        {plan.features[index] ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-muted-foreground" />}
                      </div>)}
                  </div>
                </ScrollArea>
                <div className="mt-4 space-y-2">
                  <Button variant={plan.name === "First Class" ? "default" : "outline"} className="w-full" asChild>
                    <Link to="/roi">
                      Check ROI
                    </Link>
                  </Button>
                  <Button variant={plan.name === "First Class" ? "default" : "outline"} className="w-full">
                    More Info {plan.name}
                  </Button>
                </div>
              </CardContent>
            </Card>)}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need a custom solution? Contact our sales team for enterprise pricing and features.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Advertise;