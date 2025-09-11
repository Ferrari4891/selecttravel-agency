# Location Data Management

This guide explains how to manage countries and cities in the application.

## Overview

The application uses a unified location data system that both users and businesses share. All location data is centralized in `src/data/locationData.ts`.

## File Structure

```
src/
├── data/
│   └── locationData.ts          # Main location data source
├── components/
│   └── shared/
│       └── LocationSelector.tsx # Unified location selector component
├── utils/
│   └── locationUtils.ts         # Helper functions for location data
└── hooks/
    └── useLocationData.ts       # Hook for location state management
```

## Adding New Countries and Cities

### 1. Add to Existing Region

To add a new country or cities to an existing region, edit `src/data/locationData.ts`:

```typescript
export const regionData = {
  "North America": {
    countries: [
      {
        name: "United States",
        cities: ["New York", "Los Angeles", "Chicago"] // Add new cities here
      },
      {
        name: "NewCountryName", // Add new country here
        cities: ["City1", "City2", "City3"]
      }
    ]
  }
}
```

### 2. Add New Region

To add a completely new region:

```typescript
export const regionData = {
  // ... existing regions
  "New Region Name": {
    countries: [
      {
        name: "Country1",
        cities: ["City1", "City2"]
      },
      {
        name: "Country2", 
        cities: ["City3", "City4"]
      }
    ]
  }
}
```

### 3. Important Notes

- **Cities must be sorted alphabetically** within each country for better UX
- **Country names must be unique** across all regions
- **City names should be unique** within each country
- **Use proper capitalization** for all names

## Components Using Location Data

### User-Facing Components
- `RestaurantDiscoveryForm.tsx` - Restaurant search by location
- `MobileRestaurantForm.tsx` - Mobile version of restaurant search
- `EnhancedCityInput.tsx` - City search with autocomplete

### Business Components
- `BusinessProfile.tsx` - Business location setup
- `LocationSelector.tsx` - Shared location selector component

## Utility Functions

The `locationUtils.ts` file provides helper functions:

```typescript
import { getAllRegions, getCitiesForCountry, findLocationForCity } from '@/utils/locationUtils';

// Get all available regions
const regions = getAllRegions();

// Get cities for a specific country
const cities = getCitiesForCountry("North America", "United States");

// Find which region/country a city belongs to
const location = findLocationForCity("New York");
```

## State Management Hook

Use the `useLocationData` hook for managing location selection:

```typescript
import { useLocationData } from '@/hooks/useLocationData';

function MyComponent() {
  const {
    selectedRegion,
    selectedCountry, 
    selectedCity,
    regions,
    countries,
    cities,
    handleRegionChange,
    handleCountryChange,
    handleCityChange,
    isValidSelection
  } = useLocationData();

  return (
    <LocationSelector
      selectedRegion={selectedRegion}
      selectedCountry={selectedCountry}
      selectedCity={selectedCity}
      onRegionChange={handleRegionChange}
      onCountryChange={handleCountryChange}
      onCityChange={handleCityChange}
    />
  );
}
```

## Testing Changes

After adding new locations:

1. **Check the restaurant discovery form** - Navigate to the home page and verify new locations appear
2. **Check business registration** - Go to business profile setup and verify locations work
3. **Test city search** - Use the city search functionality to find new cities
4. **Verify cascading** - Ensure selecting a region shows correct countries, and selecting a country shows correct cities

## Data Validation

The system automatically validates:
- Region selection enables country dropdown
- Country selection enables city dropdown  
- Invalid selections are reset appropriately
- All changes cascade down correctly

## Performance Considerations

- Location data is loaded once and cached
- City lists are memoized to prevent unnecessary re-renders
- Large city lists are efficiently filtered and displayed

## Future Enhancements

Consider these improvements:
- API integration for dynamic location data
- Geolocation-based suggestions
- Fuzzy search for city names
- Recent selections memory
- Internationalization support
