import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import heroToolbox from "@/assets/hero-toolbox.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

const Toolbox = () => {
  const isMobile = useIsMobile();
  const videos = [{
    id: "dQw4w9WgXcQ",
    title: "Google Translate App",
    description: "Essential language translation tool for international travel. Features real-time camera translation and offline mode. Perfect for reading menus, signs, and communicating with locals."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Airbnb Travel Guide",
    description: "Comprehensive guide to finding unique accommodations worldwide. Learn insider tips for booking, safety considerations, and maximizing your experience. Essential for budget-conscious travelers."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Currency Exchange Apps",
    description: "Master international money management with top currency converter apps. Real-time exchange rates, offline functionality, and expense tracking features. Save money on international transactions."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Travel Insurance Comparison",
    description: "Navigate travel insurance options to protect your trips. Compare coverage plans, understand claim processes, and find the best value policies. Essential protection for international travelers."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Flight Tracking Apps",
    description: "Stay updated on flight delays, gate changes, and airport information. Real-time notifications and airline updates keep you informed. Reduce travel stress with accurate flight data."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Weather Forecast Tools",
    description: "Plan your travel wardrobe with accurate weather predictions. Multiple location forecasts, radar maps, and severe weather alerts. Pack smart and stay comfortable on your journey."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Offline Map Applications",
    description: "Navigate without internet using downloadable offline maps. GPS functionality, point-of-interest markers, and route planning capabilities. Essential for remote destinations and data-free exploration."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Travel Document Storage",
    description: "Secure digital storage for passports, visas, and important documents. Cloud backup, easy access, and emergency contact information. Keep critical documents safe while traveling."
  }, {
    id: "dQw4w9WgXcQ",
    title: "Local Transportation Apps",
    description: "Master public transit in any city with transportation apps. Real-time schedules, route planning, and mobile ticketing options. Navigate like a local and save money on transportation."
  }];

  return <div className="min-h-screen bg-background">
      {isMobile ? (
        <div className="relative min-h-screen">
          {/* Full-screen hero image for mobile */}
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroToolbox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Overlaid Navigation for mobile */}
          <div className="relative z-50">
            <Navigation />
          </div>
          
          {/* Hero title overlay for mobile */}
          <div className="relative z-10 flex items-center justify-center h-96">
            <h1 className="text-4xl font-bold text-white text-center">
              TRAVEL TOOLBOX
            </h1>
          </div>
          
          {/* Content area for mobile with white background */}
          <div className="relative z-10 bg-white min-h-screen px-4 py-8">
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
                  Essential Travel Tools
                </h2>
                <p className="text-muted-foreground text-base">
                  Discover apps and tools that make travel easier and more enjoyable
                </p>
              </div>

              <div className="space-y-6">
                {videos.map((video, index) => (
                  <Card key={index} className="rounded-none">
                    <CardHeader className="bg-black text-white">
                      <CardTitle className="text-lg font-bold">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="aspect-video mb-4">
                        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${video.id}`} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                      </div>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {video.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto px-6">
            <div className="pt-6">
              <Navigation />
            </div>
          </div>
          
          {/* Hero Section */}
          <div className="relative h-64 mb-8 border-8 border-white rounded-none shadow-[0_8px_12px_-4px_rgba(169,169,169,0.4),_-6px_8px_12px_-4px_rgba(169,169,169,0.3),_6px_8px_12px_-4px_rgba(169,169,169,0.3)]">
            <img src={heroToolbox} alt="Travel Toolbox" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white md:text-9xl">TRAVEL TOOLBOX</h1>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pb-12">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center space-y-4 mb-8">
              <h2 className="font-bold text-black text-3xl md:text-6xl">
                Essential Travel Tools
              </h2>
              <p className="text-lg font-medium text-black">
                Discover apps and tools that make travel easier and more enjoyable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <Card key={index} className="h-full rounded-none">
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video mb-4">
                      <iframe className="w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${video.id}`} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {video.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <Footer />
        </>
      )}
    </div>;
};
export default Toolbox;