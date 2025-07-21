import { useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { RestaurantDiscoveryForm } from "@/components/RestaurantDiscoveryForm";
import { RestaurantResults } from "@/components/RestaurantResults";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedRestaurants, setSelectedRestaurants] = useState<any[]>([]);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat border-8 border-white shadow-lg"
          style={{
            backgroundImage: `url(${heroBackground})`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Amazing Restaurants & Manage Your Business
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Find the best dining experiences in cities around the world or manage your business with our comprehensive platform.
            </p>
            
            {/* Business Management CTA */}
            <div className="mb-8">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Go to Business Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="space-x-4">
                  <Link to="/auth">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      Business Login
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                      Start Your Business Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Restaurant Discovery Form */}
          <div className="max-w-4xl mx-auto">
            <RestaurantDiscoveryForm />
          </div>
        </div>
        
        <div className="absolute top-4 right-4 z-20">
          <LanguageSelector />
        </div>
      </section>

      {/* Restaurant Results */}
      {selectedRestaurants.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <RestaurantResults 
              restaurants={selectedRestaurants}
              selectedCity={selectedCity}
              selectedCountry={selectedCountry}
            />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );

};

export default Index;
