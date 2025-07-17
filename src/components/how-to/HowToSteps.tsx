import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
const HowToSteps = () => {
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Getting Started
        </CardTitle>
        <CardDescription>Follow these simple steps to getting you the top 20 businesses in the city of your choice </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4 bg-blue-50">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-2">Select Category</h3>
              <p className="text-muted-foreground">
                Choose what you're looking for from our available categories: Eat, Drink, Stay, or Play. Each category is tailored to help you discover the best local experiences.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-2">Select Your Region</h3>
              <p className="text-muted-foreground">
                Choose from one of our 5 available regions: North America, Europe, Asia, South America, or Africa & Middle East.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div className="bg-blue-50">
              <h3 className="font-semibold mb-2">Choose Your Country</h3>
              <p className="text-muted-foreground">
                Pick from up to 10 countries available in that region. Each country has been carefully selected for its diverse local scene.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-2">Pick Your City or County</h3>
              <p className="text-muted-foreground">
                Select the specific city or county where you want to find businesses. Our database covers major metropolitan areas and popular destinations.
              </p>
            </div>
          </div>

          <div className="flex gap-4 bg-blue-50">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              5
            </div>
            <div>
              <h3 className="font-semibold mb-2">Find Results</h3>
              <p className="text-muted-foreground">Click the search button to generate a curated list of the top 20 businesses in your selected category and location.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default HowToSteps;