import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CountryCuisineData {
  [key: string]: string[];
}

const countryCuisineData: CountryCuisineData = {
  'France': ['French', 'Pastries', 'Seafood', 'Cheese', 'Wine', 'Provençal', 'Crêpes', 'Baguettes', 'Escargot', 'Duck Confit'],
  'Spain': ['Tapas', 'Paella', 'Churros', 'Iberico Ham', 'Gazpacho', 'Tortilla Española', 'Seafood', 'Sangria', 'Patatas Bravas', 'Croquetas'],
  'United States': ['Burgers', 'BBQ', 'Fried Chicken', 'Pizza', 'Tex-Mex', 'Clam Chowder', 'Hot Dogs', 'Cajun', 'Lobster Rolls', 'Apple Pie'],
  'China': ['Dim Sum', 'Peking Duck', 'Hot Pot', 'Noodles', 'Dumplings', 'Sweet and Sour Pork', 'Mapo Tofu', 'Fried Rice', 'Sichuan Cuisine', 'Cantonese Cuisine'],
  'Italy': ['Pizza', 'Pasta', 'Gelato', 'Risotto', 'Tiramisu', 'Lasagna', 'Prosciutto', 'Bruschetta', 'Cannoli', 'Gnocchi'],
  'Turkey': ['Kebab', 'Baklava', 'Meze', 'Turkish Tea', 'Pide', 'Döner', 'Lahmacun', 'Manti', 'Menemen', 'Turkish Coffee'],
  'Mexico': ['Tacos', 'Enchiladas', 'Guacamole', 'Tamales', 'Mole', 'Quesadillas', 'Churros', 'Pozole', 'Sopes', 'Ceviche'],
  'Thailand': ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice', 'Massaman Curry', 'Som Tum', 'Red Curry', 'Satay', 'Khao Pad', 'Larb'],
  'Germany': ['Bratwurst', 'Pretzels', 'Schnitzel', 'Sauerkraut', 'Currywurst', 'Black Forest Cake', 'Spaetzle', 'Potato Salad', 'Beer', 'Roast Pork'],
  'United Kingdom': ['Fish and Chips', 'Roast Beef', 'Shepherd\'s Pie', 'Full English Breakfast', 'Bangers and Mash', 'Afternoon Tea', 'Cornish Pasty', 'Scones', 'Yorkshire Pudding', 'Sticky Toffee Pudding'],
  'Vietnam': ['Pho', 'Banh Mi', 'Spring Rolls', 'Vietnamese Coffee', 'Bun Bo Hue', 'Cao Lau', 'Banh Xeo', 'Vermicelli Bowls', 'Fish Sauce', 'Che'],
  'Malaysia': ['Nasi Lemak', 'Rendang', 'Laksa', 'Satay', 'Char Kway Teow', 'Hainanese Chicken Rice', 'Roti Canai', 'Assam Fish', 'Cendol', 'Durian'],
  'Indonesia': ['Nasi Goreng', 'Rendang', 'Satay', 'Gado-Gado', 'Soto', 'Tempeh', 'Nasi Padang', 'Martabak', 'Gudeg', 'Sambal']
};

const countries = [
  'France',
  'Spain', 
  'United States',
  'China',
  'Italy',
  'Turkey',
  'Mexico',
  'Thailand',
  'Germany',
  'United Kingdom',
  'Vietnam',
  'Malaysia',
  'Indonesia'
];

export const CuisineForm: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');

  const availableCuisines = selectedCountry ? countryCuisineData[selectedCountry] || [] : [];

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCuisine(''); // Reset cuisine when country changes
  };

  const handleSubmit = () => {
    if (selectedCountry && selectedCuisine) {
      console.log('Selected:', { country: selectedCountry, cuisine: selectedCuisine });
      // Add your form submission logic here
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background/95 backdrop-blur-sm border-border/50">
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Discover Cuisine by Country
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a country to explore its popular cuisines
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium">
              Country
            </Label>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Please select a country" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg max-h-[200px] overflow-y-auto">
                {countries.map((country) => (
                  <SelectItem 
                    key={country} 
                    value={country}
                    className="cursor-pointer hover:bg-accent"
                  >
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine" className="text-sm font-medium">
              Cuisine
            </Label>
            <Select 
              value={selectedCuisine} 
              onValueChange={setSelectedCuisine}
              disabled={!selectedCountry}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Please select a cuisine" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg max-h-[200px] overflow-y-auto">
                {availableCuisines.map((cuisine) => (
                  <SelectItem 
                    key={cuisine} 
                    value={cuisine}
                    className="cursor-pointer hover:bg-accent"
                  >
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!selectedCountry || !selectedCuisine}
            className="w-full"
            variant="default"
          >
            Explore Cuisine
          </Button>
        </div>

        {selectedCountry && selectedCuisine && (
          <div className="mt-4 p-3 bg-accent/50 rounded-lg">
            <p className="text-sm text-foreground">
              <span className="font-medium">Selected:</span>{' '}
              {selectedCuisine} cuisine from {selectedCountry}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};