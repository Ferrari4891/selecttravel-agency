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
  const {
    user
  } = useAuth();
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Restaurant Discovery Form */}
      <section className="py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-8 border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)] bg-background aspect-video mb-8">
          <img 
            src={heroBackground} 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative z-10 h-full flex items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
                PERSONALISED SMART GUIDES
              </h1>
              <p className="text-sm sm:text-xl text-white mb-8 max-w-3xl mx-auto">LET'S MAKE IT PERSONAL!</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <RestaurantDiscoveryForm />
        </div>
        
        <div className="absolute top-4 right-4 z-20">
          <LanguageSelector />
        </div>
      </section>

      {/* Restaurant Results */}
      {selectedRestaurants.length > 0 && <section className="py-16">
          <div className="container mx-auto px-4">
            <RestaurantResults restaurants={selectedRestaurants} selectedCity={selectedCity} selectedCountry={selectedCountry} />
          </div>
        </section>}

      <Footer />
    </div>;
};
export default Index;