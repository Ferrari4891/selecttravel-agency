import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";

import heroToolbox from "@/assets/hero-toolbox.jpg";
const Toolbox = () => {
  const [videos] = useState([{
    id: "yYpJP3tIKIU",
    title: "How to Travel Smart: Essential Tips",
    description: "Learn the best practices for planning your trips and making the most of your travel experience."
  }, {
    id: "wNfWr6A1KXo",
    title: "Budget Travel Secrets",
    description: "Discover how to travel more while spending less with these insider tips and tricks."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Cultural Travel Guide",
    description: "Immerse yourself in local cultures and traditions with our comprehensive cultural travel guide."
  }]);
  const tools = [{
    id: 1,
    title: "Visa Requirements Checker",
    description: "Check visa requirements for your destination",
    category: "Documentation",
    link: "/visa-info"
  }, {
    id: 2,
    title: "Currency Converter",
    description: "Get up-to-date exchange rates",
    category: "Finance",
    link: "#"
  }, {
    id: 3,
    title: "Travel Insurance Guide",
    description: "Find the right travel insurance for your trip",
    category: "Insurance",
    link: "#"
  }, {
    id: 4,
    title: "Packing Checklist",
    description: "Never forget essential items again",
    category: "Planning",
    link: "#"
  }, {
    id: 5,
    title: "Local Weather Forecast",
    description: "Check weather conditions at your destination",
    category: "Weather",
    link: "#"
  }, {
    id: 6,
    title: "Transportation Guide",
    description: "Find the best ways to get around",
    category: "Transport",
    link: "#"
  }];
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />
      
      {/* Content container */}
      <div className="">
        {/* Hero section with background image */}
        <div className="relative h-80 flex items-center justify-center" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroToolbox})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
          <h1 className="text-4xl font-bold text-white text-center">
        </h1>
        </div>
        
        {/* Content area with white background */}
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
                Travel Tools & Resources
              </h2>
              <p className="text-muted-foreground text-base">
                Essential tools and resources to help you plan and enjoy your travels.
              </p>
            </div>

            {/* Tools Grid */}
            <div className="space-y-6">
              {tools.map(tool => <Card key={tool.id} className="rounded-none">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{tool.title}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="rounded-none">
                        {tool.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="rounded-none" asChild>
                      <Link to={tool.link}>
                        Access Tool
                      </Link>
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Toolbox;