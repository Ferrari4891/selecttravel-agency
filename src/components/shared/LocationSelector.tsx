import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { regionData } from '@/data/locationData';
import { getFlagEmoji } from '@/data/flagIcons';

interface LocationSelectorProps {
  selectedRegion?: string;
  selectedCountry?: string;
  selectedCity?: string;
  onRegionChange?: (region: string) => void;
  onCountryChange?: (country: string) => void;
  onCityChange?: (city: string) => void;
  showCustomCity?: boolean;
  customCity?: string;
  onCustomCityChange?: (city: string) => void;
  onToggleCustomCity?: () => void;
  disabled?: boolean;
  labels?: {
    region?: string;
    country?: string;
    city?: string;
    customCity?: string;
  };
  placeholders?: {
    region?: string;
    country?: string;
    city?: string;
    customCity?: string;
  };
  required?: {
    region?: boolean;
    country?: boolean;
    city?: boolean;
  };
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedRegion,
  selectedCountry,
  selectedCity,
  onRegionChange,
  onCountryChange,
  onCityChange,
  showCustomCity = false,
  customCity,
  onCustomCityChange,
  onToggleCustomCity,
  disabled = false,
  labels = {},
  placeholders = {},
  required = {}
}) => {
  const regions = Object.keys(regionData);
  const countries = selectedRegion ? regionData[selectedRegion as keyof typeof regionData]?.countries || [] : [];
  const cities = selectedCountry ? countries.find(c => c.name === selectedCountry)?.cities || [] : [];

  const defaultLabels = {
    region: 'Region',
    country: 'Country',
    city: 'City',
    customCity: 'Custom City',
    ...labels
  };

  const defaultPlaceholders = {
    region: 'Select region',
    country: 'Select country',
    city: 'Select city',
    customCity: 'Enter city name',
    ...placeholders
  };

  return (
    <>
      {/* Region Selector */}
      {onRegionChange && (
        <FormItem>
          <FormLabel>{defaultLabels.region} {required.region && '*'}</FormLabel>
          <Select 
            value={selectedRegion} 
            onValueChange={onRegionChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={defaultPlaceholders.region} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}

      {/* Country Selector */}
      {onCountryChange && (
        <FormItem>
          <FormLabel>{defaultLabels.country} {required.country && '*'}</FormLabel>
          <Select 
            value={selectedCountry} 
            onValueChange={onCountryChange}
            disabled={disabled || !selectedRegion}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={selectedRegion ? defaultPlaceholders.country : "Select region first"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.name} value={country.name}>
                  <div className="flex items-center gap-2">
                    <span>{getFlagEmoji(country.name)}</span>
                    <span>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}

      {/* City Selector */}
      {onCityChange && (
        <FormItem>
          <FormLabel>{defaultLabels.city} {required.city && '*'}</FormLabel>
          <Select 
            value={selectedCity} 
            onValueChange={onCityChange}
            disabled={disabled || !selectedCountry}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={selectedCountry ? defaultPlaceholders.city : "Select country first"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}

      {/* Custom City Option */}
      {onToggleCustomCity && onCustomCityChange && (
        <>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleCustomCity}
              disabled={disabled}
            >
              {showCustomCity ? "Select from list" : "City not listed?"}
            </Button>
          </div>

          {showCustomCity && (
            <FormItem>
              <FormLabel>{defaultLabels.customCity}</FormLabel>
              <FormControl>
                <Input
                  value={customCity || ''}
                  onChange={(e) => onCustomCityChange(e.target.value)}
                  placeholder={defaultPlaceholders.customCity}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </>
      )}
    </>
  );
};