import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroAdvertise from "@/assets/hero-advertise.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

const Advertise = () => {
  const isMobile = useIsMobile();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const features = ["Business Profile Management", "Analytics Dashboard", "Mobile App Access", "Team Management", "Custom Integrations", "API Access", "Priority Support", "Unlimited Records"];
  const plans = [{
    id: "trial",
    name: "Economy Class",
    price: {
      monthly: 0,
      annual: 0
    },
    description: "Free forever",
    features: [true, true, true, false, false, false, false, false]
  }, {
    id: "economy",
    name: "Business Class",
    price: {
      monthly: 45,
      annual: 486
    },
    description: "Perfect for businesses who want to manage themselves - 10% off yearly",
    features: [true, true, true, true, true, true, true, false]
  }, {
    id: "firstclass",
    name: "First Class",
    price: {
      monthly: 90,
      annual: 864
    },
    description: "Complete solution with full service support - 20% off annually",
    features: [true, true, true, true, true, true, true, true]
  }];

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <div className="min-h-screen">
          {/* Fixed Navigation for mobile */}
          <Navigation />
          
          {/* Content container with proper top padding for fixed nav */}
          <div className="pt-20">
            {/* Hero section with background image */}
            <div 
              className="relative h-80 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroAdvertise})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 className="text-4xl font-bold text-white text-center">
                ADVERTISE
              </h1>
            </div>
            
            {/* Content area for mobile with white background */}
            <div className="bg-white px-4 py-8">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>

              <div className="text-center space-y-4">
                <h2 className="font-bold text-black text-2xl">
                  Advertise Your Business
                </h2>
                <p className="text-muted-foreground text-base">
                  Choose the perfect plan to showcase your business and reach more customers.
                </p>
              </div>

              {/* Billing Cycle Selection */}
              <div className="flex justify-center">
                <div className="bg-white border-2 border-gray-300 rounded-none p-1">
                  <div className="flex">
                    {[{
                    id: 'monthly',
                    label: 'Monthly'
                  }, {
                    id: 'annual',
                    label: 'Annual',
                    savings: '20%'
                  }].map(cycle => <button key={cycle.id} onClick={() => setSelectedPlan(cycle.id)} className={`px-4 py-2 text-sm font-medium transition-colors ${selectedPlan === cycle.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        {cycle.label}
                        {cycle.savings && <span className="ml-1 text-xs">
                            (Save {cycle.savings})
                          </span>}
                      </button>)}
                  </div>
                </div>
              </div>

              {/* Mobile Stacked Cards View */}
              <div className="space-y-6">
                {plans.map(plan => <Card key={plan.name} className="rounded-none">
                    <CardHeader className="text-center bg-black text-white">
                      <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                      <div className="text-2xl font-bold">
                        ${plan.price[selectedPlan as keyof typeof plan.price]}
                        <span className="text-sm font-normal">
                           /{selectedPlan === 'monthly' ? 'mo' : 'year'}
                        </span>
                      </div>
                      <CardDescription className="text-white/80">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3 mb-4">
                        {features.map((feature, index) => <div key={feature} className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm font-medium">{feature}</span>
                            {plan.features[index] ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-muted-foreground" />}
                          </div>)}
                      </div>
                      <div className="space-y-2">
                        <Button variant={plan.name === "First Class" ? "default" : "outline"} className="w-full rounded-none" asChild>
                          <Link to="/roi">
                            Check ROI
                          </Link>
                        </Button>
                        <Button variant={plan.name === "First Class" ? "default" : "outline"} className="w-full rounded-none">
                          Choose {plan.name}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Need a custom solution? Contact our sales team for enterprise pricing and features.
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navigation />
          
          {/* Content container with proper top padding for fixed nav */}
          <div className="pt-20">
            {/* Hero section with background image */}
            <div 
              className="relative h-80 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroAdvertise})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 className="text-4xl font-bold text-white text-center md:text-6xl">
                ADVERTISE
              </h1>
            </div>

            <div className="bg-white px-4 py-8">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Back to Home Button */}
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center space-y-4">
              <h2 className="font-bold text-black text-3xl md:text-6xl">Advertise Your Business</h2>
              <p className="text-lg font-medium text-black max-w-2xl mx-auto">
                Choose the perfect plan to showcase your business and reach more customers. 
                All plans include access to our comprehensive business directory platform.
              </p>
            </div>

            {/* Billing Cycle Selection */}
            <div className="flex justify-center">
              <div className="bg-white border-8 border-white shadow-md rounded-none p-1">
                <div className="flex">
                  {[{
                  id: 'monthly',
                  label: 'Monthly'
                }, {
                  id: 'annual',
                  label: 'Annual',
                  savings: '20%'
                }].map(cycle => <button key={cycle.id} onClick={() => setSelectedPlan(cycle.id)} className={`px-4 py-2 text-sm font-medium transition-colors ${selectedPlan === cycle.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      {cycle.label}
                      {cycle.savings && <span className="ml-1 text-xs">
                          (Save {cycle.savings})
                        </span>}
                    </button>)}
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-6xl text-foreground">Pricing Plans</CardTitle>
                <CardDescription>Compare our advertising packages and find the right fit for your business needs.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/4 text-left">Features</TableHead>
                        {plans.map(plan => <TableHead key={plan.name} className="text-center">
                            <div className="bg-primary text-primary-foreground p-4 rounded-none mb-2 h-[160px] flex flex-col justify-between text-center">
                              <div className="font-bold text-lg">{plan.name}</div>
                              <div className="text-2xl font-bold">
                                ${plan.price[selectedPlan as keyof typeof plan.price]}
                                <span className="text-sm font-normal">
                                   /{selectedPlan === 'monthly' ? 'mo' : 'year'}
                                </span>
                              </div>
                              <div className="text-sm leading-tight px-2">{plan.description}</div>
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
                            <Button variant={plan.name === "First Class" ? "default" : "outline"} className="w-full rounded-none" asChild>
                              <Link to="/roi">
                                Check ROI
                              </Link>
                            </Button>
                          </TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-left">Get Started</TableCell>
                        {plans.map(plan => <TableCell key={plan.name} className="text-center">
                            <Button variant={plan.name === "First Class" ? "default" : "outline"} className="w-full rounded-none">
                              Choose {plan.name}
                            </Button>
                          </TableCell>)}
                      </TableRow>
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Need a custom solution? Contact our sales team for enterprise pricing and features.
              </p>
            </div>
            </div>
            </div>
          </div>
          
          <Footer />
        </>
      )}
    </div>
  );
};
export default Advertise;