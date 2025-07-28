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
  facebook?: string;
  instagram?: string;
  twitter?: string;
  image: string;
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
    <div className="min-h-screen bg-white">
      <Navigation />
      <LanguageSelector />

      {/* Hero Section - Carousel */}
      <div className="relative mx-6 mt-6 border-8 border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
        <div className="relative w-full aspect-video overflow-hidden">
          {/* Rotating Background Images with Fallback */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${(() => {
                const heroImage = getCarouselImage();
                console.log('🖼️ Hero image URL being used:', heroImage);
                return heroImage;
              })()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onError={(e) => {
              console.log('❌ Hero image failed to load, using coming soon placeholder');
              const target = e.target as HTMLDivElement;
              target.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${placeholderComingSoon})`;
            }}
          />
          
          {/* Text Overlay */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full px-4 py-8 text-center">
            {/* City Name Display - only when city image is shown */}
            {selectedCity && cityImages[selectedCity] && (
              <h1 className="text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight">
                {selectedCity.toUpperCase()}
              </h1>
            )}
            
            {/* Default content - when no city is selected */}
            {!selectedCity && (
              <>
                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                  Personalized Guide Books
                </h1>
                <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl mt-2 md:mt-4">
                  Let's get personal
                </p>
                <p className="text-white text-xs sm:text-sm md:text-base mt-1 md:mt-2">
                  www.smartguidebooks.com
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Progress Indicator */}
        <div className="flex justify-center space-x-8 mb-8">
          {[
            { step: 1, label: 'Category' },
            { step: 2, label: 'Region' },
            { step: 3, label: 'Country' },
            { step: 4, label: 'City' },
            { step: 5, label: 'Get Now!' }
          ].map(({ step, label }) => (
            <div key={step} className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleStepNavigation(step)}
                className={`w-8 h-8 rounded-none flex items-center justify-center border-2 font-medium transition-colors cursor-pointer hover:scale-110 ${
                  step <= currentStep 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-400 border-gray-300 hover:border-gray-400'
                }`}
              >
                {step}
              </button>
              <button
                onClick={() => handleStepNavigation(step)}
                className={`text-xs font-medium transition-colors cursor-pointer hover:text-black ${
                  step <= currentStep ? 'text-black' : 'text-gray-400'
                }`}
              >
                {label}
              </button>
            </div>
          ))}
        </div>

        {/* Current Selections */}
        {(selectedCategory || selectedRegion || selectedCountry || selectedCity) && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {selectedCategory && (
              <Badge variant="secondary" className="bg-black text-white text-sm px-3 py-1 rounded-none">
                {categories.find(c => c.value === selectedCategory)?.label}
              </Badge>
            )}
            {selectedRegion && (
              <Badge variant="secondary" className="bg-black text-white text-sm px-3 py-1 rounded-none">
                {selectedRegion}
              </Badge>
            )}
            {selectedCountry && (
              <Badge variant="secondary" className="bg-black text-white text-sm px-3 py-1 rounded-none">
                {selectedCountry}
              </Badge>
            )}
            {selectedCity && (
              <Badge variant="secondary" className="bg-black text-white text-sm px-3 py-1 rounded-none">
                {selectedCity}
              </Badge>
            )}
          </div>
        )}

        {/* Progressive Selection Interface */}
        <Card className="max-w-4xl mx-auto border-2 border-gray-300 shadow-lg">
          <CardContent className="p-8">
            
            {/* Step 1: Category Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-black">1: Select Category</h2>
                <Select onValueChange={handleCategorySelect}>
                  <SelectTrigger className="h-20 max-w-4xl mx-auto border-2 border-gray-400 text-lg rounded-none">
                    <SelectValue placeholder="Choose your category..." />
                  </SelectTrigger>
                  <SelectContent className="max-w-4xl rounded-none">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <SelectItem key={category.value} value={category.value} className="text-lg py-3 rounded-none">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-6 w-6" />
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
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-black">2: Select Region</h2>
                <Select onValueChange={handleRegionSelect}>
                  <SelectTrigger className="h-20 max-w-4xl mx-auto border-2 border-gray-400 text-lg rounded-none">
                    <SelectValue placeholder="Choose a region..." />
                  </SelectTrigger>
                  <SelectContent className="max-w-4xl rounded-none">
                    {regions.map((region) => (
                      <SelectItem key={region} value={region} className="text-lg py-3 rounded-none">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 3: Country Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-black">3: Select Country</h2>
                <Select onValueChange={handleCountrySelect}>
                  <SelectTrigger className="h-20 max-w-4xl mx-auto border-2 border-gray-400 text-lg rounded-none">
                    <SelectValue placeholder="Choose a country..." />
                  </SelectTrigger>
                  <SelectContent className="max-w-4xl rounded-none">
                    {countries.map((country) => (
                      <SelectItem key={country.name} value={country.name} className="text-lg py-3 rounded-none">
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 4: City Selection */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-black">4: Select City</h2>
                <div className="space-y-4">
                  <Select onValueChange={(value) => {
                    setSelectedCity(value);
                    setCurrentStep(5);
                  }}>
                    <SelectTrigger className="h-20 max-w-4xl mx-auto border-2 border-gray-400 text-lg rounded-none">
                      <SelectValue placeholder="Choose a city..." />
                    </SelectTrigger>
                    <SelectContent className="max-w-4xl rounded-none">
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} className="text-lg py-3 rounded-none">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-center text-gray-600 text-sm">
                    Or type city name:
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={citySearchInput}
                      onChange={(e) => setCitySearchInput(e.target.value)}
                      placeholder="Type city name to search..."
                      className="h-20 text-lg border-2 border-gray-400 rounded-none"
                    />
                    <Button
                      onClick={() => {
                        if (citySearchInput.trim()) {
                          setSelectedCity(citySearchInput.trim());
                          setCurrentStep(5);
                        }
                      }}
                      className="h-20 px-6 bg-black text-white hover:bg-gray-800 rounded-none"
                    >
                      <Search className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Result Count Selection & Get Results */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-black">5: Select Number of Results</h2>
                <Select value={resultCount.toString()} onValueChange={(value) => setResultCount(Number(value))}>
                  <SelectTrigger className="h-20 max-w-4xl mx-auto border-2 border-gray-400 text-lg rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {[1, 3, 5, 10, 15, 20, 25, 30, 40, 50].map((count) => (
                      <SelectItem key={count} value={count.toString()} className="text-lg py-3 rounded-none">
                        {count} Result{count !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-8">
              <Button
                onClick={handleGetNow}
                disabled={!isComplete || isLoading}
                className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 rounded-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'GET NOW!'
                )}
              </Button>
              
              <Button
                onClick={handleGetAgain}
                variant="outline"
                className="border-2 border-gray-400 hover:bg-gray-100 rounded-none"
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Get Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section - DEBUG VERSION */}
        {(() => {
          console.log('🔍 Results render check:', { showResults, businessesLength: businesses.length });
          return showResults && businesses.length > 0;
        })() && (
          <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">
                🔥 FOUND {businesses.length} {selectedCategory} options in {selectedCity} 🔥
              </h2>
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="border-2 border-gray-400 hover:bg-gray-100 rounded-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business, index) => {
                console.log(`🏪 Rendering business ${index}:`, business.name);
                
                // Placeholder images for businesses - FIXED URLS
                const placeholderImages = [
                  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1552566499-dfd8fa52cd2c?w=400&h=300&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop&q=80'
                ];
                
                const imageUrl = placeholderImages[index % placeholderImages.length];
                console.log(`🖼️ Using image URL for business ${index}:`, imageUrl);
                
                return (
                <Card key={index} className="border-2 border-gray-300 shadow-lg">
                  {/* Add placeholder image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={business.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('❌ Image failed to load:', imageUrl, 'using coming soon placeholder');
                        const target = e.target as HTMLImageElement;
                        target.src = placeholderComingSoon;
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', imageUrl);
                      }}
                    />
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-black">{business.name}</h3>
                      <div className="text-right">
                        <div className="text-yellow-500 font-bold">★ {business.rating}</div>
                        <div className="text-sm text-gray-600">({business.reviewCount} reviews)</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm">{business.address}</p>
                    
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-gray-400 rounded-none"
                          onClick={() => window.open(`tel:${business.phone}`, '_self')}
                        >
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-gray-400 rounded-none"
                          onClick={() => window.open(business.website, '_blank')}
                        >
                          Website
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-gray-400 rounded-none"
                          onClick={() => window.open(business.mapLink, '_blank')}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Map
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-gray-400 rounded-none"
                          onClick={() => window.open(`mailto:${business.email}`, '_self')}
                        >
                          Email
                        </Button>
                      </div>
                      
                      {(business.facebook || business.instagram || business.twitter) && (
                        <div className="flex space-x-2 pt-2">
                          {business.facebook && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-gray-400 rounded-none"
                              onClick={() => window.open(business.facebook, '_blank')}
                            >
                              FB
                            </Button>
                          )}
                          {business.instagram && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-gray-400 rounded-none"
                              onClick={() => window.open(business.instagram, '_blank')}
                            >
                              IG
                            </Button>
                          )}
                          {business.twitter && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-gray-400 rounded-none"
                              onClick={() => window.open(business.twitter, '_blank')}
                            >
                              X
                            </Button>
                          )}
                        </div>
                      )}
                       
                       {/* Save Button - spans full width with black background */}
                       <Button
                         className="w-full bg-black text-white hover:bg-gray-800 rounded-none mt-2"
                         onClick={() => {
                           // TODO: Add save functionality
                           toast({
                             title: "Save Feature",
                             description: "Save functionality coming soon!",
                           });
                         }}
                       >
                         SAVE
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
                 );
               })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;