import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { RestaurantResults } from '@/components/RestaurantResults';
import { Utensils, Coffee, Bed, Gamepad2, MapPin, Download, RotateCcw, Loader2, Search, Menu, Home, Info, HelpCircle, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { regionData } from '@/data/locationData';
import SaveBusinessButton from '@/components/SaveBusinessButton';
import { EnhancedCityInput } from '@/components/EnhancedCityInput';

import { supabase } from '@/integrations/supabase/client';


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

// Import flag images
import flagJapan from '@/assets/flag-japan.jpg';
import flagFrance from '@/assets/flag-france.jpg';
import flagKorea from '@/assets/flag-korea.jpg';
import flagItaly from '@/assets/flag-italy.jpg';
import flagChina from '@/assets/flag-china.jpg';
import flagMexico from '@/assets/flag-mexico.jpg';
import flagIndia from '@/assets/flag-india.jpg';
import flagThailand from '@/assets/flag-thailand.jpg';
import flagVietnam from '@/assets/flag-vietnam.jpg';

interface Business {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  website: string;
  mapLink: string;
  menuLink: string;
  googleMapRef?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  image: string;
  imageLinks?: string;
  source: string;
}

interface CountryCuisineData {
  [key: string]: string[];
}

const countryCuisineData: CountryCuisineData = {
  'France': ['French', 'Mediterranean', 'European', 'Western', 'Seafood', 'Steak', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Lebanese', 'Brazilian', 'Mexican'],
  'Spain': ['Spanish', 'Mediterranean', 'Tapas', 'European', 'Seafood', 'Steak', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Lebanese', 'Brazilian', 'Mexican'],
  'United States': ['Western', 'American', 'BBQ', 'Fusion', 'Seafood', 'Steak', 'Chinese', 'Japanese', 'Italian', 'Mexican', 'Indian', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Lebanese', 'Brazilian', 'French', 'Spanish'],
  'China': ['Chinese', 'Asian', 'Cantonese', 'Sichuan', 'Seafood', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Western', 'Italian', 'French', 'Indian', 'Greek', 'Lebanese', 'Brazilian', 'Mexican'],
  'Italy': ['Italian', 'Mediterranean', 'European', 'Western', 'Seafood', 'Steak', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Lebanese', 'Brazilian', 'Mexican', 'French'],
  'Turkey': ['Middle Eastern', 'Mediterranean', 'Turkish', 'Anatolian', 'Seafood', 'Greek', 'Lebanese', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Vietnamese', 'Korean', 'Brazilian', 'Mexican', 'French'],
  'Mexico': ['Mexican', 'Latin American', 'Western', 'Tex-Mex', 'Seafood', 'Brazilian', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Lebanese', 'French', 'Spanish'],
  'Thailand': ['Thai', 'Asian', 'Southeast Asian', 'Street Food', 'Seafood', 'Chinese', 'Japanese', 'Vietnamese', 'Korean', 'Indian', 'Western', 'Italian', 'French', 'Greek', 'Lebanese', 'Brazilian', 'Mexican'],
  'Germany': ['German', 'European', 'Western', 'Bavarian', 'Steak', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Lebanese', 'Brazilian', 'Mexican', 'French'],
  'United Kingdom': ['British', 'European', 'Western', 'Pub Food', 'Seafood', 'Steak', 'Indian', 'Chinese', 'Japanese', 'Italian', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Lebanese', 'Brazilian', 'Mexican', 'French']
};

const topCountries = [
  'France',
  'Spain', 
  'United States',
  'China',
  'Italy',
  'Turkey',
  'Mexico',
  'Thailand',
  'Germany',
  'United Kingdom'
];

const Index: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [resultCount, setResultCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [staticImageIndex, setStaticImageIndex] = useState(0);

  const availableCuisines = useMemo(() => {
    return selectedCountry ? countryCuisineData[selectedCountry] || [] : [];
  }, [selectedCountry]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    // Find all cities for the selected country across all regions
    const allCities: string[] = [];
    Object.values(regionData).forEach(region => {
      const country = region.countries.find(c => c.name === selectedCountry);
      if (country) {
        allCities.push(...country.cities);
      }
    });
    return allCities;
  }, [selectedCountry]);

  // Get hero image based on selections with proper priority and fallbacks
  const getHeroImage = () => {
    console.log('🎯 getHeroImage called with:', { 
      selectedCity, 
      selectedCountry, 
      selectedCuisine,
      currentStep 
    });
    
    // Priority: City > Country > Step-based static images
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
    // Step-based static images from carousel
    console.log('🔄 Using step-based static image');
    return getStepBasedImage();
  };

  const getCountryImageWithFallback = () => {
    const countryImage = countryImages[selectedCountry];
    if (countryImage) {
      console.log('✅ Found specific country image:', countryImage);
      return countryImage;
    } else {
      console.log('⚠️ Country image not found, using hero eat image');
      return heroEat;
    }
  };

  // Static images (formerly carousel images)
  const staticImages = [
    heroEat,
    heroDrink, 
    heroStay,
    heroPlay
  ];

  // Get step-based static image
  const getStepBasedImage = () => {
    if (currentStep === 1) {
      return staticImages[0]; // heroEat for step 1
    }
    if (currentStep === 2) {
      return staticImages[1]; // heroDrink for step 2
    }
    // For other steps, use the current staticImageIndex
    return staticImages[staticImageIndex];
  };

  const getCarouselImage = () => {
    // Use dynamic hero image based on selections
    return getHeroImage();
  };

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
      menuLink: `https://menu.${name.toLowerCase().replace(/\s+/g, '')}.com`, // Add menu link for all restaurants
      facebook: Math.random() > 0.5 ? `https://facebook.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      instagram: Math.random() > 0.5 ? `https://instagram.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      twitter: Math.random() > 0.5 ? `https://twitter.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      image: '/lovable-uploads/84845629-2fe8-43b5-8500-84324fdcb0ec.png',
      source: 'SmartGuides Database'
    }));
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedCuisine('');
    setSelectedCity('');
    setCurrentStep(2);
  };

  const handleCuisineSelect = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    setSelectedCity('');
    setCurrentStep(3);
  };

  const handleCitySelectAndProceed = (city: string) => {
    setSelectedCity(city);
    setCitySearchInput('');
    setCurrentStep(4);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySearchInput(''); // Clear search input when selecting from dropdown
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
    const selectedCountryCities = cities;
    
    // Find exact match first within selected country
    let foundCity = selectedCountryCities.find(city => city.toLowerCase() === searchTerm);
    
    // If no exact match, try partial match within selected country
    if (!foundCity) {
      foundCity = selectedCountryCities.find(city => city.toLowerCase().includes(searchTerm));
    }

    if (foundCity) {
      setSelectedCity(foundCity);
      setCitySearchInput('');
      toast({
        title: "City Found",
        description: `Selected ${foundCity}`,
      });
    } else {
      toast({
        title: "City Not Found",
        description: "Sorry, your choice is not listed in the selected country. Please try a different city or select from the dropdown.",
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
    
    // If user typed a city but didn't search, search it first
    if (citySearchInput.trim() && !selectedCity) {
      handleCitySearch();
      // If city not found, return early
      if (!selectedCity) return;
    }
    
    const cityToUse = selectedCity || citySearchInput.trim();
    
    setIsLoading(true);
    try {
      console.log('⏱️ Starting search for real businesses...');
      
      // First try to get real businesses from Supabase
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('business_type', selectedCuisine)
        .eq('city', cityToUse)
        .eq('country', selectedCountry)
        .eq('status', 'active')
        .limit(resultCount);

      const { data: realBusinesses, error } = await query;

      if (error) {
        console.error('Database query error:', error);
      }

      let businesses: Business[] = [];

      if (realBusinesses && realBusinesses.length > 0) {
        console.log('✅ Found real businesses:', realBusinesses.length);
        // Transform business data to Business format
        businesses = realBusinesses.map((business) => ({
          name: business.business_name,
          address: business.address || `${business.city}, ${business.country}`,
          rating: 4.0 + Math.random() * 1.0,
          reviewCount: Math.floor(Math.random() * 500) + 50,
          phone: business.phone || `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          email: business.email || `info@${business.business_name.toLowerCase().replace(/\s+/g, '')}.com`,
          website: business.website || `https://www.${business.business_name.toLowerCase().replace(/\s+/g, '')}.com`,
          mapLink: business.address 
            ? `https://maps.google.com/?q=${encodeURIComponent(business.address)}`
            : `https://maps.google.com/?q=${encodeURIComponent(`${business.city}, ${business.country}`)}`,
          menuLink: business.website || `https://menu.${business.business_name.toLowerCase().replace(/\s+/g, '')}.com`,
          facebook: business.facebook,
          instagram: business.instagram,
          twitter: business.twitter,
          image: business.image_1_url || '/lovable-uploads/84845629-2fe8-43b5-8500-84324fdcb0ec.png',
          source: 'Business Directory'
        }));
      }

      // If no real businesses found or we need more to reach the target count, 
      // supplement with mock data
      if (businesses.length < resultCount) {
        const remainingCount = resultCount - businesses.length;
        const mockBusinesses = generateMockBusinesses().slice(0, remainingCount);
        businesses = [...businesses, ...mockBusinesses];
      }

      console.log('📋 Final businesses array:', businesses);
      setBusinesses(businesses);
      setShowResults(true);
      console.log('🎯 Set showResults to true, businesses length:', businesses.length);

      const realCount = realBusinesses?.length || 0;
      toast({
        title: "Search Complete!",
        description: realCount > 0 
          ? `Found ${realCount} real businesses and ${businesses.length - realCount} additional results in ${cityToUse}`
          : `Found ${businesses.length} businesses in ${cityToUse}, ${selectedCountry}`,
      });
    } catch (error) {
      console.error('❌ Error in handleGetNow:', error);
      // Fallback to mock data if database query fails
      const mockData = generateMockBusinesses();
      setBusinesses(mockData);
      setShowResults(true);
      
      toast({
        title: "Search Complete",
        description: `Found ${mockData.length} businesses in ${cityToUse}, ${selectedCountry}`,
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 handleGetNow finished');
    }
  };

  const handleGetAgain = () => {
    setCurrentStep(1);
    setSelectedCountry('');
    setSelectedCuisine('');
    setSelectedCity('');
    setCitySearchInput('');
    setResultCount(0);
    setBusinesses([]);
    setShowResults(false);
  };

  const handleStepNavigation = (step: number) => {
    // Only allow navigation to current step or previous steps
    if (step <= currentStep) {
      setCurrentStep(step as 1 | 2 | 3 | 4);
      
      // Reset selections based on which step we're going back to
      if (step === 1) {
        setSelectedCountry('');
        setSelectedCuisine('');
        setSelectedCity('');
        setCitySearchInput('');
        setResultCount(0);
      } else if (step === 2) {
        setSelectedCuisine('');
        setSelectedCity('');
        setCitySearchInput('');
        setResultCount(0);
      } else if (step === 3) {
        setSelectedCity('');
        setCitySearchInput('');
        setResultCount(0);
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
    link.setAttribute('download', `${selectedCuisine}_${selectedCity}_${selectedCountry}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded successfully.",
    });
  };

  const isComplete = selectedCountry && selectedCuisine && (selectedCity || citySearchInput.trim()) && resultCount > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Layout for all devices - use mobile experience */}
      <div className="relative min-h-screen">
        {/* Hero image fills entire screen below header */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getHeroImage()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            top: '0',
            bottom: '0'
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
                  {t('main_heading')}
                </h1>
                <p className="text-white text-sm mt-1">
                  Let's get personal
                </p>
                <p className="text-white text-xs mt-1">
                  www.seniorstravelagency.com
                </p>
                <div className="flex justify-center mt-3">
                  <Link 
                    to="/how-to" 
                    className="border border-white/80 hover:border-white w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/10"
                  >
                    <span className="text-white font-bold text-lg">?</span>
                  </Link>
                </div>

              </>
            )}
          </div>

          {/* Middle Section - Selection Interface */}
          <div className="flex-1 flex items-center justify-center px-4 pb-4">
            <div className="w-full max-w-sm mx-auto">{/* Compact container for no-scroll fit */}
              {/* Progress Indicator */}
              <div className="flex justify-center space-x-2 mb-6">
                {[
                  { step: 1, label: 'Country' },
                  { step: 2, label: 'Cuisine' },
                  { step: 3, label: 'City' },
                  { step: 4, label: 'Results' }
                ].map(({ step, label }) => (
                  <div key={step} className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => handleStepNavigation(step)}
                      className={`w-5 h-5 rounded-none flex items-center justify-center border-2 font-medium transition-colors cursor-pointer hover:scale-110 text-xs ${
                        step <= currentStep 
                          ? 'bg-green-500 text-white border-green-500' 
                          : 'bg-transparent text-white border-white/50 hover:border-white'
                      }`}
                    >
                      {step}
                    </button>
                  </div>
                ))}
              </div>

              {/* Current Selections */}
              {(selectedCountry || selectedCuisine || selectedCity) && (
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {selectedCountry && (
                    <Badge variant="secondary" className="bg-white text-black text-xs px-2 py-1 rounded-none">
                      {selectedCountry}
                    </Badge>
                  )}
                  {selectedCuisine && (
                    <Badge variant="secondary" className="bg-white text-black text-xs px-2 py-1 rounded-none">
                      {selectedCuisine}
                    </Badge>
                  )}
                   {(selectedCity || citySearchInput.trim()) && (
                     <Badge variant="secondary" className="bg-white text-black text-xs px-2 py-1 rounded-none">
                       {selectedCity || citySearchInput.trim()}
                     </Badge>
                   )}
                   {resultCount > 0 && (
                     <Badge variant="secondary" className="bg-white text-black text-xs px-2 py-1 rounded-none">
                       {resultCount} result{resultCount > 1 ? 's' : ''}
                     </Badge>
                   )}
                </div>
              )}

              {/* Step 1: Country Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-center text-white">1: Select Country</h2>
                  <Select onValueChange={handleCountrySelect} value={selectedCountry}>
                    <SelectTrigger className="w-full h-14 text-base bg-white text-black border-2 border-white rounded-none shadow-md">
                      <SelectValue placeholder="Select country..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-300 rounded-none max-h-60 overflow-y-auto z-[100] shadow-lg">
                      {topCountries.map((country) => (
                        <SelectItem key={country} value={country} className="text-base py-3 rounded-none hover:bg-gray-100">
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 2: Cuisine Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-center text-white">2: Select Cuisine</h2>
                  <Select onValueChange={handleCuisineSelect} value={selectedCuisine}>
                    <SelectTrigger className="w-full h-14 text-base bg-white text-black border-2 border-white rounded-none shadow-md">
                      <SelectValue placeholder="Select cuisine..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-300 rounded-none max-h-60 overflow-y-auto z-[100] shadow-lg">
                      {availableCuisines.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine} className="text-base py-3 rounded-none hover:bg-gray-100">
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 3: City Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-center text-white">3: Select City</h2>
                  <Select onValueChange={handleCitySelect} value={selectedCity}>
                    <SelectTrigger className="w-full h-10 text-sm bg-white text-black border-2 border-white rounded-none shadow-md">
                      <SelectValue placeholder="Select city..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-300 rounded-none max-h-48 overflow-y-auto z-[200] shadow-lg">
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} className="text-sm py-2 rounded-none hover:bg-gray-100">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* "or" separator */}
                  <div className="text-center text-white font-medium">or</div>

                  {/* City search input */}
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Type city name..."
                      value={citySearchInput}
                      onChange={(e) => setCitySearchInput(e.target.value)}
                      onKeyDown={handleCityInputKeyDown}
                      className="w-full h-10 text-sm bg-white text-black border-2 border-white rounded-none shadow-md"
                    />
                    {citySearchInput.trim() && (
                      <Button
                        onClick={handleCitySearch}
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs bg-white text-black border border-white rounded-none hover:bg-white/90"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Search
                      </Button>
                    )}
                  </div>

                  {/* Results count selector */}
                  {(selectedCity || citySearchInput.trim()) && (
                    <div className="space-y-2">
                      <label className="block text-white text-sm font-medium">Number of results:</label>
                      <Select onValueChange={(value) => setResultCount(parseInt(value))} value={resultCount.toString()}>
                        <SelectTrigger className="w-full h-10 text-sm bg-white text-black border-2 border-white rounded-none shadow-md">
                          <SelectValue placeholder="Select number..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-gray-300 rounded-none max-h-40 overflow-y-auto z-[300] shadow-lg">
                          {[1, 5, 10].map((count) => (
                            <SelectItem key={count} value={count.toString()} className="text-sm py-2 rounded-none hover:bg-gray-100">
                              {count} result{count > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Get Now and Get Again buttons */}
                  {isComplete && (
                    <div className="flex gap-3 mt-4">
                      <Button 
                        onClick={handleGetNow} 
                        disabled={isLoading}
                        className="flex-1 h-12 text-sm font-bold bg-green-500 text-white border-green-500 rounded-none hover:bg-green-600 disabled:opacity-50 shadow-md"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Getting Results...
                          </>
                        ) : (
                          'GET NOW!'
                        )}
                      </Button>
                      <Button 
                        onClick={handleGetAgain}
                        className="flex-1 h-12 text-sm font-bold bg-white text-black border-2 border-white rounded-none hover:bg-white/90 shadow-md"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        GET AGAIN
                      </Button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Results Section - Fixed for desktop visibility and scrolling */}
        {showResults && businesses.length > 0 && (
          <div className="relative z-50 bg-white min-h-screen w-full md:absolute md:top-0 md:left-0 md:right-0 md:overflow-y-auto">{/* Desktop: overlay full screen with scroll */}
            {/* Navigation header with logo and action buttons */}
            <div className="sticky top-0 bg-white z-50 px-4 py-4 border-b border-dotted border-gray-400">
              {/* Mobile layout */}
              <div className="flex items-center justify-between md:hidden">
                {/* Logo for mobile */}
                <span className="font-bold text-black text-sm">seniortravel.agency</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={exportToCSV}
                    variant="outline" 
                    size="sm"
                    className="h-12 w-12 rounded-none border-black"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleGetAgain}
                    variant="outline" 
                    size="sm"
                    className="h-12 w-12 rounded-none border-black"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-12 w-12 rounded-none border-black"
                        size="sm"
                      >
                        <Menu className="h-5 w-5 text-black" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[85vw] sm:w-80 max-w-sm">
                      <div className="flex flex-col gap-3 pt-6 h-full">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-12 text-left" 
                          onClick={() => window.location.href = '/'}
                        >
                          <Home className="h-5 w-5 mr-3" />
                          <span className="text-base">Home</span>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/about-us">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">About Us</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/how-to">
                            <HelpCircle className="h-5 w-5 mr-3" />
                            <span className="text-base">How To</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/advertise">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">Advertise</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/toolbox">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">Toolbox</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/tv-channel">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">TV Channel</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/dashboard">
                            <Users className="h-5 w-5 mr-3" />
                            <span className="text-base">Dashboard</span>
                          </a>
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
              
              {/* Desktop layout */}
              <div className="hidden md:flex md:items-center md:justify-between">
                {/* Logo on the left */}
                <span className="font-bold text-black text-lg">seniortravel.agency</span>
                
                {/* Action buttons positioned to the left of hamburger menu */}
                <div className="flex gap-2">
                  <Button 
                    onClick={exportToCSV}
                    variant="outline" 
                    size="sm"
                    className="h-12 w-12 rounded-none border-black"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleGetAgain}
                    variant="outline" 
                    size="sm"
                    className="h-12 w-12 rounded-none border-black"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-12 w-12 rounded-none border-black"
                        size="sm"
                      >
                        <Menu className="h-5 w-5 text-black" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[85vw] sm:w-80 max-w-sm">
                      <div className="flex flex-col gap-3 pt-6 h-full">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-12 text-left" 
                          onClick={() => window.location.href = '/'}
                        >
                          <Home className="h-5 w-5 mr-3" />
                          <span className="text-base">Home</span>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/about-us">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">About Us</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/how-to">
                            <HelpCircle className="h-5 w-5 mr-3" />
                            <span className="text-base">How To</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/advertise">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">Advertise</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/toolbox">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">Toolbox</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/tv-channel">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">TV Channel</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/dashboard">
                            <Users className="h-5 w-5 mr-3" />
                            <span className="text-base">Dashboard</span>
                          </a>
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
            
            <div className="p-4 md:max-h-[calc(100vh-120px)] md:overflow-y-auto">
              <RestaurantResults
                restaurants={businesses.map(business => ({
                  name: business.name,
                  address: business.address,
                  googleMapRef: business.mapLink,
                  socialMediaLinks: {
                    facebook: business.facebook,
                    instagram: business.instagram,
                    twitter: business.twitter
                  },
                  contactDetails: {
                    phone: business.phone,
                    email: business.email,
                    website: business.website,
                    menuLink: business.menuLink // Add this line
                  },
                  imageLinks: [business.image],
                  rating: business.rating,
                  reviewCount: business.reviewCount,
                  source: business.source
                }))}
                selectedCity={selectedCity}
                selectedCountry={selectedCountry}
                selectedCategory={selectedCuisine}
              />
            </div>
          </div>
        )}
        {/* Footer removed from mobile */}
      </div>
    </div>
  );
};

export default Index;