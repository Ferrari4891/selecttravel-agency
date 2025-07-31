import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LanguageSelector } from "@/components/LanguageSelector";
import heroToolbox from "@/assets/hero-toolbox.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

const Toolbox = () => {
  const isMobile = useIsMobile();
  const [videos] = useState([
    {
      id: "yYpJP3tIKIU", 
      title: "How to Travel Smart: Essential Tips",
      description: "Learn the best practices for planning your trips and making the most of your travel experience."
    },
    {
      id: "wNfWr6A1KXo", 
      title: "Budget Travel Secrets",
      description: "Discover how to travel more while spending less with these proven strategies."
    },
    {
      id: "Yl-ZwXxcHl8", 
      title: "Cultural Etiquette Guide",
      description: "Navigate different cultures with confidence using our comprehensive etiquette guide."
    },
    {
      id: "PqVb9JYa1Fw", 
      title: "Safety Tips for Solo Travelers",
      description: "Essential safety advice for those venturing out on their own."
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <div className="min-h-screen">
          {/* Fixed Navigation for mobile */}
          <Navigation />
          
          {/* Content container with proper top padding for fixed nav */}
          <div className="pt-20">
            {/* Hero section with background image */}
            <div 
              className="relative h-80 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroToolbox})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 className="text-4xl font-bold text-white text-center">
                TOOLBOX
              </h1>
            </div>
            
            {/* Content area for mobile with white background */}
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
                    Travel Resources & Tools
                  </h2>
                  <p className="text-muted-foreground text-base">
                    Everything you need to plan and enjoy your perfect trip
                  </p>
                </div>

                {/* Language Selector */}
                <div className="flex justify-center">
                  <LanguageSelector />
                </div>

                {/* Video Guides */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-center">Travel Video Guides</h3>
                  {videos.map((video) => (
                    <Card key={video.id} className="rounded-none">
                      <CardHeader className="bg-black text-white">
                        <CardTitle className="text-lg font-bold">{video.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="aspect-video mb-4">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${video.id}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
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
        </div>
      ) : (
        <>
          <Navigation />
          
          {/* Content container with proper top padding for fixed nav */}
          <div className="pt-20 min-h-screen">
            {/* Hero section with background image */}
            <div 
              className="relative h-80 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroToolbox})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 className="text-4xl font-bold text-white text-center md:text-6xl">
                TOOLBOX
              </h1>
            </div>

            <div className="bg-white px-4 py-8">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                  <Link to="/">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>

                <div className="text-center space-y-4">
                  <h2 className="font-bold text-black text-3xl md:text-6xl">
                    Travel Resources & Tools
                  </h2>
                  <p className="text-lg font-medium text-black max-w-2xl mx-auto">
                    Everything you need to plan and enjoy your perfect trip. Access our comprehensive collection of travel guides, tips, and essential tools.
                  </p>
                </div>

                {/* Language Selector */}
                <div className="flex justify-center">
                  <LanguageSelector />
                </div>

                {/* Video Guides Grid */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-center">Travel Video Guides</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {videos.map((video) => (
                      <Card key={video.id} className="rounded-none">
                        <CardHeader className="bg-black text-white">
                          <CardTitle className="text-lg font-bold">{video.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="aspect-video mb-4">
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${video.id}`}
                              title={video.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
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
          </div>
          
          <Footer />
        </>
      )}
    </div>
  );
};

export default Toolbox;