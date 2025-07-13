import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';
import { regionData } from '@/data/locationData';
import { countryImages } from '@/data/countryImages';
import { cityImages } from '@/data/cityImages';
import { RestaurantResults } from './RestaurantResults';
import Footer from './Footer';
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
      return cityImages[selectedCity] || getCategoryPlaceholder();
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
    setRestaurants([]);
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
    setIsLoading(true);
    try {
      // Simulate API call - In real implementation, this would call multiple APIs
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock restaurant data for demonstration
      const mockRestaurants: Restaurant[] = Array.from({
        length: 20
      }, (_, i) => ({
        name: `${selectedCategory} Place ${i + 1}`,
        address: `${i + 1} Main Street, ${selectedCity}, ${selectedCountry}`,
        googleMapRef: `https://maps.google.com/?q=${i + 1}+Main+Street+${selectedCity}+${selectedCountry}`,
        socialMediaLinks: {
          facebook: `https://facebook.com/place${i + 1}`,
          instagram: `https://instagram.com/place${i + 1}`
        },
        contactDetails: {
          phone: `+1-555-${String(i + 100).padStart(4, '0')}`,
          email: `contact@place${i + 1}.com`,
          website: `https://place${i + 1}.com`
        },
        imageLinks: [`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center&q=80`],
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 500) + 50,
        source: ['TripAdvisor', 'Yelp', 'Google Reviews'][Math.floor(Math.random() * 3)]
      }));
      setRestaurants(mockRestaurants);
      toast({
        title: "Success!",
        description: `Found ${mockRestaurants.length} places in ${selectedCategory}`
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
      <div className="max-w-4xl mx-auto space-y-8 p-6 bg-blue-100">
        <div className="pt-0">
          <Navigation 
            onMenuStateChange={setMenuOpen}
            forceMenuOpen={forceMenuOpen}
          />
        </div>
        
        <div className="relative text-center space-y-4 py-16 px-8 overflow-hidden border-8 border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)]" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${getHeroImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            smartguides.live
          </h1>
          <p className="text-white text-sm px-4 md:text-base">
            {getTagline()}
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="bg-blue-200">
            <CardTitle className="flex items-center gap-2 font-extrabold text-blue-600 text-5xl">
              <MapPin className="h-5 w-5 text-primary" />
              CHOOSE YOUR GUIDE
            </CardTitle>
            <CardDescription className="font-semibold text-slate-700">Follow the 5 steps to discover the top 20 Businesses in thousands of cities around the world in 60 seconds or less!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 bg-blue-200">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase whitespace-nowrap">STEP 1: CHOOSE CATEGORY</label>
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
                <label className="text-sm font-bold uppercase">STEP 2: SELECT REGION</label>
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
                <label className="text-sm font-bold uppercase">STEP 3: SELECT COUNTRY</label>
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
                <label className="text-sm font-bold uppercase">STEP 4: SELECT CITY</label>
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
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 items-center">
              <Button onClick={searchRestaurants} disabled={!selectedCategory || !selectedRegion || !selectedCountry || !selectedCity || isLoading} size="default" className="rounded-none px-12">
                {isLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </> : 'GET NOW!'}
              </Button>

              {restaurants.length > 0 && <Button onClick={exportToCSV} variant="secondary" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>}
            </div>
          </CardContent>
        </Card>

        {restaurants.length > 0 && <RestaurantResults restaurants={restaurants} selectedCity={selectedCity} selectedCountry={selectedCountry} />}
      </div>
      
      <Footer themeClass={getThemeClass()} onLanguageClick={handleLanguageClick} />
    </div>;
};