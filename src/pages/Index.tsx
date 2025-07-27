import { useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { RestaurantDiscoveryForm } from "@/components/RestaurantDiscoveryForm";
import { RestaurantResults } from "@/components/RestaurantResults";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroBackground from "@/assets/hero-background.jpg";
import { regionData } from '@/data/locationData';
import { countryImages } from '@/data/countryImages';
import { cityImages } from '@/data/cityImages';
import heroEat from '@/assets/hero-eat.jpg';
import heroDrink from '@/assets/hero-drink.jpg';
import heroStay from '@/assets/hero-stay.jpg';
import heroPlay from '@/assets/hero-play.jpg';
import heroNorthAmerica from '@/assets/hero-north-america.jpg';
import heroEurope from '@/assets/hero-europe.jpg';
import heroAsia from '@/assets/hero-asia.jpg';
import heroSouthAmerica from '@/assets/hero-south-america.jpg';
import heroAfricaMiddleEast from '@/assets/hero-africa-middle-east.jpg';
import placeholderEat from '@/assets/placeholder-eat.jpg';
import placeholderDrink from '@/assets/placeholder-drink.jpg';
import placeholderStay from '@/assets/placeholder-stay.jpg';
import placeholderPlay from '@/assets/placeholder-play.jpg';
const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedRestaurants, setSelectedRestaurants] = useState<any[]>([]);
  const {
    user
  } = useAuth();

  const carouselImages = [
    { src: heroEat, alt: "Eat" },
    { src: heroStay, alt: "Stay" },
    { src: heroDrink, alt: "Drink" },
    { src: heroPlay, alt: "Play" }
  ];

  // Debug logging
  console.log("Carousel state:", { selectedCity, selectedCountry, selectedRegion });
  console.log("Carousel images:", carouselImages);

  const getCategoryPlaceholder = () => {
    switch (selectedCategory) {
      case 'Eat':
        return placeholderEat;
      case 'Drink':
        return placeholderDrink;
      case 'Stay':
        return placeholderStay;
      case 'Play':
        return placeholderPlay;
      default:
        return heroBackground;
    }
  };

  const getHeroImage = () => {
    // Priority order: City > Country > Region > Category > Default
    if (selectedCity) {
      return cityImages[selectedCity] || heroBackground;
    }
    if (selectedCountry) {
      return countryImages[selectedCountry] || getCategoryPlaceholder();
    }
    if (selectedRegion) {
      switch (selectedRegion) {
        case 'North America':
          return heroNorthAmerica;
        case 'Europe':
          return heroEurope;
        case 'Asia':
          return heroAsia;
        case 'South America':
          return heroSouthAmerica;
        case 'Africa & Middle East':
          return heroAfricaMiddleEast;
        default:
          return getCategoryPlaceholder();
      }
    }
    if (selectedCategory) {
      switch (selectedCategory) {
        case 'Eat':
          return heroEat;
        case 'Drink':
          return heroDrink;
        case 'Stay':
          return heroStay;
        case 'Play':
          return heroPlay;
        default:
          return heroBackground;
      }
    }
    return heroBackground;
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Restaurant Discovery Form */}
      <section className="py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-8 border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)] bg-background aspect-[16/9] mb-8">
          {!selectedCity && !selectedCountry && !selectedRegion ? (
            <div className="absolute inset-0">
              <Carousel 
                className="w-full h-full"
                plugins={[
                  Autoplay({
                    delay: 4000,
                  })
                ]}
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent className="h-full -ml-0">
                  {carouselImages.map((image, index) => (
                    <CarouselItem key={index} className="h-full pl-0 basis-full">
                      <div className="w-full h-full">
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          ) : (
            <img 
              src={getHeroImage()} 
              alt="Hero" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          )}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              {selectedCity || selectedCountry || selectedRegion || "PERSONALISED SMART GUIDES"}
            </h1>
            {!selectedCity && !selectedCountry && !selectedRegion && (
              <p className="text-sm sm:text-xl text-white mb-4 max-w-3xl mx-auto">LET'S GET PERSONAL!</p>
            )}
            <p className="text-lg sm:text-2xl font-semibold text-white">www.smartguidebooks.com</p>
          </div>
          </div>
        </div>

        <div className="w-[95%] sm:w-[90%] md:max-w-4xl lg:max-w-6xl mx-auto px-2 sm:px-4 md:px-6">
          <RestaurantDiscoveryForm 
            onSelectionChange={(category, region, country, city) => {
              setSelectedCategory(category);
              setSelectedRegion(region);
              setSelectedCountry(country);
              setSelectedCity(city);
            }}
          />
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