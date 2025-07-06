import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Advertise Your Business</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to showcase your business and reach more customers. 
            All plans include access to our comprehensive business directory platform.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Pricing Plans</CardTitle>
            <CardDescription>
              Compare our advertising packages and find the right fit for your business needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need a custom solution? Contact our sales team for enterprise pricing and features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Advertise;