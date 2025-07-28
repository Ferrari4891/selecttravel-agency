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

const Lab: React.FC = () => {
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

  // Get hero image based on selections
  const getHeroImage = () => {
    // Priority: City > Country > Region > Category > Default rotation
    if (selectedCity) {
      // For now, use category-specific images when city is selected
      // In a real app, you'd have city-specific images
      return getCategoryImage();
    }
    if (selectedCountry) {
      // Use region-specific images for countries
      return getRegionImage();
    }
    if (selectedRegion) {
      return getRegionImage();
    }
    if (selectedCategory) {
      return getCategoryImage();
    }
    // Default: rotate through all images
    return carouselImages[carouselIndex];
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
    setIsLoading(true);
    try {
      // Simulate API call with 3-second delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockData = generateMockBusinesses();
      setBusinesses(mockData);
      setShowResults(true);
      toast({
        title: "Success!",
        description: `Found ${mockData.length} businesses in ${selectedCity}, ${selectedCountry}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch business data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          {/* Rotating Background Images */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${getCarouselImage()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Text Overlay */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full px-4 py-8 text-center">
            <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
              Personalized Guide Books
            </h1>
            <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl mt-2 md:mt-4">
              Let's get personal
            </p>
            <p className="text-white text-xs sm:text-sm md:text-base mt-1 md:mt-2">
              www.smartguidebooks.com
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Progress Indicator */}
        <div className="flex justify-center space-x-4 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-none flex items-center justify-center border-2 font-medium ${
                step <= currentStep 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-400 border-gray-300'
              }`}
            >
              {step}
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
                          setCitySearchInput('');
                          setCurrentStep(5);
                        }
                      }}
                      disabled={!citySearchInput.trim()}
                      className="h-20 bg-black text-white hover:bg-gray-800 rounded-none px-6"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Result Count Selection */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-black">5: How Many Results?</h2>
                <Select onValueChange={(value) => setResultCount(Number(value))}>
                  <SelectTrigger className="h-20 max-w-4xl mx-auto border-2 border-gray-400 text-lg rounded-none">
                    <SelectValue placeholder={`${resultCount} results`} />
                  </SelectTrigger>
                  <SelectContent className="max-w-4xl rounded-none">
                    {[1, 5, 10, 20, 30, 40, 50].map((count) => (
                      <SelectItem key={count} value={count.toString()} className="text-lg py-3 rounded-none">
                        {count} results
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8">
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

        {/* Results Section */}
        {showResults && businesses.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">
                Found {businesses.length} {selectedCategory} options in {selectedCity}
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
                // Placeholder images for businesses
                const placeholderImages = [
                  'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Business+1',
                  'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Business+2',
                  'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Business+3',
                  'https://via.placeholder.com/400x300/96CEB4/FFFFFF?text=Business+4',
                  'https://via.placeholder.com/400x300/FFEAA7/000000?text=Business+5'
                ];
                
                return (
                <Card key={index} className="border-2 border-gray-300 shadow-lg">
                  {/* Add placeholder image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={placeholderImages[index % placeholderImages.length]}
                      alt={business.name}
                      className="w-full h-full object-cover"
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

export default Lab;