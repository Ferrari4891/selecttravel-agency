import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import heroTVChannel from "@/assets/hero-tv-channel.jpg";

const TVChannel = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative">
        <AspectRatio ratio={16/9} className="w-full">
          <img 
            src={heroTVChannel} 
            alt="TV Channel Hero" 
            className="w-full h-full object-cover border-8 border-white shadow-lg"
            style={{ borderRadius: '0px' }}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Smart Guides TV</h1>
              <p className="text-xl md:text-2xl">Your Travel Companion Channel</p>
            </div>
          </div>
        </AspectRatio>
      </div>

      {/* Language Selector */}
      <div className="flex justify-center py-4">
        <LanguageSelector />
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">Watch Our Latest Travel Guides</h2>
          <p className="text-lg text-muted-foreground">
            Discover the best destinations, restaurants, and experiences through our video guides
          </p>
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
    </div>
  );
};

export default TVChannel;