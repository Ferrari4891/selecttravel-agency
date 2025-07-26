import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import HowToHero from "@/components/how-to/HowToHero";
import HowToSteps from "@/components/how-to/HowToSteps";
import HowToFeatures from "@/components/how-to/HowToFeatures";
import HowToVideo from "@/components/how-to/HowToVideo";
import HowToTips from "@/components/how-to/HowToTips";
import HowToTipsAndTricks from "@/components/how-to/HowToTipsAndTricks";
import HowToCTA from "@/components/how-to/HowToCTA";
const HowTo = () => {
  return <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <Navigation />
      </div>
      
      <HowToHero />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h2 className="font-bold bg-gradient-primary bg-clip-text text-transparent text-4xl">
            How to Use smartguidebooks.com
          </h2>
          <p className="text-muted-foreground text-lg">Your step-by-step guide to discovering top rated businesses in many categories in thousands of cities worldwide in 60 seconds or less with NO typing!!</p>
        </div>

        <HowToSteps />
        <HowToFeatures />
        <HowToVideo />
        <HowToTipsAndTricks />
        <HowToTips />
        <HowToCTA />
      </div>
      
      <Footer />
    </div>;
};
export default HowTo;