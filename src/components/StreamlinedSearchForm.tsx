import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLocationData } from '@/hooks/useLocationData';
import { useCustomCities } from '@/hooks/useCustomCities';
import { regionData } from '@/data/locationData';
import { Loader2, MapPin, DollarSign, Utensils, Wine, Coffee, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import restaurantGuideLogo from '@/assets/restaurant-guide-logo.png';
import { VoiceTouchToggle } from '@/components/VoiceTouchToggle';
import { useVoiceInterface } from '@/hooks/useVoiceInterface';

type SearchType = 'price' | 'cuisine' | 'food' | 'drink';

interface SearchFilters {
  searchType: SearchType;
  country: string;
  city: string;
  priceLevel?: string;
  cuisineType?: string;
  foodSpecialty?: string;
  drinkSpecialty?: string;
  resultCount: number | 'All';
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

const resultCountOptions = [1, 5, 10, 'All'];

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
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType>('price');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceLevel, setPriceLevel] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [foodSpecialty, setFoodSpecialty] = useState('');
  const [drinkSpecialty, setDrinkSpecialty] = useState('');
  const [resultCount, setResultCount] = useState<number | 'All'>(5);
  const [interfaceMode, setInterfaceMode] = useState<'voice' | 'touch'>('touch');
  const { isListening, speak, startListening, stopListening, stopSpeaking, processVoiceCommand } = useVoiceInterface();
  
  // City request dialog state
  const [showCityRequest, setShowCityRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({
    email: '',
    name: '',
    message: ''
  });
  const [businessSuggestions, setBusinessSuggestions] = useState<string[]>(['']);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

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
    setResultCount(5);
    onReset();
  };

  const addBusinessField = () => {
    setBusinessSuggestions([...businessSuggestions, '']);
  };

  const removeBusinessField = (index: number) => {
    if (businessSuggestions.length > 1) {
      setBusinessSuggestions(businessSuggestions.filter((_, i) => i !== index));
    }
  };

  const updateBusinessSuggestion = (index: number, value: string) => {
    const updated = [...businessSuggestions];
    updated[index] = value;
    setBusinessSuggestions(updated);
  };

  const handleCityRequest = async () => {
    if (!requestForm.email || !citySearch || !selectedCountry) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const validBusinessSuggestions = businessSuggestions.filter(business => business.trim());

    setIsSubmittingRequest(true);
    try {
      // Submit city request
      const { error: cityError } = await supabase
        .from('city_requests')
        .insert({
          city_name: citySearch,
          country: selectedCountry,
          requester_email: requestForm.email,
          requester_name: requestForm.name || null,
          request_message: requestForm.message || null
        });

      if (cityError) throw cityError;

      // Submit business suggestions if any
      if (validBusinessSuggestions.length > 0) {
        const businessSuggestionsText = `Business suggestions for ${citySearch}, ${selectedCountry}:\n${validBusinessSuggestions.map((business, index) => `${index + 1}. ${business}`).join('\n')}`;
        
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            author_name: requestForm.name || 'Anonymous',
            author_email: requestForm.email,
            message_text: businessSuggestionsText,
            message_type: 'business_suggestion'
          });

        if (messageError) throw messageError;
      }

      toast({
        title: "Request Submitted!",
        description: `Thank you! We'll notify you at ${requestForm.email} when ${citySearch} is added${validBusinessSuggestions.length > 0 ? ' with your suggested businesses' : ''}.`
      });

      setShowCityRequest(false);
      setRequestForm({ email: '', name: '', message: '' });
      setBusinessSuggestions(['']);
    } catch (error) {
      console.error('Error submitting city request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const getSearchIcon = (type: SearchType) => {
    switch (type) {
      case 'price': return <DollarSign className="h-4 w-4" />;
      case 'cuisine': return <Utensils className="h-4 w-4" />;
      case 'food': return <Coffee className="h-4 w-4" />;
      case 'drink': return <Wine className="h-4 w-4" />;
    }
  };

  const handleModeChange = (mode: 'voice' | 'touch') => {
    setInterfaceMode(mode);
    if (mode === 'voice') {
      speak("Voice mode activated for criteria search. Try saying 'Find Italian restaurants in Paris'");
    } else {
      speak("Touch mode activated for criteria search.");
    }
  };

  const handleVoiceSearch = () => {
    if (interfaceMode === 'voice') {
      speak("Listening for your search criteria...");
      startListening((command) => {
        processVoiceCommand(
          command,
          (params) => onSearch(params as SearchFilters),
          () => {} // Not used for criteria search
        );
      });
    }
  };

  const handleStopVoice = () => {
    stopListening();
    stopSpeaking();
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    } catch {}
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
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-green-600">GET WHAT YOU WANT!</h1>
          <p className="text-muted-foreground">
            Choose your selection method and discover exactly what you're looking for
          </p>
          
          {/* Voice/Touch Toggle */}
          <div className="flex justify-center pt-2">
            <VoiceTouchToggle 
              onModeChange={handleModeChange}
              className="scale-90"
            />
          </div>
          
          {/* Voice Controls */}
          {interfaceMode === 'voice' && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                <Button
                  onClick={handleVoiceSearch}
                  disabled={isListening || isLoading}
                  size="sm"
                  className="flex items-center gap-2 h-8 bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-pulse' : 'bg-white'}`}></div>
                  <span className="text-xs font-bold">{isListening ? 'Listening...' : 'Start'}</span>
                </Button>
                <Button
                  onClick={handleStopVoice}
                  disabled={!isListening}
                  size="sm"
                  className="flex items-center gap-2 h-8 bg-red-600 hover:bg-red-700 text-white font-bold disabled:bg-red-300"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-xs font-bold">Stop</span>
                </Button>
              </div>
              
              {isListening && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary font-medium">Listening...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Type Selection */}
        <div className="space-y-4 text-center">
          <label className="text-xl font-bold block">Select By:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                className={`h-auto p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[80px] ${
                  searchType === option.type ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                }`}
              >
                {getSearchIcon(option.type)}
                <span className="text-xs font-medium leading-tight text-center break-words">
                  {option.label.split(' ').length > 1 ? (
                    <>
                      {option.label.split(' ')[0]}<br />
                      {option.label.split(' ').slice(1).join(' ')}
                    </>
                  ) : (
                    option.label
                  )}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Location Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xl font-bold flex items-center gap-1">
              <MapPin className="h-5 w-5" />
              Country
            </label>
            <Select value={selectedCountry} onValueChange={handleCountrySelect}>
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {allCountries.map(country => (
                  <SelectItem key={country} value={country} className="text-base">
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xl font-bold">City</label>
            <div className="space-y-2">
              {selectedCountry && cities.length > 0 && (
                <Select value={selectedCity} onValueChange={handleCitySelect}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select from existing cities" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {cities.map(city => (
                      <SelectItem key={city} value={city} className="text-base">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <div className="text-center text-base font-medium text-gray-600">OR</div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Type city name..."
                  value={citySearch}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  disabled={!selectedCountry}
                  className="text-base"
                />
                
                {citySearch && !cities.includes(citySearch) && selectedCountry && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="font-medium text-amber-800">City not found</div>
                      <div className="text-amber-700">"{citySearch}" is not in our database yet.</div>
                    </div>
                    <Dialog open={showCityRequest} onOpenChange={setShowCityRequest}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-12 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          onClick={() => setShowCityRequest(true)}
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="font-medium">Request City</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Add "{citySearch.length > 15 ? `${citySearch.substring(0, 15)}...` : citySearch}" to database
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
                        <DialogHeader className="space-y-3 flex-shrink-0">
                          <DialogTitle className="text-xl font-semibold">Request New City</DialogTitle>
                          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-900">
                              {citySearch}, {selectedCountry}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Help us expand our network to this location
                            </p>
                          </div>
                        </DialogHeader>
                        
                        <div className="flex-1 overflow-y-auto space-y-6 pt-2 px-1">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            We'll add this city to our database and notify you via email when businesses become available in this location.
                          </p>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Email Address <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="Enter your email address"
                                type="email"
                                value={requestForm.email}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
                                className="h-10"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Your Name <span className="text-gray-400 text-xs">(optional)</span>
                              </label>
                              <Input
                                placeholder="Enter your name"
                                value={requestForm.name}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, name: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Business Suggestions <span className="text-gray-400 text-xs">(optional)</span>
                              </label>
                              <div className="space-y-2">
                                {businessSuggestions.map((business, index) => (
                                  <div key={index} className="flex gap-2">
                                    <Input
                                      placeholder={`Business name ${index + 1}`}
                                      value={business}
                                      onChange={(e) => updateBusinessSuggestion(index, e.target.value)}
                                      className="flex-1"
                                    />
                                    {businessSuggestions.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeBusinessField(index)}
                                        className="px-3"
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addBusinessField}
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Another Business
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Additional Comments <span className="text-gray-400 text-xs">(optional)</span>
                              </label>
                              <Textarea
                                placeholder="Tell us why this city would be valuable to add..."
                                value={requestForm.message}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                                rows={3}
                                className="resize-none"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 pt-4 border-t flex-shrink-0 bg-white">
                          <Button
                            onClick={handleCityRequest}
                            disabled={isSubmittingRequest || !requestForm.email.trim()}
                            className="w-full h-11"
                          >
                            {isSubmittingRequest ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting Request...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-2 h-4 w-4" />
                                Submit Request
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowCityRequest(false)}
                            disabled={isSubmittingRequest}
                            className="w-full h-11"
                          >
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Criteria Selection */}
        <div className="space-y-2">
          <label className="text-xl font-bold">
            {searchType === 'price' && 'Price Level'}
            {searchType === 'cuisine' && 'Cuisine Type'}
            {searchType === 'food' && 'Food Specialty'}
            {searchType === 'drink' && 'Drink Specialty'}
          </label>

          {searchType === 'price' && (
            <div className="flex flex-col gap-2">
              {priceOptions.map(option => (
                <Button
                  key={option.value}
                  variant={priceLevel === option.value ? "default" : "outline"}
                  onClick={() => setPriceLevel(option.value)}
                  className="flex flex-col items-center justify-center gap-1 h-auto p-3 w-full"
                >
                  <span className="text-lg font-bold">{option.label}</span>
                  <span className="text-xs text-center">{option.description}</span>
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
          <label className="text-xl font-bold">Number of Results</label>
          <Select value={resultCount.toString()} onValueChange={(value) => setResultCount(value === 'All' ? 'All' : parseInt(value))}>
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
            className={`flex-1 ${isComplete && !isLoading && !isAddingCity ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            size="lg"
          >
            {isLoading || isAddingCity ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                GETTING...
              </>
            ) : (
              'GET NOW!'
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