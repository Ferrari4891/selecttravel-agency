import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
const HowToSteps = () => {
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Getting Started
        </CardTitle>
        <CardDescription>Follow these simple steps to get your customized list of top-rated businesses in your chosen city. </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4 bg-background">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-2">Select Category</h3>
              <p className="text-muted-foreground">
                Choose what you're looking for from our available categories: Eat or Drink. Each category is tailored to help you discover the best local experiences.
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
            <div className="bg-background">
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
                Select from the dropdown list or type in your own city name. Currently supporting USA cities only, with more countries coming soon.
              </p>
            </div>
          </div>

          <div className="flex gap-4 bg-background">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              5
            </div>
            <div>
              <h3 className="font-semibold mb-2">Choose Number of Results & Find Businesses</h3>
              <p className="text-muted-foreground">Select how many businesses you want to see from the drop down menu or enter your own amount, then click the search button to generate your customized list of top-rated businesses with 3+ star ratings.</p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t">
          <AudioPlayer src="how-to-getting-started.wav" className="w-full" />
        </div>
      </CardContent>
    </Card>;
};
export default HowToSteps;