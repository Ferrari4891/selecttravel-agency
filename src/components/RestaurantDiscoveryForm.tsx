import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Download, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import placeholderEat from '@/assets/placeholder-eat.jpg';
import placeholderDrink from '@/assets/placeholder-drink.jpg';
import placeholderStay from '@/assets/placeholder-stay.jpg';
import placeholderPlay from '@/assets/placeholder-play.jpg';
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
export const RestaurantDiscoveryForm = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [forceMenuOpen, setForceMenuOpen] = useState(false);
  const {
    toast
  } = useToast();
  const categories = [{
    name: 'Eat',
    icon: eatIcon
  }, {
    name: 'Stay',
    icon: stayIcon
  }, {
    name: 'Drink',
    icon: drinkIcon
  }, {
    name: 'Play',
    icon: playIcon
  }];
  const regions = Object.keys(regionData);
  const countries = selectedRegion ? regionData[selectedRegion as keyof typeof regionData]?.countries || [] : [];
  const cities = selectedCountry ? countries.find(c => c.name === selectedCountry)?.cities || [] : [];
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedCity('');
    setRestaurants([]);
  };
  const getTagline = () => {
    const baseText = () => {
      switch (selectedCategory) {
        case 'Eat':
          return 'Discover the TOP 20 restaurants in the ciy selected';
        case 'Drink':
          return 'Discover the TOP 20 bars and cafes in the city selected';
        case 'Stay':
          return 'Discover the TOP 20 hotels and accommodations in the city selected';
        case 'Play':
          return 'Discover the TOP 20 entertainment venues in the city selected';
        default:
          return 'Discover the TOP 20 places in the city selected';
      }
    };
    return `${baseText()}. All business listing ratings are based on Google Reviews, Yelp and Trip Advisor.`;
  };
  const getThemeClass = () => {
    switch (selectedCategory) {
      case 'Eat':
        return 'theme-eat';
      case 'Drink':
        return 'theme-drink';
      case 'Stay':
        return 'theme-stay';
      case 'Play':
        return 'theme-play';
      default:
        return '';
    }
  };
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
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedCountry('');
    setSelectedCity('');
    setRestaurants([]);
  };
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCity('');
    setRestaurants([]);
  };
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setCitySearchInput('');
    setRestaurants([]);
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
      setSelectedCity(foundCity);
      setCitySearchInput('');
      setRestaurants([]);
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
  const searchRestaurants = async () => {
    if (!selectedCategory || !selectedRegion || !selectedCountry || !selectedCity) {
      toast({
        title: "All Steps Required",
        description: "Please complete all steps before getting your results.",
        variant: "destructive"
      });
      return;
    }

    // Only allow USA cities for this implementation
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
      // Simulate API call - In real implementation, this would call multiple APIs
      // Limited to exactly 20 businesses per category per city
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate realistic business names based on category
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

      // Working placeholder images from Unsplash
      const placeholderImages = ['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop&crop=center&q=80', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop&crop=center&q=80'];

      // Mock restaurant data - exactly 20 per category per city (USA only)
      const mockRestaurants: Restaurant[] = Array.from({
        length: 20
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
        // Ensure 3+ star rating
        reviewCount: Math.floor(Math.random() * 800) + 50,
        source: ['Google Reviews', 'Yelp', 'TripAdvisor'][Math.floor(Math.random() * 3)]
      }));
      setRestaurants(mockRestaurants);
      toast({
        title: "Success!",
        description: `Found exactly 20 ${selectedCategory.toLowerCase()} businesses in ${selectedCity} with 3+ star ratings`
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
  const exportToCSV = () => {
    if (restaurants.length === 0) return;
    const csvHeaders = ['Name', 'Address', 'Google Map Reference', 'Facebook', 'Instagram', 'Twitter', 'Phone', 'Email', 'Website', 'Image Links', 'Rating', 'Review Count', 'Source'];
    const csvRows = restaurants.map(restaurant => [restaurant.name, restaurant.address, restaurant.googleMapRef, restaurant.socialMediaLinks.facebook || '', restaurant.socialMediaLinks.instagram || '', restaurant.socialMediaLinks.twitter || '', restaurant.contactDetails.phone || '', restaurant.contactDetails.email || '', restaurant.contactDetails.website || '', restaurant.imageLinks.join('; '), restaurant.rating.toFixed(1), restaurant.reviewCount, restaurant.source]);
    const csvContent = [csvHeaders, ...csvRows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
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
  const handleLanguageClick = () => {
    setForceMenuOpen(true);
    // Reset after a short delay to allow for future clicks
    setTimeout(() => setForceMenuOpen(false), 100);
  };
  return <div className={`min-h-screen bg-background ${getThemeClass()}`}>
      <div className="max-w-4xl mx-auto space-y-8 p-6 bg-background">
        <div className="pt-0">
          <Navigation onMenuStateChange={setMenuOpen} forceMenuOpen={forceMenuOpen} />
        </div>
        

        <Card className="shadow-elegant">
          <CardHeader className="bg-background">
            <CardTitle className="flex items-center gap-2 text-5xl font-bold text-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              SELECT YOUR GUIDE
            </CardTitle>
            <CardDescription className="font-semibold text-muted-foreground">Follow the 5 steps to discover the top 20 Businesses in thousands of cities around the world in 60 seconds or less!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 bg-background">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase whitespace-nowrap">1: SELECT CATEGORY</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="font-bold">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center gap-2">
                          <img src={category.icon} alt={category.name} className="w-5 h-5 object-cover rounded" />
                          {category.name}
                        </div>
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase">2: SELECT REGION</label>
                <Select value={selectedRegion} onValueChange={handleRegionChange} disabled={!selectedCategory}>
                  <SelectTrigger className="font-bold">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase">3: SELECT COUNTRY</label>
                <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={!selectedRegion}>
                  <SelectTrigger className="font-bold">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => <SelectItem key={country.name} value={country.name}>
                        {country.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase">4: SELECT CITY</label>
                <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedCountry}>
                  <SelectTrigger className="font-bold">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                
                {selectedCountry && (
                  <div className="mt-3 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Or search for a city:</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter city name"
                        value={citySearchInput}
                        onChange={(e) => setCitySearchInput(e.target.value)}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCitySearch}
                        disabled={!citySearchInput.trim()}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 items-center">
              <Button onClick={searchRestaurants} disabled={!selectedCategory || !selectedRegion || !selectedCountry || !selectedCity || isLoading} size="default" className="rounded-none px-12">
                {isLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </> : '5 GET NOW!'}
              </Button>

              {restaurants.length > 0 && <Button onClick={exportToCSV} variant="secondary" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>}
            </div>
          </CardContent>
        </Card>

        {restaurants.length > 0 && <RestaurantResults restaurants={restaurants} selectedCity={selectedCity} selectedCountry={selectedCountry} selectedCategory={selectedCategory} />}
      </div>
    </div>;
};