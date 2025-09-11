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
    cuisine: string;
    resultCount: number;
  }) => void;
  onReset: () => void;
  isLoading: boolean;
}

interface CountryCuisineData {
  [key: string]: string[];
}

const countryCuisineData: CountryCuisineData = {
  'France': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'Spain': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'United States': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'China': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'Italy': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'Turkey': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'Mexico': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'Thailand': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'Germany': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'],
  'United Kingdom': ['African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food']
};

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
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [resultCount, setResultCount] = useState<number>(5);

  const allCountries = getAllCountries();

  const availableCuisines = useMemo(() => {
    return selectedCountry ? countryCuisineData[selectedCountry] || [] : [];
  }, [selectedCountry]);

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
    setSelectedCuisine('');
    setSelectedCity('');
    setCitySearchInput('');
  };

  const handleCuisineSelect = (cuisine: string) => {
    setSelectedCuisine(cuisine);
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
    
    if (selectedCountry && selectedCuisine && cityToUse && resultCount > 0) {
      onSearch({
        country: selectedCountry,
        city: cityToUse,
        cuisine: selectedCuisine,
        resultCount
      });
    }
  };

  const handleReset = () => {
    setSelectedCountry('');
    setSelectedCuisine('');
    setSelectedCity('');
    setCitySearchInput('');
    setResultCount(5);
    onReset();
  };

  const isComplete = selectedCountry && selectedCuisine && (selectedCity || citySearchInput.trim()) && resultCount > 0;

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
        {(selectedCountry || selectedCuisine || selectedCity || citySearchInput.trim()) && (
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedCountry && (
              <Badge variant="secondary" className="bg-muted text-foreground text-xs px-2 py-1 rounded-none">
                {selectedCountry}
              </Badge>
            )}
            {selectedCuisine && (
              <Badge variant="secondary" className="bg-muted text-foreground text-xs px-2 py-1 rounded-none">
                {selectedCuisine}
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

        {/* Cuisine Selection */}
        <div className="space-y-2">
          <label className="text-lg font-bold text-foreground">Select Cuisine</label>
          <Select onValueChange={handleCuisineSelect} value={selectedCuisine} disabled={!selectedCountry}>
            <SelectTrigger className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none">
              <SelectValue placeholder="Choose cuisine type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-border rounded-none max-h-60 overflow-y-auto z-[100]">
              {availableCuisines.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine} className="text-base py-3 rounded-none hover:bg-muted">
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Number of Results */}
        <div className="space-y-2">
          <label className="text-lg font-bold text-foreground">Number of Results</label>
          <Select onValueChange={(value) => setResultCount(parseInt(value))} value={resultCount.toString()}>
            <SelectTrigger className="w-full h-12 text-base font-bold bg-background text-foreground border-2 border-border rounded-none">
              <SelectValue placeholder="Choose number of results" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-border rounded-none max-h-40 overflow-y-auto z-[300]">
              {[1, 5, 10].map((count) => (
                <SelectItem key={count} value={count.toString()} className="text-base py-3 rounded-none hover:bg-muted">
                  {count} result{count > 1 ? 's' : ''}
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