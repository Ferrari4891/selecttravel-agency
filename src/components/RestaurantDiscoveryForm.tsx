import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Download, Info, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { regionData } from '@/data/locationData';
import { RestaurantResults } from './RestaurantResults';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedCountry('');
    setSelectedCity('');
    setCurrentStep(2);
    setRestaurants([]);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCity('');
    setCurrentStep(3);
    setRestaurants([]);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setCurrentStep(4);
    setRestaurants([]);
  };

  const searchRestaurants = async () => {
    if (!selectedCity) {
      toast({
        title: "Selection Required",
        description: "Please select a city before searching for restaurants.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - In real implementation, this would call multiple APIs
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock restaurant data for demonstration
      const mockRestaurants: Restaurant[] = Array.from({ length: 40 }, (_, i) => ({
        name: `Restaurant ${i + 1}`,
        address: `${i + 1} Main Street, ${selectedCity}, ${selectedCountry}`,
        googleMapRef: `https://maps.google.com/?q=${i + 1}+Main+Street+${selectedCity}+${selectedCountry}`,
        socialMediaLinks: {
          facebook: `https://facebook.com/restaurant${i + 1}`,
          instagram: `https://instagram.com/restaurant${i + 1}`,
        },
        contactDetails: {
          phone: `+1-555-${String(i + 100).padStart(4, '0')}`,
          email: `contact@restaurant${i + 1}.com`,
          website: `https://restaurant${i + 1}.com`,
        },
        imageLinks: [`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center&q=80`],
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 500) + 50,
        source: ['TripAdvisor', 'Yelp', 'Google Reviews'][Math.floor(Math.random() * 3)],
      }));

      setRestaurants(mockRestaurants);
      toast({
        title: "Success!",
        description: `Found ${mockRestaurants.length} restaurants in ${selectedCity}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch restaurant data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (restaurants.length === 0) return;

    const csvHeaders = [
      'Name',
      'Address',
      'Google Map Reference',
      'Facebook',
      'Instagram',
      'Twitter',
      'Phone',
      'Email',
      'Website',
      'Image Links',
      'Rating',
      'Review Count',
      'Source'
    ];

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

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `restaurants_${selectedCity}_${selectedCountry}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Downloaded",
      description: "Restaurant data has been exported to CSV format.",
    });
  };

  const getCurrentStepData = () => {
    if (currentStep === 2 && selectedRegion) {
      return regionData[selectedRegion]?.countries || [];
    }
    if (currentStep === 3 && selectedCountry) {
      const region = regionData[selectedRegion];
      return region?.countries.find(c => c.name === selectedCountry)?.cities || [];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Link to="/about-us">
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                About Us
              </Button>
            </Link>
            <Link to="/how-to">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                How To
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            smartguidebooks.com
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover the TOP 40 restaurants in the area
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Selection
            </CardTitle>
            <CardDescription>
              Choose your region, country, and city to discover the best restaurants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 2, 3, 4].map((step) => (
                <Badge
                  key={step}
                  variant={currentStep >= step ? "default" : "secondary"}
                  className="transition-all duration-300"
                >
                  Step {step}
                </Badge>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Region</label>
                <Select value={selectedRegion} onValueChange={handleRegionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(regionData).map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select
                  value={selectedCountry}
                  onValueChange={handleCountryChange}
                  disabled={!selectedRegion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentStep >= 2 && getCurrentStepData().map((country: any) => (
                      <SelectItem key={country.name} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">City/County</label>
                <Select
                  value={selectedCity}
                  onValueChange={handleCityChange}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentStep >= 3 && getCurrentStepData().map((city: string) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={searchRestaurants}
                disabled={!selectedCity || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching Restaurants...
                  </>
                ) : (
                  'Search Restaurants'
                )}
              </Button>

              {restaurants.length > 0 && (
                <Button
                  onClick={exportToCSV}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {restaurants.length > 0 && (
          <RestaurantResults
            restaurants={restaurants}
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
          />
        )}
      </div>
    </div>
  );
};