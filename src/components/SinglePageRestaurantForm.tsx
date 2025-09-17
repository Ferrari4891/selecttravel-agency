import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Loader2, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { regionData } from '@/data/locationData';
import { useLocationData } from '@/hooks/useLocationData';
// import diningLogo from '@/assets/dining-logo.png';

interface SinglePageRestaurantFormProps {
  onSearch: (searchParams: {
    country: string;
    city: string;
    category: string;
    subcategory: string;
    type: string;
    resultCount: number | string;
  }) => void;
  onReset: () => void;
  isLoading: boolean;
}

const restaurantFoodTypes = [
  'African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 
  'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 
  'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 
  'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'
];

const fastFoodTypes = [
  'Burger Chains', 'Pizza Chains', 'Chicken Chains', 'Sandwich Shops', 'Taco Shops',
  'Asian Fast Food', 'Coffee Chains', 'Bakery Chains', 'Ice Cream Shops', 'Donut Shops'
];

const barTypes = [
  'Sports Bars', 'Wine Bars', 'Cocktail Bars', 'Beer Gardens', 'Rooftop Bars',
  'Dive Bars', 'Hotel Bars', 'Beach Bars', 'Whiskey Bars', 'Piano Bars'
];

const clubTypes = [
  'Dance Clubs', 'Jazz Clubs', 'Comedy Clubs', 'Strip Clubs', 'Karaoke Bars',
  'Live Music Venues', 'Lounge Bars', 'Themed Clubs', 'Beach Clubs', 'Underground Clubs'
];

// Get all countries from regionData
const getAllCountries = () => {
  const countries: string[] = [];
  Object.values(regionData).forEach(region => {
    region.countries.forEach(country => {
      countries.push(country.name);
    });
  });
  return countries.sort();
};

export const SinglePageRestaurantForm: React.FC<SinglePageRestaurantFormProps> = ({
  onSearch,
  onReset,
  isLoading
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Food or Drink
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(''); // Restaurant/Fast Food or Bar/Club
  const [selectedType, setSelectedType] = useState<string>(''); // Specific type
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [resultCount, setResultCount] = useState<string>('3');

  const allCountries = getAllCountries();

  const resultCounts = [
    { value: "1", label: "1 result" },
    { value: "3", label: "3 results" },
    { value: "10", label: "10 results" },
    { value: "all", label: "All results" },
  ];

  const availableTypes = useMemo(() => {
    if (selectedCategory === 'Food' && selectedSubcategory === 'Restaurants') {
      return restaurantFoodTypes;
    } else if (selectedCategory === 'Food' && selectedSubcategory === 'Fast Food') {
      return fastFoodTypes;
    } else if (selectedCategory === 'Drink' && selectedSubcategory === 'Bars') {
      return barTypes;
    } else if (selectedCategory === 'Drink' && selectedSubcategory === 'Clubs') {
      return clubTypes;
    }
    return [];
  }, [selectedCategory, selectedSubcategory]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    const allCities: string[] = [];
    Object.values(regionData).forEach(region => {
      const country = region.countries.find(c => c.name === selectedCountry);
      if (country) {
        allCities.push(...country.cities);
      }
    });
    return allCities;
  }, [selectedCountry]);

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedType('');
    setSelectedCity('');
    setCitySearchInput('');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setSelectedType('');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setSelectedType('');
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySearchInput('');
  };

  const handleCitySearch = () => {
    const searchTerm = citySearchInput.trim().toLowerCase();
    const selectedCountryCities = cities;
    
    let foundCity = selectedCountryCities.find(city => city.toLowerCase() === searchTerm);
    
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

  const handleSubmit = () => {
    if (citySearchInput.trim() && !selectedCity) {
      handleCitySearch();
      return;
    }
    
    const cityToUse = selectedCity || citySearchInput.trim();
    
    if (selectedCountry && selectedCategory && selectedSubcategory && selectedType && cityToUse && resultCount) {
      onSearch({
        country: selectedCountry,
        city: cityToUse,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        type: selectedType,
        resultCount: resultCount === 'all' ? 'all' : parseInt(resultCount)
      });
    }
  };

  const handleReset = () => {
    setSelectedCountry('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedType('');
    setSelectedCity('');
    setCitySearchInput('');
    setResultCount('3');
    onReset();
  };

  const isComplete = selectedCountry && selectedCategory && selectedSubcategory && selectedType && (selectedCity || citySearchInput.trim()) && resultCount;

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-2 border-white rounded-none shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* Header with dining logo */}
        <div className="text-center space-y-1">
          <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-none bg-black">
            <img src="/lovable-uploads/6ce4c283-5ad7-4b59-a3a8-4254d29cd162.png" alt="Dining Guide Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-black text-black">GLOBAL DINING GUIDE</h2>
          <h3 className="text-2xl font-bold text-black">FIND WHAT YOU WANT!</h3>
          <p className="text-lg font-semibold text-muted-foreground">In 15 seconds or less</p>
          <p className="text-base font-medium text-muted-foreground">Discover the perfect dining experience in your chosen destination worldwide.</p>
        </div>

        {/* Current Selections */}
        {(selectedCountry || selectedCategory || selectedSubcategory || selectedType || selectedCity || citySearchInput.trim()) && (
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedCountry && (
              <Badge variant="secondary" className="bg-muted text-foreground text-xs px-2 py-1 rounded-none">
                {selectedCountry}
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="bg-muted text-foreground text-xs px-2 py-1 rounded-none">
                {selectedCategory}
              </Badge>
            )}
            {selectedSubcategory && (
              <Badge variant="secondary" className="bg-muted text-foreground text-xs px-2 py-1 rounded-none">
                {selectedSubcategory}
              </Badge>
            )}
            {selectedType && (
              <Badge variant="secondary" className="bg-muted text-foreground text-xs px-2 py-1 rounded-none">
                {selectedType}
              </Badge>
            )}
            {(selectedCity || citySearchInput.trim()) && (
              <Badge variant="secondary" className="bg-muted text-foreground text-xs px-2 py-1 rounded-none">
                {selectedCity || citySearchInput.trim()}
              </Badge>
            )}
          </div>
        )}

        {/* Made for seniors text - centered between tagline and country selector */}
        <div className="flex items-center justify-center py-4">
          <p className="text-base font-normal text-black">Made for seniors by seniors</p>
        </div>

        {/* Country Selection */}
        <div className="space-y-2">
          <label className="text-lg font-bold text-foreground">Select Country</label>
          <Select onValueChange={handleCountrySelect} value={selectedCountry}>
            <SelectTrigger className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none">
              <SelectValue placeholder="Choose a country" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-border rounded-none max-h-60 overflow-y-auto z-[100]">
              {allCountries.map((country) => (
                <SelectItem key={country} value={country} className="text-base py-3 rounded-none hover:bg-muted">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selection */}
        <div className="space-y-2">
          <label className="text-lg font-bold text-foreground">Select City</label>
          <Select onValueChange={handleCitySelect} value={selectedCity} disabled={!selectedCountry}>
            <SelectTrigger className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none">
              <SelectValue placeholder="Choose a city" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-border rounded-none max-h-48 overflow-y-auto z-[200]">
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-base py-3 rounded-none hover:bg-muted">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-center text-sm text-muted-foreground font-medium">or</div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Type city name..."
              value={citySearchInput}
              onChange={(e) => setCitySearchInput(e.target.value)}
              onKeyDown={handleCityInputKeyDown}
              className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none"
              disabled={!selectedCountry}
            />
            {citySearchInput.trim() && (
              <Button
                onClick={handleCitySearch}
                variant="outline"
                size="sm"
                className="w-full h-10 text-sm bg-background text-foreground border border-border rounded-none hover:bg-muted"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            )}
          </div>
        </div>

        {/* Food or Drink Selection */}
        <div className="space-y-2">
          <label className="text-lg font-bold text-foreground">Select Category</label>
          <Select onValueChange={handleCategorySelect} value={selectedCategory} disabled={!selectedCountry}>
            <SelectTrigger className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none">
              <SelectValue placeholder="Choose Food or Drink" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-border rounded-none max-h-60 overflow-y-auto z-[100]">
              <SelectItem value="Food" className="text-base py-3 rounded-none hover:bg-muted">
                Food
              </SelectItem>
              <SelectItem value="Drink" className="text-base py-3 rounded-none hover:bg-muted">
                Drink
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Selection */}
        {selectedCategory && (
          <div className="space-y-2">
            <label className="text-lg font-bold text-foreground">
              Select {selectedCategory === 'Food' ? 'Dining Type' : 'Venue Type'}
            </label>
            <Select onValueChange={handleSubcategorySelect} value={selectedSubcategory} disabled={!selectedCategory}>
              <SelectTrigger className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none">
                <SelectValue placeholder={selectedCategory === 'Food' ? 'Choose dining type' : 'Choose venue type'} />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-border rounded-none max-h-60 overflow-y-auto z-[100]">
                {selectedCategory === 'Food' ? (
                  <>
                    <SelectItem value="Restaurants" className="text-base py-3 rounded-none hover:bg-muted">
                      Restaurants
                    </SelectItem>
                    <SelectItem value="Fast Food" className="text-base py-3 rounded-none hover:bg-muted">
                      Fast Food
                    </SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Bars" className="text-base py-3 rounded-none hover:bg-muted">
                      Bars
                    </SelectItem>
                    <SelectItem value="Clubs" className="text-base py-3 rounded-none hover:bg-muted">
                      Clubs
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Type Selection */}
        {selectedSubcategory && availableTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-lg font-bold text-foreground">
              Select {selectedCategory === 'Food' ? 'Cuisine Type' : 'Venue Style'}
            </label>
            <Select onValueChange={handleTypeSelect} value={selectedType} disabled={!selectedSubcategory}>
              <SelectTrigger className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none">
                <SelectValue placeholder={selectedCategory === 'Food' ? 'Choose cuisine type' : 'Choose venue style'} />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-border rounded-none max-h-60 overflow-y-auto z-[100]">
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-base py-3 rounded-none hover:bg-muted">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Number of Results */}
        <div className="space-y-2">
          <label className="text-lg font-bold text-foreground">Number of Results</label>
          <Select onValueChange={(value) => setResultCount(value)} value={resultCount}>
            <SelectTrigger className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none">
              <SelectValue placeholder="Choose number of results" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-border rounded-none max-h-40 overflow-y-auto z-[300]">
              {resultCounts.map((count) => (
                <SelectItem key={count.value} value={count.value} className="text-base py-3 rounded-none hover:bg-muted">
                  {count.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit} 
            disabled={!isComplete || isLoading}
            className="flex-1 h-12 text-lg font-black bg-green-500 text-white border-green-500 rounded-none hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                SEARCHING...
              </>
            ) : (
              'SEARCH'
            )}
          </Button>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="flex-1 h-12 text-lg font-black bg-background text-foreground border-2 border-border rounded-none hover:bg-muted"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            RESET
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};