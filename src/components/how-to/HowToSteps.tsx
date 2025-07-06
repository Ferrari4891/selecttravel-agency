import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

const HowToSteps = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Getting Started
        </CardTitle>
        <CardDescription>Follow these simple steps to find the best restaurants</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-2">Select Your Region</h3>
              <p className="text-muted-foreground">
                Start by choosing from one of our 5 available regions: North America, Europe, Asia, South America, or Africa & Middle East.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-2">Choose Your Country</h3>
              <p className="text-muted-foreground">
                Once you've selected a region, pick from up to 10 countries available in that region. Each country has been carefully selected for its diverse culinary scene.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-2">Pick Your City or County</h3>
              <p className="text-muted-foreground">
                Select the specific city or county where you want to find restaurants. Our database covers major metropolitan areas and popular tourist destinations.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-2">Search for Restaurants</h3>
              <p className="text-muted-foreground">
                Click the "Find Restaurants" button to generate a curated list of the top 40 restaurants in your selected location.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HowToSteps;