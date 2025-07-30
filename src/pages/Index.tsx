import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Utensils, Coffee, Bed, Gamepad2, MapPin, Download, RotateCcw, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { regionData } from '@/data/locationData';
import SaveBusinessButton from '@/components/SaveBusinessButton';


// Import hero images
import heroEat from '@/assets/hero-eat.jpg';
import heroDrink from '@/assets/hero-drink.jpg';
import heroStay from '@/assets/hero-stay.jpg';
import heroPlay from '@/assets/hero-play.jpg';
import heroNorthAmerica from '@/assets/hero-north-america.jpg';
import heroEurope from '@/assets/hero-europe.jpg';
import heroAsia from '@/assets/hero-asia.jpg';
import heroSouthAmerica from '@/assets/hero-south-america.jpg';
import heroAfricaMiddleEast from '@/assets/hero-africa-middle-east.jpg';
import heroBackground from '@/assets/hero-background.jpg';
import placeholderComingSoon from '@/assets/placeholder-image-coming-soon.jpg';
import { cityImages } from '@/data/cityImages';
import { countryImages } from '@/data/countryImages';

interface Business {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  website: string;
  mapLink: string;
  googleMapRef?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  image: string;
  imageLinks?: string;
  source: string;
}

const Index: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [resultCount, setResultCount] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const categories = [
    { value: 'eat', label: 'Eat', icon: Utensils },
    { value: 'drink', label: 'Drink', icon: Coffee },
    { value: 'stay', label: 'Stay', icon: Bed },
    { value: 'play', label: 'Play', icon: Gamepad2 },
  ];

  const regions = Object.keys(regionData);

  const countries = useMemo(() => {
    if (!selectedRegion) return [];
    return regionData[selectedRegion]?.countries || [];
  }, [selectedRegion]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    const country = countries.find(c => c.name === selectedCountry);
    return country?.cities || [];
  }, [selectedCountry, countries]);

  // Get hero image based on selections with proper priority and fallbacks
  const getHeroImage = () => {
    console.log('🎯 getHeroImage called with:', { 
      selectedCity, 
      selectedCountry, 
      selectedRegion, 
      selectedCategory 
    });
    
    // Priority: City > Country > Region > Category > Default rotation
    if (selectedCity) {
      console.log('🏙️ Using city-based image');
      const cityImage = cityImages[selectedCity];
      if (cityImage && cityImage !== placeholderComingSoon) {
        console.log('✅ Found specific city image:', cityImage);
        return cityImage;
      } else {
        console.log('⚠️ City image not found or placeholder, using country image');
        return getCountryImageWithFallback();
      }
    }
    if (selectedCountry) {
      console.log('🌍 Using country-based image');
      return getCountryImageWithFallback();
    }
    if (selectedRegion) {
      console.log('🗺️ Using region-based image');
      return getRegionImage();
    }
    if (selectedCategory) {
      console.log('📁 Using category-based image');
      return getCategoryImage();
    }
    // Default: rotate through all images
    console.log('🔄 Using default carousel image');
    return carouselImages[carouselIndex];
  };

  const getCountryImageWithFallback = () => {
    const countryImage = countryImages[selectedCountry];
    if (countryImage) {
      console.log('✅ Found specific country image:', countryImage);
      return countryImage;
    } else {
      console.log('⚠️ Country image not found, using region image');
      return getRegionImage();
    }
  };

  const getCategoryImage = () => {
    switch (selectedCategory) {
      case 'eat': return heroEat;
      case 'drink': return heroDrink;
      case 'stay': return heroStay;
      case 'play': return heroPlay;
      default: return heroBackground;
    }
  };

  const getRegionImage = () => {
    switch (selectedRegion) {
      case 'North America': return heroNorthAmerica;
      case 'Europe': return heroEurope;
      case 'Asia': return heroAsia;
      case 'South America': return heroSouthAmerica;
      case 'Africa & Middle East': return heroAfricaMiddleEast;
      default: return getCategoryImage();
    }
  };

  // Carousel images with senior couples only
  const carouselImages = [
    heroEat,
    heroDrink, 
    heroStay,
    heroPlay
  ];

  const getCarouselImage = () => {
    // Use dynamic hero image based on selections
    return getHeroImage();
  };

  // Carousel rotation effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 2000); // 2 second delay

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const generateMockBusinesses = (): Business[] => {
    const businessNames = [
      'The Golden Fork', 'Urban Bistro', 'Sunset Café', 'Mountain View Restaurant',
      'Coastal Grill', 'The Local Pub', 'Heritage Hotel', 'Modern Suites',
      'Adventure Sports Center', 'Entertainment Complex', 'Wine Bar & Lounge',
      'Family Restaurant', 'Boutique Inn', 'Gaming Center', 'Coffee Roasters',
      'Fine Dining House', 'Beach Resort', 'Sports Bar', 'Luxury Lodge',
      'Activity Center', 'Central Plaza', 'Metro Grill', 'Riverside Cafe',
      'Downtown Lounge', 'Grand Hotel', 'City Center', 'Royal Restaurant',
      'Elite Bistro', 'Premium Venue', 'Classic Eatery', 'Modern Bar',
      'Urban Lodge', 'Sunset Restaurant', 'Golden Cafe', 'Prime Location',
      'Central Hub', 'Main Street Grill', 'Plaza Hotel', 'Metro Bar',
      'Downtown Restaurant', 'City Cafe', 'Grand Lounge', 'Elite Hotel',
      'Premium Restaurant', 'Classic Bar', 'Modern Hotel', 'Urban Cafe',
      'Riverside Restaurant', 'Central Lounge', 'Metro Hotel', 'Plaza Bar'
    ];

    return businessNames.slice(0, resultCount).map((name, index) => ({
      name,
      address: `${100 + index} Main Street, ${selectedCity}, ${selectedCountry}`,
      rating: parseFloat((3.0 + Math.random() * 2).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 500) + 50,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
      mapLink: `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + selectedCity)}`,
      facebook: Math.random() > 0.5 ? `https://facebook.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      instagram: Math.random() > 0.5 ? `https://instagram.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      twitter: Math.random() > 0.5 ? `https://twitter.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      image: '/placeholder.svg',
      source: 'SmartGuides Database'
    }));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentStep(2);
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setSelectedCountry('');
    setSelectedCity('');
    setCurrentStep(3);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity('');
    setCurrentStep(4);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCurrentStep(5);
  };

  // Helper function to get all cities across all countries
  const getAllCities = () => {
    const allCities: string[] = [];
    Object.values(regionData).forEach(region => {
      region.countries.forEach(country => {
        allCities.push(...country.cities);
      });
    });
    return allCities;
  };

  const handleCitySearch = () => {
    const searchTerm = citySearchInput.trim().toLowerCase();
    const allCities = getAllCities();
    
    // Find exact match first
    let foundCity = allCities.find(city => city.toLowerCase() === searchTerm);
    
    // If no exact match, try partial match
    if (!foundCity) {
      foundCity = allCities.find(city => city.toLowerCase().includes(searchTerm));
    }

    if (foundCity) {
      // Find the region and country for this city
      let foundRegion = '';
      let foundCountry = '';
      
      Object.entries(regionData).forEach(([regionName, region]) => {
        region.countries.forEach(country => {
          if (country.cities.includes(foundCity!)) {
            foundRegion = regionName;
            foundCountry = country.name;
          }
        });
      });

      setSelectedCity(foundCity);
      setSelectedRegion(foundRegion);
      setSelectedCountry(foundCountry);
      setCitySearchInput('');
      setCurrentStep(5);
      toast({
        title: "City Found",
        description: `Selected ${foundCity}`,
      });
    } else {
      toast({
        title: "City Not Found",
        description: "Sorry, your choice is not listed. Please try a different city or select from the dropdown.",
        variant: "destructive"
      });
    }
  };

  const handleCityInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCitySearch();
    }
  };

  const handleGetNow = async () => {
    console.log('🚀 handleGetNow called!');
    setIsLoading(true);
    try {
      console.log('⏱️ Starting 3-second delay...');
      // Simulate API call with 3-second delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Delay complete, generating businesses...');
      const mockData = generateMockBusinesses();
      console.log('📋 Generated businesses:', mockData);
      setBusinesses(mockData);
      setShowResults(true);
      console.log('🎯 Set showResults to true, businesses length:', mockData.length);
      toast({
        title: "Success!",
        description: `Found ${mockData.length} businesses in ${selectedCity}, ${selectedCountry}`,
      });
    } catch (error) {
      console.error('❌ Error in handleGetNow:', error);
      toast({
        title: "Error",
        description: "Failed to fetch business data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 handleGetNow finished');
    }
  };

  const handleGetAgain = () => {
    setCurrentStep(1);
    setSelectedCategory('');
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedCity('');
    setBusinesses([]);
    setShowResults(false);
  };

  const handleStepNavigation = (step: number) => {
    // Only allow navigation to current step or previous steps
    if (step <= currentStep) {
      setCurrentStep(step as 1 | 2 | 3 | 4 | 5);
      
      // Reset selections based on which step we're going back to
      if (step === 1) {
        setSelectedCategory('');
        setSelectedRegion('');
        setSelectedCountry('');
        setSelectedCity('');
      } else if (step === 2) {
        setSelectedRegion('');
        setSelectedCountry('');
        setSelectedCity('');
      } else if (step === 3) {
        setSelectedCountry('');
        setSelectedCity('');
      } else if (step === 4) {
        setSelectedCity('');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Address', 'Rating', 'Reviews', 'Phone', 'Email', 'Website', 'Maps Link', 'Facebook', 'Instagram', 'Twitter'];
    const csvContent = [
      headers.join(','),
      ...businesses.map(business => [
        `"${business.name}"`,
        `"${business.address}"`,
        business.rating,
        business.reviewCount,
        `"${business.phone}"`,
        `"${business.email}"`,
        `"${business.website}"`,
        `"${business.mapLink}"`,
        `"${business.facebook || ''}"`,
        `"${business.instagram || ''}"`,
        `"${business.twitter || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCategory}_${selectedCity}_${selectedCountry}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded successfully.",
    });
  };

  const isComplete = selectedCategory && selectedRegion && selectedCountry && selectedCity;

  return (
    <div className="h-full bg-background">
      {/* Unified Layout for all devices - use mobile experience */}
      <div className="relative h-full">
        {/* Full-screen hero image */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getHeroImage()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Overlaid Navigation */}
        <div className="relative z-50">
          <Navigation />
        </div>
        
        {/* Main content area */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Top Section - Title */}
          <div className="flex-shrink-0 flex flex-col justify-center items-center text-center px-4 py-8 mt-16">
            {selectedCity && cityImages[selectedCity] && (
              <h1 className="text-white font-bold text-3xl leading-tight">
                {selectedCity.toUpperCase()}
              </h1>
            )}
            
            {!selectedCity && (
              <>
                <h1 className="text-white font-bold text-xl leading-tight">
                  Personalized Guide Books
                </h1>
                <p className="text-white text-sm mt-1">
                  Let's get personal
                </p>
                <p className="text-white text-xs mt-1">
                  www.smartguidebooks.com
                </p>
              </>
            )}
          </div>

          {/* Middle Section - Selection Interface */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
              {/* Progress Indicator */}
              <div className="flex justify-center space-x-2 mb-6">
                {[
                  { step: 1, label: 'Category' },
                  { step: 2, label: 'Region' },
                  { step: 3, label: 'Country' },
                  { step: 4, label: 'City' },
                  { step: 5, label: 'Get Now!' }
                ].map(({ step, label }) => (
                  <div key={step} className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => handleStepNavigation(step)}
                      className={`w-5 h-5 rounded-none flex items-center justify-center border-2 font-medium transition-colors cursor-pointer hover:scale-110 text-xs ${
                        step <= currentStep 
                          ? 'bg-white text-black border-white' 
                          : 'bg-transparent text-white border-white/50 hover:border-white'
                      }`}
                    >
                      {step}
                    </button>
                  </div>
                ))}
              </div>

              {/* Current Selections */}
              {(selectedCategory || selectedRegion || selectedCountry || selectedCity) && (
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {selectedCategory && (
                    <Badge variant="secondary" className="bg-white text-black text-xs px-2 py-1 rounded-none">
                      {categories.find(c => c.value === selectedCategory)?.label}
                    </Badge>
                  )}
                  {selectedRegion && (
                    <Badge variant="secondary" className="bg-white text-black text-xs px-2 py-1 rounded-none">
                      {selectedRegion}
                    </Badge>
                  )}
                  {selectedCountry && (
                    <Badge variant="secondary" className="bg-white text-black text-xs px-2 py-1 rounded-none">
                      {selectedCountry}
                    </Badge>
                  )}
                  {selectedCity && (
                    <Badge variant="secondary" className="bg-white text-black text-xs px-2 py-1 rounded-none">
                      {selectedCity}
                    </Badge>
                  )}
                </div>
              )}

              {/* Step 1: Category Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-center text-white">1: What are you looking for?</h2>
                  <Select onValueChange={handleCategorySelect} value={selectedCategory}>
                    <SelectTrigger className="w-full h-12 text-base bg-white/90 backdrop-blur-sm border-white rounded-none">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-none">
                      {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value} className="text-base py-2 rounded-none">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-5 w-5" />
                              <span className="font-medium">{category.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 2: Region Selection */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-center text-white">2: Select Region</h2>
                  <Select onValueChange={handleRegionSelect} value={selectedRegion}>
                    <SelectTrigger className="w-full h-12 text-base bg-white/90 backdrop-blur-sm border-white rounded-none">
                      <SelectValue placeholder="Select region..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-none">
                      {regions.map((region) => (
                        <SelectItem key={region} value={region} className="text-base py-2 rounded-none">
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 3: Country Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-center text-white">3: Select Country</h2>
                  <Select onValueChange={handleCountrySelect} value={selectedCountry}>
                    <SelectTrigger className="w-full h-12 text-base bg-white/90 backdrop-blur-sm border-white rounded-none">
                      <SelectValue placeholder="Select country..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-none">
                      {countries.map((country) => (
                        <SelectItem key={country.name} value={country.name} className="text-base py-2 rounded-none">
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 4: City Selection with Search */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-center text-white">4: Select City</h2>
                  
                  {/* City Search Input */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search for a city..."
                        value={citySearchInput}
                        onChange={(e) => setCitySearchInput(e.target.value)}
                        onKeyDown={handleCityInputKeyDown}
                        className="flex-1 h-12 text-base bg-white/90 backdrop-blur-sm border-white rounded-none"
                      />
                      <Button 
                        onClick={handleCitySearch}
                        className="h-12 px-4 bg-white text-black border-white rounded-none hover:bg-white/90"
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-white text-xs text-center">or select from dropdown below</p>
                  </div>

                  {/* City Dropdown */}
                  <Select onValueChange={handleCitySelect} value={selectedCity}>
                    <SelectTrigger className="w-full h-12 text-base bg-white/90 backdrop-blur-sm border-white rounded-none">
                      <SelectValue placeholder="Select city..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-none">
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} className="text-base py-2 rounded-none">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 5: Get Now */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-center text-white">5: How many results?</h2>
                  <Select onValueChange={(value) => setResultCount(parseInt(value))} value={resultCount.toString()}>
                    <SelectTrigger className="w-full h-12 text-base bg-white/90 backdrop-blur-sm border-white rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-none">
                      {[5, 10, 15, 20, 25].map((count) => (
                        <SelectItem key={count} value={count.toString()} className="text-base py-2 rounded-none">
                          {count} results
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleGetNow} 
                    disabled={!isComplete || isLoading}
                    className="w-full h-12 text-base font-bold bg-white text-black border-white rounded-none hover:bg-white/90 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Getting Results...
                      </>
                    ) : (
                      'GET NOW!'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Language Selector positioned at bottom */}
          <div className="absolute bottom-4 right-4 z-50">
            <LanguageSelector />
          </div>
        </div>

        {/* Results Section */}
        {showResults && businesses.length > 0 && (
          <div className="relative z-20 bg-white h-full">
            <div className="sticky top-0 bg-white z-30 px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {selectedCategory?.charAt(0).toUpperCase() + selectedCategory?.slice(1)} in {selectedCity}
              </h2>
              <div className="flex gap-2">
                <Button 
                  onClick={exportToCSV}
                  variant="outline" 
                  size="sm"
                  className="h-10 px-3 rounded-none border-black"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button 
                  onClick={handleGetAgain}
                  variant="outline" 
                  size="sm"
                  className="h-10 px-3 rounded-none border-black"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Again
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {businesses.map((business, index) => (
                <Card key={index} className="border border-gray-200 rounded-none">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-base leading-tight">{business.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{business.address}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500 text-lg">★</span>
                            <span className="font-semibold text-sm">{business.rating}</span>
                            <span className="text-gray-500 text-sm">({business.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                      <SaveBusinessButton 
                        restaurant={{
                          id: `business-${index}`,
                          name: business.name,
                          address: business.address,
                          rating: business.rating,
                          reviewCount: business.reviewCount,
                          phone: business.phone,
                          email: business.email,
                          website: business.website,
                          mapLink: business.mapLink,
                          image: business.image,
                          source: business.source
                        }}
                        selectedCity={selectedCity}
                        selectedCountry={selectedCountry}
                        selectedCategory={selectedCategory}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;