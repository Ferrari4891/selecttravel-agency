import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LanguageSelector } from "@/components/LanguageSelector";
import heroTVChannel from "@/assets/hero-tv-channel.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

const TVChannel = () => {
  const isMobile = useIsMobile();

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
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroTVChannel})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 className="text-4xl font-bold text-white text-center">
                TV CHANNEL
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
                    Watch Our Latest Travel Guides
                  </h2>
                  <p className="text-muted-foreground text-base">
                    Discover the best destinations, restaurants, and experiences through our video guides
                  </p>
                </div>

                {/* Language Selector */}
                <div className="flex justify-center">
                  <LanguageSelector />
                </div>

                {/* YouTube Channel */}
                <div className="bg-white p-4 border-2 border-gray-300 rounded-none">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-primary mb-4">Smart Guide Books Channel</h3>
                    <div className="mb-6">
                      <iframe
                        width="100%"
                        height="200"
                        src="https://www.youtube.com/embed/videoseries?list=UU-SmartGuideBooks"
                        title="Smart Guide Books YouTube Channel"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Subscribe to our channel for the latest travel guides, tips, and destination reviews.
                    </p>
                    <Button className="rounded-none">
                      Subscribe Now
                    </Button>
                  </div>
                </div>

                {/* Featured Videos */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-center">Featured Travel Videos</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-gray-300 rounded-none p-4">
                      <div className="aspect-video mb-4">
                        <iframe
                          width="100%"
                          height="200"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="Top 10 Travel Destinations"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <h4 className="font-bold mb-2">Top 10 Travel Destinations 2024</h4>
                      <p className="text-sm text-muted-foreground">
                        Explore the world's most amazing destinations with our comprehensive travel guide.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-gray-300 rounded-none p-4">
                      <div className="aspect-video mb-4">
                        <iframe
                          width="100%"
                          height="200"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="Budget Travel Tips"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <h4 className="font-bold mb-2">Essential Budget Travel Tips</h4>
                      <p className="text-sm text-muted-foreground">
                        Learn how to travel more while spending less with these proven money-saving strategies.
                      </p>
                    </div>
                  </div>
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
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroTVChannel})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 className="text-4xl font-bold text-white text-center md:text-6xl">
                TV CHANNEL
              </h1>
            </div>

            <div className="bg-white px-4 py-8">
              <div className="max-w-6xl mx-auto space-y-8">
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
                    Watch Our Latest Travel Guides
                  </h2>
                  <p className="text-lg font-medium text-black max-w-2xl mx-auto">
                    Discover the best destinations, restaurants, and experiences through our comprehensive video guides and travel content.
                  </p>
                </div>

                {/* Language Selector */}
                <div className="flex justify-center">
                  <LanguageSelector />
                </div>

                {/* YouTube Channel */}
                <div className="bg-white border-8 border-white shadow-md rounded-none p-8">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-primary mb-6">Smart Guide Books Channel</h3>
                    <div className="mb-8">
                      <iframe
                        width="100%"
                        height="400"
                        src="https://www.youtube.com/embed/videoseries?list=UU-SmartGuideBooks"
                        title="Smart Guide Books YouTube Channel"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                      Subscribe to our channel for the latest travel guides, tips, and destination reviews from experienced travelers.
                    </p>
                    <Button size="lg" className="rounded-none">
                      Subscribe Now
                    </Button>
                  </div>
                </div>

                {/* Featured Videos Grid */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-center">Featured Travel Videos</h3>
                  
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="bg-white border-8 border-white shadow-md rounded-none p-6">
                      <div className="aspect-video mb-6">
                        <iframe
                          width="100%"
                          height="100%"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="Top 10 Travel Destinations"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <h4 className="text-xl font-bold mb-3">Top 10 Travel Destinations 2024</h4>
                      <p className="text-muted-foreground">
                        Explore the world's most amazing destinations with our comprehensive travel guide featuring insider tips and local insights.
                      </p>
                    </div>

                    <div className="bg-white border-8 border-white shadow-md rounded-none p-6">
                      <div className="aspect-video mb-6">
                        <iframe
                          width="100%"
                          height="100%"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="Budget Travel Tips"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <h4 className="text-xl font-bold mb-3">Essential Budget Travel Tips</h4>
                      <p className="text-muted-foreground">
                        Learn how to travel more while spending less with these proven money-saving strategies from seasoned budget travelers.
                      </p>
                    </div>
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

export default TVChannel;