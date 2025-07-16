import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
const HowToTips = () => {
  return <Card className="text-sky-400 font-extrabold">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Tips for the Best Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-semibold mb-2 text-primary">BEFORE YOU VISIT THE BUSINESS</h4>
            <ul className="space-y-1 text-muted-foreground/60 text-sm">
              <li>• Check restaurant hours and availability</li>
              <li>• Make reservations for popular spots</li>
              <li>• Read recent reviews for current information</li>
              <li>• Consider dietary restrictions and preferences</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-primary/60">During Your Visit</h4>
            <ul className="space-y-1 text-muted-foreground/60 text-sm">
              <li>• Use the Google Maps reference for easy navigation</li>
              <li>• Follow the restaurant's social media for specials</li>
              <li>• Ask about local recommendations from staff</li>
              <li>• Share your experience with others</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default HowToTips;