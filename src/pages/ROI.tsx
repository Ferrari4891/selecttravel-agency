import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroAdvertise from "@/assets/hero-advertise.jpg";
const ROI = () => {
  const [customerValue, setCustomerValue] = useState<number>(0);
  const [customersPerWeek, setCustomersPerWeek] = useState<number>(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState<number>(0);
  const [yourPlan, setYourPlan] = useState<number>(0);
  const [roi, setRoi] = useState<number>(0);

  // Calculate weekly revenue when customer value or customers per week changes
  useEffect(() => {
    const revenue = customerValue * customersPerWeek;
    setWeeklyRevenue(revenue);
  }, [customerValue, customersPerWeek]);

  // Calculate ROI when weekly revenue or plan changes
  useEffect(() => {
    if (yourPlan > 0) {
      const roiValue = weeklyRevenue / yourPlan;
      setRoi(roiValue);
    } else {
      setRoi(0);
    }
  }, [weeklyRevenue, yourPlan]);

  // Generate customer value options from $10 to $200 in $10 increments
  const customerValueOptions = Array.from({
    length: 20
  }, (_, i) => (i + 1) * 10);

  // Generate customers per week options from 1 to 50
  const customersPerWeekOptions = Array.from({
    length: 50
  }, (_, i) => i + 1);
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
      </div>
      
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden border-8 border-white rounded-none shadow-[0_8px_12px_-4px_rgba(169,169,169,0.4),_-6px_8px_12px_-4px_rgba(169,169,169,0.3),_6px_8px_12px_-4px_rgba(169,169,169,0.3)]">
        <img src={heroAdvertise} alt="ROI Calculator Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white md:text-6xl">ROI CALCULATOR</h1>
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
          <h2 className="text-3xl font-bold mb-4 text-blue-400">Calculate Your Return on Investment</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use our ROI calculator to see how our advertising plans can benefit your business.
          </p>
        </div>

        {/* ROI Calculator Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              ROI Calculator
            </CardTitle>
            <CardDescription>
              Enter your business details below to calculate your potential return on investment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Average Customer Value */}
            <div className="space-y-2">
              <Label htmlFor="customer-value" className="bg-sky-100">Average Customer Value</Label>
              <Select onValueChange={value => setCustomerValue(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select average customer value" />
                </SelectTrigger>
                <SelectContent>
                  {customerValueOptions.map(value => <SelectItem key={value} value={value.toString()}>
                      ${value}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Customers Per Week */}
            <div className="space-y-2">
              <Label htmlFor="customers-per-week">Customers Per Week</Label>
              <Select onValueChange={value => setCustomersPerWeek(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customers per week" />
                </SelectTrigger>
                <SelectContent>
                  {customersPerWeekOptions.map(value => <SelectItem key={value} value={value.toString()}>
                      {value} customer{value !== 1 ? 's' : ''}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Weekly Revenue (Calculated) */}
            <div className="space-y-2">
              <Label htmlFor="weekly-revenue">Total Weekly Customer Value</Label>
              <Input id="weekly-revenue" value={`$${weeklyRevenue.toFixed(2)}`} readOnly className="bg-muted" />
            </div>

            {/* Your Plan */}
            <div className="space-y-2">
              <Label htmlFor="your-plan">Your Plan</Label>
              <Select onValueChange={value => setYourPlan(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">$10 per week</SelectItem>
                  <SelectItem value="20">$20 per week</SelectItem>
                  <SelectItem value="40">$40 per week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ROI (Calculated) */}
            <div className="space-y-2">
              <Label htmlFor="roi">ROI (Return on Investment)</Label>
              <Input id="roi" value={roi > 0 ? `${roi.toFixed(2)}x` : "Select values above"} readOnly className="bg-muted font-bold text-lg" />
            </div>

            {/* ROI Explanation */}
            {roi > 0 && <div className="p-4 bg-primary/10 rounded-md">
                <h3 className="font-semibold text-primary mb-2">Your ROI Analysis:</h3>
                <p className="text-sm text-muted-foreground">
                  For every $1 you spend on advertising, you'll generate ${roi.toFixed(2)} in revenue.
                  {roi > 2 && " This is an excellent return on investment!"}
                  {roi > 1 && roi <= 2 && " This is a good return on investment."}
                  {roi <= 1 && " Consider reviewing your pricing or target market."}
                </p>
              </div>}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>;
};
export default ROI;