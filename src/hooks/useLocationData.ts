import { useState, useMemo } from 'react';
import { regionData } from '@/data/locationData';

/**
 * Hook for managing location selection state
 */
export const useLocationData = (initialRegion = '', initialCountry = '', initialCity = '') => {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCity, setSelectedCity] = useState(initialCity);

  // Get available options based on current selection
  const regions = useMemo(() => Object.keys(regionData), []);
  
  const countries = useMemo(() => {
    if (!selectedRegion) return [];
    return regionData[selectedRegion as keyof typeof regionData]?.countries || [];
  }, [selectedRegion]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    const country = countries.find(c => c.name === selectedCountry);
    return country?.cities || [];
  }, [selectedCountry, countries]);

  // Reset handlers that cascade down
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCountry('');
    setSelectedCity('');
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity('');
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  // Reset all selections
  const resetSelection = () => {
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedCity('');
  };

  return {
    // Current selection
    selectedRegion,
    selectedCountry,
    selectedCity,
    
    // Available options
    regions,
    countries,
    cities,
    
    // Change handlers
    handleRegionChange,
    handleCountryChange,
    handleCityChange,
    
    // Utilities
    resetSelection,
    
    // Validation
    isValidSelection: selectedRegion && selectedCountry && selectedCity,
    hasRegion: !!selectedRegion,
    hasCountry: !!selectedCountry,
    hasCity: !!selectedCity
  };
};