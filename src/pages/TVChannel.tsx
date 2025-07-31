import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import heroTVChannel from "@/assets/hero-tv-channel.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

const TVChannel = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <div className="relative min-h-screen">
          {/* Hero background image for mobile */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroTVChannel})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '100vh'
            }}
          />
          
          {/* Overlaid Navigation for mobile */}
          <div className="relative z-50">
            <Navigation />
          </div>
          
          {/* Hero title overlay for mobile */}
          <div className="relative z-10 flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Smart Guides TV</h1>
              <p className="text-xl text-white">Your Travel Companion Channel</p>
            </div>
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
                      className="w-full border-2 border-gray-300 rounded-none"
                    ></iframe>
                  </div>
                  <a
                    href="https://www.youtube.com/@SmartGuideBooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors border-2 border-gray-300 rounded-none"
                  >
                    Subscribe to Our Channel
                  </a>
                </div>
              </div>

              {/* Featured Videos */}
              <div className="bg-white p-4 border-2 border-gray-300 rounded-none">
                <h3 className="text-xl font-bold text-primary mb-6 text-center">Featured Travel Guides</h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="bg-gray-200 aspect-video mb-4 border-2 border-gray-300 rounded-none">
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Latest Video
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Watch our latest travel guide</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-200 aspect-video mb-4 border-2 border-gray-300 rounded-none">
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Popular Video
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Most watched destination guide</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-200 aspect-video mb-4 border-2 border-gray-300 rounded-none">
                      <div className="flex items-center justify-center h-full text-gray-500">
                        New Release
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Just published travel tips</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-6 py-6">
            <Navigation />
          </div>
          
          {/* Hero Section */}
          <div className="relative">
            <AspectRatio ratio={16/9} className="w-full">
              <img 
                src={heroTVChannel} 
                alt="TV Channel Hero" 
                className="w-full h-full object-cover border-8 border-white shadow-[0_8px_12px_-4px_rgba(169,169,169,0.4),_-6px_8px_12px_-4px_rgba(169,169,169,0.3),_6px_8px_12px_-4px_rgba(169,169,169,0.3)]"
                style={{ borderRadius: '0px' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">Smart Guides TV</h1>
                  <p className="text-xl md:text-2xl">Your Travel Companion Channel</p>
                </div>
              </div>
            </AspectRatio>
          </div>

          {/* Content Section */}
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-6xl font-bold text-primary mb-4">Watch Our Latest Travel Guides</h2>
              <p className="text-lg text-muted-foreground">
                Discover the best destinations, restaurants, and experiences through our video guides
              </p>
            </div>

            {/* Language Selector */}
            <div className="flex justify-center py-4">
              <LanguageSelector />
            </div>

            {/* YouTube Channel Embed */}
            <div className="grid gap-8">
              {/* Channel Header */}
              <div className="bg-white p-6 border-8 border-white shadow-lg" style={{ borderRadius: '0px' }}>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-4">Smart Guide Books Channel</h3>
                  <div className="flex justify-center mb-6">
                    <iframe
                      width="560"
                      height="315"
                      src="https://www.youtube.com/embed/videoseries?list=UU-SmartGuideBooks"
                      title="Smart Guide Books YouTube Channel"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="max-w-full border-8 border-white shadow-lg"
                      style={{ borderRadius: '0px' }}
                    ></iframe>
                  </div>
                  <div className="flex justify-center">
                    <a
                      href="https://www.youtube.com/@SmartGuideBooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors border-8 border-white shadow-lg"
                      style={{ borderRadius: '0px' }}
                    >
                      Subscribe to Our Channel
                    </a>
                  </div>
                </div>
              </div>

              {/* Featured Videos Section */}
              <div className="bg-white p-6 border-8 border-white shadow-lg" style={{ borderRadius: '0px' }}>
                <h3 className="text-2xl font-bold text-primary mb-6 text-center">Featured Travel Guides</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Placeholder for recent videos - these would be dynamically loaded */}
                  <div className="text-center">
                    <div className="bg-gray-200 aspect-video mb-4 border-8 border-white shadow-lg" style={{ borderRadius: '0px' }}>
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Latest Video
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Watch our latest travel guide</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-200 aspect-video mb-4 border-8 border-white shadow-lg" style={{ borderRadius: '0px' }}>
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Popular Video
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Most watched destination guide</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-200 aspect-video mb-4 border-8 border-white shadow-lg" style={{ borderRadius: '0px' }}>
                      <div className="flex items-center justify-center h-full text-gray-500">
                        New Release
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Just published travel tips</p>
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