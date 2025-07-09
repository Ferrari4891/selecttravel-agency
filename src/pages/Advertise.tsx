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
  const features = [
    "Business listing visibility",
    "Customer review management", 
    "Social media integration",
    "Analytics dashboard access",
    "Priority customer support"
  ];

  const plans = [
    {
      name: "Trial",
      price: "Free for 30 days",
      description: "Perfect for testing our platform",
      features: [true, false, false, false, false]
    },
    {
      name: "DIY", 
      price: "$10.00 per week",
      description: "Self-service advertising solution",
      features: [true, true, true, false, false]
    },
    {
      name: "Serviced",
      price: "$20.00 per week", 
      description: "Full-service advertising management",
      features: [true, true, true, true, true]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src={heroAdvertise} 
          alt="Advertise Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            ADVERTISE
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
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

        {/* Desktop Table View */}
        <Card className="max-w-4xl mx-auto hidden md:block">
          <CardHeader>
            <CardTitle>Pricing Plans</CardTitle>
            <CardDescription>
              Compare our advertising packages and find the right fit for your business needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Features</TableHead>
                    {plans.map((plan) => (
                      <TableHead key={plan.name} className="text-center">
                        <div className="space-y-2">
                          <div className="font-semibold text-lg">{plan.name}</div>
                          <div className="text-primary font-bold">{plan.price}</div>
                          <div className="text-sm text-muted-foreground">{plan.description}</div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature, index) => (
                    <TableRow key={feature}>
                      <TableCell className="font-medium">{feature}</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.name} className="text-center">
                          {plan.features[index] ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium">Get Started</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.name} className="text-center">
                        <Button 
                          variant={plan.name === "Serviced" ? "default" : "outline"}
                          className="w-full"
                        >
                          Choose {plan.name}
                        </Button>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mobile Stacked Cards View */}
        <div className="md:hidden space-y-6">
          {plans.map((plan) => (
            <Card key={plan.name} className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-2xl font-bold text-primary">{plan.price}</div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={feature} className="flex items-center justify-between py-2 border-b border-border/50">
                        <span className="text-sm font-medium">{feature}</span>
                        {plan.features[index] ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-4">
                  <Button 
                    variant={plan.name === "Serviced" ? "default" : "outline"}
                    className="w-full"
                  >
                    More Info {plan.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need a custom solution? Contact our sales team for enterprise pricing and features.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Advertise;