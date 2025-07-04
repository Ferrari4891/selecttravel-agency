import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Download, Info, HelpCircle, Languages } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const { toast } = useToast();

  const categories = ['Eat', 'Stay', 'Drink', 'Play'];
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
        name: `${selectedCategory} Place ${i + 1}`,
        address: `${i + 1} Main Street, ${selectedCity}, ${selectedCountry}`,
        googleMapRef: `https://maps.google.com/?q=${i + 1}+Main+Street+${selectedCity}+${selectedCountry}`,
        socialMediaLinks: {
          facebook: `https://facebook.com/place${i + 1}`,
          instagram: `https://instagram.com/place${i + 1}`,
        },
        contactDetails: {
          phone: `+1-555-${String(i + 100).padStart(4, '0')}`,
          email: `contact@place${i + 1}.com`,
          website: `https://place${i + 1}.com`,
        },
        imageLinks: [`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center&q=80`],
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 500) + 50,
        source: ['TripAdvisor', 'Yelp', 'Google Reviews'][Math.floor(Math.random() * 3)],
      }));

      setRestaurants(mockRestaurants);
      toast({
        title: "Success!",
        description: `Found ${mockRestaurants.length} places in ${selectedCategory}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
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
    link.setAttribute('download', `${selectedCategory}_places.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Downloaded",
      description: "Data has been exported to CSV format.",
    });
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
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="en">
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              Choose Your Guidebook
            </CardTitle>
            <CardDescription>
              Follow the 5 steps to discover the top 40 places
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Step 1: Choose Category</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Step 2: Select Region</label>
                <Select 
                  value={selectedRegion} 
                  onValueChange={handleRegionChange}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Step 3: Select Country</label>
                <Select 
                  value={selectedCountry} 
                  onValueChange={handleCountryChange}
                  disabled={!selectedRegion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.name} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Step 4: Select City</label>
                <Select 
                  value={selectedCity} 
                  onValueChange={handleCityChange}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
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
                disabled={!selectedCategory || !selectedRegion || !selectedCountry || !selectedCity || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Your Results...
                  </>
                ) : (
                  'Step 5: Get My Results'
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