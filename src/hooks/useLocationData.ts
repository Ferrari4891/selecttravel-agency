import { useState, useMemo, useEffect } from 'react';
import { regionData } from '@/data/locationData';
import { useCustomCities } from './useCustomCities';

/**
 * Hook for managing location selection state
 */
export const useLocationData = (initialRegion = '', initialCountry = '', initialCity = '') => {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [customCities, setCustomCities] = useState<string[]>([]);
  const { getCustomCities } = useCustomCities();

  // Sync internal state when initial props change (controlled usage)
  useEffect(() => {
    if (initialRegion !== undefined) setSelectedRegion(initialRegion);
  }, [initialRegion]);

  useEffect(() => {
    if (initialCountry !== undefined) setSelectedCountry(initialCountry);
  }, [initialCountry]);

  useEffect(() => {
    if (initialCity !== undefined) setSelectedCity(initialCity);
  }, [initialCity]);

  // Get available options based on current selection
  const regions = useMemo(() => Object.keys(regionData), []);
  
  const countries = useMemo(() => {
    if (!selectedRegion) return [];
    return regionData[selectedRegion as keyof typeof regionData]?.countries || [];
  }, [selectedRegion]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    
    // Find the country across all regions since we might not have selectedRegion
    let country = null;
    if (selectedRegion) {
      // If we have a region, look in that region
      const regionCountries = regionData[selectedRegion as keyof typeof regionData]?.countries || [];
      country = regionCountries.find(c => c.name === selectedCountry);
    } else {
      // If no region, search across all regions
      for (const region of Object.values(regionData)) {
        country = region.countries.find(c => c.name === selectedCountry);
        if (country) break;
      }
    }
    
    const baseCities = country?.cities || [];
    // Combine base cities with approved custom cities
    return [...baseCities, ...customCities].sort();
  }, [selectedCountry, selectedRegion, customCities]);

  // Fetch custom cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      getCustomCities(selectedCountry).then(setCustomCities);
    } else {
      setCustomCities([]);
    }
  }, [selectedCountry, getCustomCities]);

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