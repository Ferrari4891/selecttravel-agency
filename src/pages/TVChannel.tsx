import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";

import heroTVChannel from "@/assets/hero-tv-channel.jpg";

const TVChannel = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />
      
      {/* Content container */}
      <div className="">
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
        
        {/* Content area with white background */}
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
                Discover the best destinations, restaurants, and experiences through our comprehensive video guides and travel content.
              </p>
            </div>

            {/* Video Grid */}
            <div className="space-y-6">
              {/* Video 1 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/yYpJP3tIKIU"
                    title="How to Travel Smart: Essential Tips"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">How to Travel Smart: Essential Tips</h3>
                  <p className="text-muted-foreground text-sm">
                    Learn the best practices for planning your trips and making the most of your travel experience.
                  </p>
                </div>
              </div>

              {/* Video 2 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/wNfWr6A1KXo"
                    title="Budget Travel Secrets"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Budget Travel Secrets</h3>
                  <p className="text-muted-foreground text-sm">
                    Discover how to travel more while spending less with these insider tips and tricks.
                  </p>
                </div>
              </div>

              {/* Video 3 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Cultural Travel Guide"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Cultural Travel Guide</h3>
                  <p className="text-muted-foreground text-sm">
                    Immerse yourself in local cultures and traditions with our comprehensive cultural travel guide.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="font-semibold text-lg">Stay Updated</h3>
              <p className="text-muted-foreground text-sm">
                Subscribe to our channel for the latest travel guides and destination reviews.
              </p>
              <Button variant="outline" className="rounded-none">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TVChannel;