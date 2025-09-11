import { regionData } from '@/data/locationData';

/**
 * Utility functions for working with location data
 */

// Get all regions
export const getAllRegions = (): string[] => {
  return Object.keys(regionData);
};

// Get countries for a specific region
export const getCountriesForRegion = (region: string): Array<{ name: string; cities: string[] }> => {
  return regionData[region as keyof typeof regionData]?.countries || [];
};

// Get cities for a specific country
export const getCitiesForCountry = (region: string, country: string): string[] => {
  const countries = getCountriesForRegion(region);
  const countryData = countries.find(c => c.name === country);
  return countryData?.cities || [];
};

// Get all cities across all regions/countries
export const getAllCities = (): string[] => {
  const allCities: string[] = [];
  Object.values(regionData).forEach(region => {
    region.countries.forEach(country => {
      allCities.push(...country.cities);
    });
  });
  return [...new Set(allCities)]; // Remove duplicates
};

// Find region and country for a given city
export const findLocationForCity = (cityName: string): { region: string; country: string } | null => {
  for (const [regionName, region] of Object.entries(regionData)) {
    for (const country of region.countries) {
      if (country.cities.includes(cityName)) {
        return { region: regionName, country: country.name };
      }
    }
  }
  return null;
};

// Get statistics about location data
export const getLocationStats = () => {
  const regions = getAllRegions();
  let totalCountries = 0;
  let totalCities = 0;

  Object.values(regionData).forEach(region => {
    totalCountries += region.countries.length;
    region.countries.forEach(country => {
      totalCities += country.cities.length;
    });
  });

  return {
    regions: regions.length,
    countries: totalCountries,
    cities: totalCities,
    regionNames: regions
  };
};