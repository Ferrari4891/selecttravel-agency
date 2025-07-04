import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Search, Download, Star } from "lucide-react";
import { Link } from "react-router-dom";

const HowTo = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            How to Use smartguidebooks.com
          </h1>
          <p className="text-muted-foreground text-lg">
            Your step-by-step guide to discovering amazing restaurants
          </p>
        </div>

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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Understanding Our Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Restaurants are ranked based on combined ratings from TripAdvisor, Yelp, and Google Reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Each listing includes complete contact information and address details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Google Maps references are provided for easy navigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Social media links help you explore more about each restaurant</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>High-quality images showcase the dining experience</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exporting Your Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Once you have your restaurant results, you can easily export them for offline use or sharing:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Click the "Export to CSV" button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Save the file to your device</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Open in Excel, Google Sheets, or any spreadsheet application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Share with friends, family, or travel companions</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tips for the Best Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2 text-primary">Before You Go</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Check restaurant hours and availability</li>
                  <li>• Make reservations for popular spots</li>
                  <li>• Read recent reviews for current information</li>
                  <li>• Consider dietary restrictions and preferences</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">During Your Visit</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Use the Google Maps reference for easy navigation</li>
                  <li>• Follow the restaurant's social media for specials</li>
                  <li>• Ask about local recommendations from staff</li>
                  <li>• Share your experience with others</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/">
            <Button size="lg" className="bg-gradient-primary">
              Start Discovering Restaurants
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowTo;