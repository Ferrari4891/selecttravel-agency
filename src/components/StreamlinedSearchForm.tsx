import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLocationData } from '@/hooks/useLocationData';
import { useCustomCities } from '@/hooks/useCustomCities';
import { regionData } from '@/data/locationData';
import { Loader2, MapPin, DollarSign, Utensils, Wine, Coffee } from 'lucide-react';
import restaurantGuideLogo from '@/assets/restaurant-guide-logo.png';

type SearchType = 'price' | 'cuisine' | 'food' | 'drink';

interface SearchFilters {
  searchType: SearchType;
  country: string;
  city: string;
  priceLevel?: string;
  cuisineType?: string;
  foodSpecialty?: string;
  drinkSpecialty?: string;
  resultCount: number;
}

interface StreamlinedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  isLoading: boolean;
}

// Predefined options based on database
const priceOptions = [
  { value: '$', label: '$', description: 'Budget-friendly' },
  { value: '$$', label: '$$', description: 'Mid-range' },
  { value: '$$$', label: '$$$', description: 'Premium' }
];

const cuisineOptions = [
  'Mexican', 'Chinese', 'Italian', 'French', 'Japanese', 'Indian', 'Thai', 
  'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish', 
  'Turkish', 'Lebanese'
];

const foodOptions = [
  'Pizza', 'Burger', 'Steak', 'Pasta', 'Sushi', 'Tacos', 'BBQ', 'Seafood', 
  'Chicken', 'Salad', 'Sandwich', 'Noodles', 'Curry', 'Soup', 'Dessert'
];

const drinkOptions = [
  'Craft Beer', 'Wine', 'Cocktails', 'Whiskey', 'Vodka', 'Gin', 'Rum', 
  'Tequila', 'Coffee', 'Tea', 'Smoothies', 'Fresh Juice', 'Soft Drinks'
];

const resultCountOptions = [10, 25, 50, 100];

const getAllCountries = () => {
  const allCountries = new Set<string>();
  Object.values(regionData).forEach(region => {
    region.countries.forEach(country => {
      allCountries.add(country.name);
    });
  });
  
  // Ensure Vietnam is explicitly included
  allCountries.add('Vietnam');
  
  return Array.from(allCountries).sort();
};

