import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Download, Search } from 'lucide-react';
import { Navigation } from './Navigation';
import { regionData } from '@/data/locationData';
import { countryImages } from '@/data/countryImages';
import { cityImages } from '@/data/cityImages';
import { RestaurantResults } from './RestaurantResults';
import { useToast } from '@/hooks/use-toast';
import heroBackground from '@/assets/hero-background.jpg';
import heroEat from '@/assets/hero-eat.jpg';
import heroDrink from '@/assets/hero-drink.jpg';
import heroStay from '@/assets/hero-stay.jpg';
import heroPlay from '@/assets/hero-play.jpg';
import heroNorthAmerica from '@/assets/hero-north-america.jpg';
import heroEurope from '@/assets/hero-europe.jpg';
import heroAsia from '@/assets/hero-asia.jpg';
import heroSouthAmerica from '@/assets/hero-south-america.jpg';
import heroAfricaMiddleEast from '@/assets/hero-africa-middle-east.jpg';
import eatIcon from '@/assets/eat-icon.jpg';
import drinkIcon from '@/assets/drink-icon.jpg';
import stayIcon from '@/assets/stay-icon.jpg';
import playIcon from '@/assets/play-icon.jpg';

interface Restaurant {
  name: string;
  address: string;
  googleMapRef: string;
  socialMediaLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  contactDetails: {
    phone?: string;
    email?: string;
    website?: string;
    menuLink?: string;
  };
  imageLinks: string[];
  rating: number;
  reviewCount: number;
  source: string;
}

interface MobileRestaurantFormProps {
  onSelectionChange?: (category: string, region: string, country: string, city: string) => void;
}

