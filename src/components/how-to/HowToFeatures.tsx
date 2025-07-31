import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Download } from "lucide-react";
const HowToFeatures = () => {
  return <div className="space-y-6">
      <Card>
        <CardHeader className="bg-foreground text-background">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Understanding Our Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Restaurants are ranked based on combined ratings from TripAdvisor, Yelp, and Google Reviews members can choose star ratings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Each listing includes complete contact information and address details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Google Maps references are provided for easy navigation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Social media links help you explore more about each business.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>High-quality images showcase the business</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-foreground text-background">
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
    </div>;
};
export default HowToFeatures;