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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
    <div className="min-h-screen bg-white">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="relative min-h-screen">
          {/* Full-screen hero image for mobile */}
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getHeroImage()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Overlaid Navigation for mobile */}
          <div className="relative z-50">
            <Navigation />
          </div>
          
          {/* Main content area for mobile */}
          <div className="relative z-10 min-h-screen flex flex-col">
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

                {/* Selection Interface */}
                <div className="p-6">
                  {/* Step 1: Category Selection */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-bold text-center text-white">1: Select Category</h2>
                      <Select onValueChange={handleCategorySelect}>
                        <SelectTrigger className="h-12 border-2 border-gray-400 text-base rounded-none z-50 bg-white">
                          <SelectValue placeholder="Choose your category..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none z-50 bg-white">
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
                      <Select onValueChange={handleRegionSelect}>
                        <SelectTrigger className="h-12 border-2 border-gray-400 text-base rounded-none z-50 bg-white">
                          <SelectValue placeholder="Choose a region..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none z-50 bg-white">
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
                      <Select onValueChange={handleCountrySelect}>
                        <SelectTrigger className="h-12 border-2 border-gray-400 text-base rounded-none z-50 bg-white">
                          <SelectValue placeholder="Choose a country..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none z-50 bg-white">
                          {countries.map((country) => (
                            <SelectItem key={country.name} value={country.name} className="text-base py-2 rounded-none">
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                   {/* Step 4: City Selection */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-bold text-center text-white">4: Select City</h2>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Search cities..."
                            value={citySearchInput}
                            onChange={(e) => setCitySearchInput(e.target.value)}
                            onKeyDown={handleCityInputKeyDown}
                            className="h-12 border-2 border-gray-400 text-base rounded-none bg-white"
                          />
                          <Button
                            onClick={handleCitySearch}
                            variant="outline"
                            size="sm"
                            className="h-12 px-3 rounded-none border-2 border-white bg-white text-black hover:bg-gray-100"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        <Select onValueChange={handleCitySelect}>
                          <SelectTrigger className="h-12 border-2 border-gray-400 text-base rounded-none z-50 bg-white">
                            <SelectValue placeholder="Choose a city..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-none z-50 bg-white max-h-60">
                            {cities
                              .filter(city => 
                                citySearchInput === '' || 
                                city.toLowerCase().includes(citySearchInput.toLowerCase())
                              )
                              .map((city) => (
                                <SelectItem key={city} value={city} className="text-base py-2 rounded-none">
                                  {city}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Get Now */}
                  {currentStep === 5 && isComplete && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-bold text-center text-white">5: Ready to Search!</h2>
                      <div className="space-y-3">
                        <Select value={resultCount.toString()} onValueChange={(value) => setResultCount(parseInt(value))}>
                          <SelectTrigger className="h-12 border-2 border-gray-400 text-base rounded-none z-50 bg-white">
                            <SelectValue placeholder="Number of results..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-none z-50 bg-white">
                            <SelectItem value="5" className="text-base py-2 rounded-none">5 results</SelectItem>
                            <SelectItem value="10" className="text-base py-2 rounded-none">10 results</SelectItem>
                            <SelectItem value="20" className="text-base py-2 rounded-none">20 results</SelectItem>
                            <SelectItem value="50" className="text-base py-2 rounded-none">50 results</SelectItem>
                            <SelectItem value="100" className="text-base py-2 rounded-none">100 results</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={handleGetNow}
                            disabled={isLoading}
                            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white border-2 border-green-600 text-base font-bold rounded-none"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Searching...
                              </>
                            ) : (
                              <>
                                <Search className="h-4 w-4 mr-2" />
                                Get Now
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleGetAgain}
                            variant="outline"
                            className="flex-1 h-12 border-2 border-white text-black bg-white hover:bg-gray-100 rounded-none"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Get Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Section for mobile */}
          {showResults && businesses.length > 0 && (
            <div className="container mx-auto px-4 py-8 max-w-6xl relative z-20 bg-white rounded-lg mx-4 my-8">
              <div className="space-y-6">
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
                    console.log(`🔍 Business data for ${business.name}:`, {
                      name: business.name,
                      rating: business.rating,
                      reviewCount: business.reviewCount,
                      address: business.address,
                      phone: business.phone,
                      email: business.email,
                      website: business.website
                    });
                    
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
                           <SaveBusinessButton
                             restaurant={{
                               name: business.name,
                               address: business.address || "",
                               googleMapRef: business.googleMapRef || "",
                               socialMediaLinks: {
                                 facebook: business.facebook,
                                 instagram: business.instagram,
                                 twitter: business.twitter,
                               },
                               contactDetails: {
                                 phone: business.phone,
                                 email: business.email,
                                 website: business.website,
                               },
                               imageLinks: business.imageLinks ? business.imageLinks.split(',') : [],
                               rating: business.rating || 0,
                               reviewCount: business.reviewCount || 0,
                               source: business.source || "Local",
                             }}
                             selectedCity={selectedCity}
                             selectedCountry={selectedCountry}
                             selectedCategory={selectedCategory}
                           />
                         </div>
                       </CardContent>
                     </Card>
                     );
                   })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <>
          <Navigation />
          <LanguageSelector />

          {/* Hero Section - Carousel with Overlay Controls */}
          <div className="relative mx-2 sm:mx-6 mt-2 border-4 sm:border-8 border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
            <div className="relative w-full aspect-[3/4] sm:aspect-[5/4] md:aspect-video overflow-hidden">
          {/* Rotating Background Images with Fallback */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${(() => {
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
              target.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${placeholderComingSoon})`;
            }}
          />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 z-10 flex flex-col">
            {/* Top Section - Title */}
            <div className="flex-shrink-0 flex flex-col justify-center items-center text-center px-2 sm:px-4 py-2 sm:py-4">
              {/* City Name Display - only when city image is shown */}
              {selectedCity && cityImages[selectedCity] && (
                <h1 className="text-white font-bold text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight">
                  {selectedCity.toUpperCase()}
                </h1>
              )}
              
              {/* Default content - when no city is selected */}
              {!selectedCity && (
                <>
                  <h1 className="text-white font-bold text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight">
                    Personalized Guide Books
                  </h1>
                  <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg mt-1">
                    Let's get personal
                  </p>
                  <p className="text-white text-xs md:text-sm mt-1">
                    www.smartguidebooks.com
                  </p>
                </>
              )}
            </div>

            {/* Middle Section - Selection Interface */}
            <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
              <div className="w-full max-w-sm sm:max-w-2xl">
                {/* Progress Indicator */}
                <div className="flex justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
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
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-none flex items-center justify-center border-2 font-medium transition-colors cursor-pointer hover:scale-110 text-xs sm:text-sm ${
                          step <= currentStep 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-white border-white/50 hover:border-white'
                        }`}
                      >
                        {step}
                      </button>
                      <button
                        onClick={() => handleStepNavigation(step)}
                        className={`text-xs font-medium transition-colors cursor-pointer hover:text-white hidden sm:block ${
                          step <= currentStep ? 'text-white' : 'text-white/70'
                        }`}
                      >
                        {label}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Current Selections */}
                {(selectedCategory || selectedRegion || selectedCountry || selectedCity) && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mb-3 sm:mb-4">
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

                {/* Selection Interface */}
                <div className="p-3 sm:p-6">
                  {/* Step 1: Category Selection */}
                  {currentStep === 1 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h2 className="text-lg sm:text-xl font-bold text-center text-white">1: Select Category</h2>
                      <Select onValueChange={handleCategorySelect}>
                        <SelectTrigger className="h-12 sm:h-16 border-2 border-gray-400 text-base sm:text-lg rounded-none">
                          <SelectValue placeholder="Choose your category..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {categories.map((category) => {
                            const IconComponent = category.icon;
                            return (
                              <SelectItem key={category.value} value={category.value} className="text-base sm:text-lg py-2 sm:py-3 rounded-none">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
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
                    <div className="space-y-3 sm:space-y-4">
                      <h2 className="text-lg sm:text-xl font-bold text-center text-white">2: Select Region</h2>
                      <Select onValueChange={handleRegionSelect}>
                        <SelectTrigger className="h-12 sm:h-16 border-2 border-gray-400 text-base sm:text-lg rounded-none">
                          <SelectValue placeholder="Choose a region..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {regions.map((region) => (
                            <SelectItem key={region} value={region} className="text-base sm:text-lg py-2 sm:py-3 rounded-none">
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Step 3: Country Selection */}
                  {currentStep === 3 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h2 className="text-lg sm:text-xl font-bold text-center text-white">3: Select Country</h2>
                      <Select onValueChange={handleCountrySelect}>
                        <SelectTrigger className="h-12 sm:h-16 border-2 border-gray-400 text-base sm:text-lg rounded-none">
                          <SelectValue placeholder="Choose a country..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none z-50 bg-white">
                          {countries.map((country) => (
                            <SelectItem key={country.name} value={country.name} className="text-base sm:text-lg py-2 sm:py-3 rounded-none">
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Step 4: City Selection */}
                  {currentStep === 4 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h2 className="text-lg sm:text-xl font-bold text-center text-white">4: Select City</h2>
                      <div className="space-y-3">
                        <Select onValueChange={(value) => {
                          setSelectedCity(value);
                          setCurrentStep(5);
                        }}>
                          <SelectTrigger className="h-12 sm:h-16 border-2 border-gray-400 text-base sm:text-lg rounded-none">
                            <SelectValue placeholder="Choose a city..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            {cities.map((city) => (
                              <SelectItem key={city} value={city} className="text-base sm:text-lg py-2 sm:py-3 rounded-none">
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-center text-white text-sm">
                          Or type city name:
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={citySearchInput}
                            onChange={(e) => setCitySearchInput(e.target.value)}
                            placeholder="Type city name to search..."
                            className="h-12 sm:h-16 text-base sm:text-lg border-2 border-gray-400 rounded-none"
                          />
                          <Button
                            onClick={() => {
                              if (citySearchInput.trim()) {
                                setSelectedCity(citySearchInput.trim());
                                setCurrentStep(5);
                              }
                            }}
                            className="h-12 sm:h-16 px-4 sm:px-6 bg-black text-white hover:bg-gray-800 rounded-none"
                          >
                            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Result Count Selection & Get Results */}
                  {currentStep === 5 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h2 className="text-lg sm:text-xl font-bold text-center text-white">5: Select Number of Results</h2>
                      <Select value={resultCount.toString()} onValueChange={(value) => setResultCount(Number(value))}>
                        <SelectTrigger className="h-12 sm:h-16 border-2 border-gray-400 text-base sm:text-lg rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {[1, 3, 5, 10, 15, 20, 25, 30, 40, 50].map((count) => (
                            <SelectItem key={count} value={count.toString()} className="text-base sm:text-lg py-2 sm:py-3 rounded-none">
                              {count} Result{count !== 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-4 justify-center pt-4 sm:pt-6">
                    <Button
                      onClick={handleGetNow}
                      disabled={!isComplete || isLoading}
                      className="flex-1 sm:w-auto bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 rounded-none h-12 sm:h-auto text-xs sm:text-sm px-2 sm:px-4"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'GET NOW!'
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleGetAgain}
                      variant="outline"
                      className="flex-1 sm:w-auto border-2 border-gray-400 hover:bg-gray-100 rounded-none h-12 sm:h-auto text-xs sm:text-sm px-2 sm:px-4"
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Get Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section - appears below the carousel */}
      {(() => {
        console.log('🔍 Results render check:', { showResults, businessesLength: businesses.length });
        return showResults && businesses.length > 0;
      })() && (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-6">
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
                       <SaveBusinessButton
                         restaurant={{
                           name: business.name,
                           address: business.address || "",
                           googleMapRef: business.googleMapRef || "",
                           socialMediaLinks: {
                             facebook: business.facebook,
                             instagram: business.instagram,
                             twitter: business.twitter,
                           },
                           contactDetails: {
                             phone: business.phone,
                             email: business.email,
                             website: business.website,
                           },
                           imageLinks: business.imageLinks ? business.imageLinks.split(',') : [],
                           rating: business.rating || 0,
                           reviewCount: business.reviewCount || 0,
                           source: business.source || "Local",
                         }}
                         selectedCity={selectedCity}
                         selectedCountry={selectedCountry}
                         selectedCategory={selectedCategory}
                       />
                     </div>
                   </CardContent>
                 </Card>
                 );
               })}
            </div>
          </div>
        </div>
      )}

          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;