export const MobileRestaurantForm = ({ onSelectionChange }: MobileRestaurantFormProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [resultCount, setResultCount] = useState<number>(20);
  const [showResultsOptions, setShowResultsOptions] = useState(false);
  const [isGetNowActive, setIsGetNowActive] = useState(false);

  const { toast } = useToast();

  const categories = [
    { name: 'Eat', icon: eatIcon },
    { name: 'Stay', icon: stayIcon },
    { name: 'Drink', icon: drinkIcon },
    { name: 'Play', icon: playIcon }
  ];

  const regions = Object.keys(regionData);
  const countries = selectedRegion ? regionData[selectedRegion as keyof typeof regionData]?.countries || [] : [];
  const cities = selectedCountry ? countries.find(c => c.name === selectedCountry)?.cities || [] : [];

  const getHeroImage = () => {
    if (selectedCity) {
      return cityImages[selectedCity] || heroBackground;
    }
    if (selectedCountry) {
      return countryImages[selectedCountry] || heroBackground;
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
          return heroBackground;
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

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedCity('');
    setShowResultsOptions(false);
    setIsGetNowActive(false);
    setRestaurants([]);
    onSelectionChange?.(value, '', '', '');
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedCountry('');
    setSelectedCity('');
    setShowResultsOptions(false);
    setIsGetNowActive(false);
    setRestaurants([]);
    onSelectionChange?.(selectedCategory, value, '', '');
  };

  const handleCountryChange = (value: string) => {
    console.log('Country changed to:', value);
    setSelectedCountry(value);
    setSelectedCity('');
    setShowResultsOptions(false);
    setIsGetNowActive(false);
    setRestaurants([]);
    console.log('Countries available:', countries.length);
    console.log('Cities available:', selectedRegion ? countries.find(c => c.name === value)?.cities.length : 0);
    onSelectionChange?.(selectedCategory, selectedRegion, value, '');
  };

  const handleCityChange = (value: string) => {
    console.log('City changed to:', value);
    setSelectedCity(value);
    setCitySearchInput('');
    setShowResultsOptions(true);
    setIsGetNowActive(false);
    setRestaurants([]);
    onSelectionChange?.(selectedCategory, selectedRegion, selectedCountry, value);
  };

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
    
    let foundCity = allCities.find(city => city.toLowerCase() === searchTerm);
    
    if (!foundCity) {
      foundCity = allCities.find(city => city.toLowerCase().includes(searchTerm));
    }

    if (foundCity) {
      setSelectedCity(foundCity);
      setCitySearchInput('');
      setShowResultsOptions(true);
      setIsGetNowActive(false);
      setRestaurants([]);
      onSelectionChange?.(selectedCategory, selectedRegion, selectedCountry, foundCity);
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

  const handleResultCountChange = (value: string) => {
    setResultCount(parseInt(value));
    setIsGetNowActive(true);
  };

  const searchRestaurants = async () => {
    if (!selectedCategory || !selectedRegion || !selectedCountry || !selectedCity) {
      toast({
        title: "All Steps Required",
        description: "Please complete all steps before getting your results.",
        variant: "destructive"
      });
      return;
    }

    if (selectedCountry !== 'United States') {
      toast({
        title: "USA Cities Only",
        description: "Currently only supporting cities in the United States.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const getBusinessName = (category: string, index: number) => {
        const businessTypes = {
          'Eat': ['Restaurant', 'Bistro', 'Grill', 'Kitchen', 'Cafe', 'Diner', 'Eatery'],
          'Drink': ['Bar', 'Lounge', 'Pub', 'Tavern', 'Brewery', 'Wine Bar', 'Cocktail Bar'],
          'Stay': ['Hotel', 'Inn', 'Resort', 'Lodge', 'Suites', 'Boutique Hotel'],
          'Play': ['Entertainment Center', 'Theater', 'Club', 'Venue', 'Arena', 'Gaming Lounge']
        };
        const names = ['Golden', 'Royal', 'Grand', 'Elite', 'Prime', 'Classic', 'Modern', 'Urban', 'Sunset', 'Riverside', 'Downtown', 'Central', 'Main Street', 'Corner', 'Blue Moon', 'Red Oak', 'Green Valley', 'Silver Star', 'Diamond'];
        const type = businessTypes[category as keyof typeof businessTypes] || ['Place'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomType = type[Math.floor(Math.random() * type.length)];
        return `${randomName} ${randomType}`;
      };

      const placeholderImages = ['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&crop=center&q=80'];

      const mockRestaurants: Restaurant[] = Array.from({
        length: resultCount
      }, (_, i) => ({
        name: getBusinessName(selectedCategory, i),
        address: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Broadway', 'First Ave', 'Oak St', 'Park Ave', 'Center St'][Math.floor(Math.random() * 6)]}, ${selectedCity}, ${selectedCountry}`,
        googleMapRef: `https://maps.google.com/?q=${encodeURIComponent(`${selectedCity}, ${selectedCountry}`)}`,
        socialMediaLinks: {
          facebook: Math.random() > 0.3 ? `https://facebook.com/business${i + 1}` : undefined,
          instagram: Math.random() > 0.2 ? `https://instagram.com/business${i + 1}` : undefined,
          twitter: Math.random() > 0.6 ? `https://twitter.com/business${i + 1}` : undefined
        },
        contactDetails: {
          phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          email: Math.random() > 0.4 ? `info@business${i + 1}.com` : undefined,
          website: Math.random() > 0.3 ? `https://business${i + 1}.com` : undefined,
          menuLink: selectedCategory === 'Eat' && Math.random() > 0.4 ? `https://menu.business${i + 1}.com` : undefined
        },
        imageLinks: [placeholderImages[i % placeholderImages.length]],
        rating: Math.max(3.0, 3.0 + Math.random() * 2.0),
        reviewCount: Math.floor(Math.random() * 800) + 50,
        source: ['Google Reviews', 'Yelp', 'TripAdvisor'][Math.floor(Math.random() * 3)]
      }));

      setRestaurants(mockRestaurants);
      toast({
        title: "Success!",
        description: `Found exactly ${resultCount} ${selectedCategory.toLowerCase()} businesses in ${selectedCity} with 3+ star ratings`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAgain = () => {
    setSelectedCategory('');
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedCity('');
    setCitySearchInput('');
    setShowResultsOptions(false);
    setIsGetNowActive(false);
    setRestaurants([]);
    setResultCount(20);
  };

  const exportToCSV = () => {
    if (restaurants.length === 0) return;
    const csvHeaders = ['Name', 'Address', 'Google Map Reference', 'Facebook', 'Instagram', 'Twitter', 'Phone', 'Email', 'Website', 'Image Links', 'Rating', 'Review Count', 'Source'];
    const csvRows = restaurants.map(restaurant => [
      restaurant.name,
      restaurant.address,
      restaurant.googleMapRef,
      restaurant.socialMediaLinks.facebook || '',
      restaurant.socialMediaLinks.instagram || '',
      restaurant.socialMediaLinks.twitter || '',
      restaurant.contactDetails.phone || '',
      restaurant.contactDetails.email || '',
      restaurant.contactDetails.website || '',
      restaurant.imageLinks.join('; '),
      restaurant.rating.toFixed(1),
      restaurant.reviewCount,
      restaurant.source
    ]);
    const csvContent = [csvHeaders, ...csvRows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCategory}_places.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "CSV Downloaded",
      description: "Data has been exported to CSV format."
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Full screen hero image */}
      <div 
        className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getHeroImage()})` }}
      >
        {/* Navigation overlay */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <Navigation />
        </div>

        {/* Selection form overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pt-20">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-center">
                <MapPin className="h-5 w-5 text-primary" />
                SELECT YOUR GUIDE
              </CardTitle>
              <CardDescription className="text-center font-semibold">
                Follow the steps below and get 3+ star businesses in 60 seconds!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Category */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">1: SELECT CATEGORY</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="font-bold h-12">
                    <SelectValue placeholder="Choose your category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center gap-3">
                          <img src={category.icon} alt={category.name} className="w-6 h-6 object-cover" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Region */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">2: SELECT REGION</label>
                <Select value={selectedRegion} onValueChange={handleRegionChange} disabled={!selectedCategory}>
                  <SelectTrigger className="font-bold h-12">
                    <SelectValue placeholder="Choose your region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>
                        <span className="font-medium">{region}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 3: Country */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">3: SELECT COUNTRY</label>
                <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={!selectedRegion}>
                  <SelectTrigger className="font-bold h-12">
                    <SelectValue placeholder="Choose your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country.name} value={country.name}>
                        <span className="font-medium">{country.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 4: City */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">4: SELECT CITY</label>
                
                {/* City search input above dropdown */}
                {selectedCountry && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Type in a city:</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter city name"
                        value={citySearchInput}
                        onChange={(e) => setCitySearchInput(e.target.value)}
                        className="font-medium h-12"
                      />
                      <Button
                        size="default"
                        variant="outline"
                        onClick={handleCitySearch}
                        disabled={!citySearchInput.trim()}
                        className="px-4 h-12"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* OR text */}
                {selectedCountry && (
                  <div className="text-center text-sm font-medium text-muted-foreground">
                    or
                  </div>
                )}

                {/* City dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Choose from list:</label>
                  <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedCountry}>
                    <SelectTrigger className="font-bold h-12">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>
                          <span className="font-medium">{city}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Step 5: Results Count - Show when city is selected */}
              {showResultsOptions && (
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wide">5: SELECT HOW MANY RESULTS</label>
                  <Select value={resultCount.toString()} onValueChange={handleResultCountChange}>
                    <SelectTrigger className="font-bold h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Result</SelectItem>
                      <SelectItem value="3">3 Results</SelectItem>
                      <SelectItem value="10">10 Results</SelectItem>
                      <SelectItem value="20">20 Results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Buttons - Show when city is selected */}
              {showResultsOptions && (
                <div className="space-y-2">
                  <Button 
                    onClick={searchRestaurants} 
                    disabled={!isGetNowActive || isLoading} 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-800"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'GET NOW!'
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleGetAgain} 
                    variant="outline"
                    size="lg" 
                    className="w-full h-12 text-lg font-bold"
                  >
                    GET AGAIN
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results section */}
      {restaurants.length > 0 && (
        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <Button onClick={exportToCSV} variant="secondary" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <RestaurantResults 
            restaurants={restaurants} 
            selectedCity={selectedCity} 
            selectedCountry={selectedCountry} 
            selectedCategory={selectedCategory} 
          />
        </div>
      )}
    </div>
  );
};