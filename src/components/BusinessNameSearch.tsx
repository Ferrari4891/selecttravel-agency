import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { EnhancedCityInput } from '@/components/EnhancedCityInput';
import { getAllRegions, getCountriesForRegion, getCitiesForCountry } from '@/utils/locationUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceTouchToggle } from '@/components/VoiceTouchToggle';
import { useVoiceInterface } from '@/hooks/useVoiceInterface';

interface BusinessNameSearchProps {
  onSearch: (params: { businessName: string; city?: string; country?: string }) => void;
  isLoading: boolean;
}

export const BusinessNameSearch: React.FC<BusinessNameSearchProps> = ({ onSearch, isLoading }) => {
  const [businessName, setBusinessName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [interfaceMode, setInterfaceMode] = useState<'voice' | 'touch'>('touch');
  const { isListening, speak, startListening, stopListening, stopSpeaking, processVoiceCommand } = useVoiceInterface();

  const regions = getAllRegions();
  const countries = selectedRegion ? getCountriesForRegion(selectedRegion) : [];
  const cities = selectedRegion && selectedCountry ? getCitiesForCountry(selectedRegion, selectedCountry) : [];

  const handleSearch = () => {
    if (!businessName.trim()) {
      return;
    }

    onSearch({
      businessName: businessName.trim(),
      city: selectedCity || undefined,
      country: selectedCountry || undefined,
    });
  };

  const handleReset = () => {
    setBusinessName('');
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedCity('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleModeChange = (mode: 'voice' | 'touch') => {
    setInterfaceMode(mode);
    if (mode === 'voice') {
      speak("Voice mode activated for business name search. Try saying 'Find Starbucks in New York'");
    } else {
      speak("Touch mode activated for business name search.");
    }
  };

  const handleVoiceSearch = () => {
    if (interfaceMode === 'voice') {
      speak("Listening for business name...");
      startListening((command) => {
        processVoiceCommand(
          command,
          () => {}, // Not used for name search
          (params) => onSearch(params)
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
    <div className="w-full space-y-4 p-6 bg-card/95 backdrop-blur-sm border border-border">
      <div className="text-center mb-4 space-y-3">
        <h2 className="text-2xl font-bold text-green-600">SEARCH BY NAME</h2>
        <p className="text-muted-foreground text-sm">
          Search for a specific business by name
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
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Business Name</label>
          <Input
            type="text"
            placeholder="Enter business name..."
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-background"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Region (Optional)</label>
            <Select
              value={selectedRegion}
              onValueChange={(value) => {
                setSelectedRegion(value);
                setSelectedCountry('');
                setSelectedCity('');
              }}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Country (Optional)</label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => {
                setSelectedCountry(value);
                setSelectedCity('');
              }}
              disabled={!selectedRegion}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {countries.map((country) => (
                  <SelectItem key={country.name} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">City (Optional)</label>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={!selectedCountry}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleSearch}
            disabled={isLoading || !businessName.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