export const StreamlinedSearchForm: React.FC<StreamlinedSearchFormProps> = ({
  onSearch,
  onReset,
  isLoading
}) => {
  const [searchType, setSearchType] = useState<SearchType>('price');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceLevel, setPriceLevel] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [foodSpecialty, setFoodSpecialty] = useState('');
  const [drinkSpecialty, setDrinkSpecialty] = useState('');
  const [resultCount, setResultCount] = useState(25);

  const allCountries = useMemo(() => getAllCountries(), []);
  const { addCustomCity, isLoading: isAddingCity } = useCustomCities();
  
  const { cities } = useLocationData('', selectedCountry, '');

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    return cities.filter(city => 
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [cities, citySearch]);

  const handleCitySearch = (value: string) => {
    setCitySearch(value);
    setSelectedCity('');
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySearch(city);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity('');
    setCitySearch('');
  };

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    // Reset specific selections when changing type
    setPriceLevel('');
    setCuisineType('');
    setFoodSpecialty('');
    setDrinkSpecialty('');
  };

  const isComplete = selectedCountry && (citySearch.trim() || selectedCity) && (
    (searchType === 'price' && priceLevel) ||
    (searchType === 'cuisine' && cuisineType) ||
    (searchType === 'food' && foodSpecialty) ||
    (searchType === 'drink' && drinkSpecialty)
  );

  const handleSubmit = async () => {
    if (!isComplete) return;

    // If user typed a city that's not in the list, add it first
    const finalCity = selectedCity || citySearch.trim();
    if (citySearch.trim() && !cities.includes(citySearch.trim()) && !selectedCity) {
      await addCustomCity(citySearch.trim(), selectedCountry);
    }

    const filters: SearchFilters = {
      searchType,
      country: selectedCountry,
      city: finalCity,
      resultCount
    };

    switch (searchType) {
      case 'price':
        filters.priceLevel = priceLevel;
        break;
      case 'cuisine':
        filters.cuisineType = cuisineType;
        break;
      case 'food':
        filters.foodSpecialty = foodSpecialty;
        break;
      case 'drink':
        filters.drinkSpecialty = drinkSpecialty;
        break;
    }

    onSearch(filters);
  };

  const handleReset = () => {
    setSearchType('price');
    setSelectedCountry('');
    setSelectedCity('');
    setCitySearch('');
    setPriceLevel('');
    setCuisineType('');
    setFoodSpecialty('');
    setDrinkSpecialty('');
    setResultCount(25);
    onReset();
  };

  const getSearchIcon = (type: SearchType) => {
    switch (type) {
      case 'price': return <DollarSign className="h-4 w-4" />;
      case 'cuisine': return <Utensils className="h-4 w-4" />;
      case 'food': return <Coffee className="h-4 w-4" />;
      case 'drink': return <Wine className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <img 
            src={restaurantGuideLogo}
            alt="Restaurant Guide Logo" 
            className="h-20 w-auto"
          />
        </div>
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/logo-black.png" 
            alt="Logo" 
            className="h-12 w-auto"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Find Your Perfect Experience</h1>
          <p className="text-muted-foreground">
            Choose your selection method and discover exactly what you're looking for
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Select By:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { type: 'price' as SearchType, label: 'Price Level' },
              { type: 'cuisine' as SearchType, label: 'Cuisine' },
              { type: 'food' as SearchType, label: 'Food Type' },
              { type: 'drink' as SearchType, label: 'Drink Type' }
            ].map(option => (
              <Button
                key={option.type}
                variant={searchType === option.type ? "default" : "outline"}
                onClick={() => handleSearchTypeChange(option.type)}
                className="h-auto p-3 flex flex-col items-center justify-center gap-1 text-center"
              >
                {getSearchIcon(option.type)}
                <span className="text-xs font-medium">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Location Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Country
            </label>
            <Select value={selectedCountry} onValueChange={handleCountrySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {allCountries.map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <div className="space-y-2">
              <Input
                placeholder="Type city name or select from list..."
                value={citySearch}
                onChange={(e) => handleCitySearch(e.target.value)}
                disabled={!selectedCountry}
              />
              
              {selectedCountry && cities.length > 0 && (
                <Select value={selectedCity} onValueChange={handleCitySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Or select from existing cities" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {citySearch && !cities.includes(citySearch) && selectedCountry && (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  Will add "{citySearch}" as a new city for {selectedCountry}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Criteria Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {searchType === 'price' && 'Price Level'}
            {searchType === 'cuisine' && 'Cuisine Type'}
            {searchType === 'food' && 'Food Specialty'}
            {searchType === 'drink' && 'Drink Specialty'}
          </label>

          {searchType === 'price' && (
            <div className="grid grid-cols-3 gap-2">
              {priceOptions.map(option => (
                <Button
                  key={option.value}
                  variant={priceLevel === option.value ? "default" : "outline"}
                  onClick={() => setPriceLevel(option.value)}
                  className="flex flex-col items-center gap-1 h-auto p-3"
                >
                  <span className="text-lg font-bold">{option.label}</span>
                  <span className="text-xs">{option.description}</span>
                </Button>
              ))}
            </div>
          )}

          {searchType === 'cuisine' && (
            <Select value={cuisineType} onValueChange={setCuisineType}>
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine type" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {cuisineOptions.map(cuisine => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {searchType === 'food' && (
            <Select value={foodSpecialty} onValueChange={setFoodSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select food type" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {foodOptions.map(food => (
                  <SelectItem key={food} value={food}>
                    {food}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {searchType === 'drink' && (
            <Select value={drinkSpecialty} onValueChange={setDrinkSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select drink type" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {drinkOptions.map(drink => (
                  <SelectItem key={drink} value={drink}>
                    {drink}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Result Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Results</label>
          <Select value={resultCount.toString()} onValueChange={(value) => setResultCount(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resultCountOptions.map(count => (
                <SelectItem key={count} value={count.toString()}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Filters Display */}
        {(selectedCountry || selectedCity || priceLevel || cuisineType || foodSpecialty || drinkSpecialty) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Filters:</label>
            <div className="flex flex-wrap gap-2">
              {selectedCountry && <Badge variant="secondary">Country: {selectedCountry}</Badge>}
              {selectedCity && <Badge variant="secondary">City: {selectedCity}</Badge>}
              {priceLevel && <Badge variant="secondary">Price: {priceLevel}</Badge>}
              {cuisineType && <Badge variant="secondary">Cuisine: {cuisineType}</Badge>}
              {foodSpecialty && <Badge variant="secondary">Food: {foodSpecialty}</Badge>}
              {drinkSpecialty && <Badge variant="secondary">Drink: {drinkSpecialty}</Badge>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!isComplete || isLoading || isAddingCity}
            className="flex-1"
            size="lg"
          >
            {isLoading || isAddingCity ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                SELECTING...
              </>
            ) : (
              'SELECT'
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="px-8"
          >
            RESET
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};