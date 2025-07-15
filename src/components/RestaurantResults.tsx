import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, ExternalLink, Phone, Mail, Globe, Menu } from 'lucide-react';

interface Restaurant {
  name: string;
  address: string;
  googleMapRef: string;
  socialMediaLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  contactDetails: {
    phone?: string;
    email?: string;
    website?: string;
    menuLink?: string;
  };
  imageLinks: string[];
  rating: number;
  reviewCount: number;
  source: string;
}

interface RestaurantResultsProps {
  restaurants: Restaurant[];
  selectedCity: string;
  selectedCountry: string;
}

export const RestaurantResults: React.FC<RestaurantResultsProps> = ({
  restaurants,
  selectedCity,
  selectedCountry,
}) => {
  return (
    <Card className="shadow-elegant rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Top Restaurants in {selectedCity}, {selectedCountry}
        </CardTitle>
        <CardDescription>
          {restaurants.length} restaurants found from TripAdvisor, Yelp, and Google Reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 rounded-none">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={restaurant.imageLinks[0]}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {restaurant.source}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({restaurant.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {restaurant.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {restaurant.contactDetails.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs rounded-none"
                        onClick={() => window.open(`tel:${restaurant.contactDetails.phone}`)}
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                    )}
                    
                    {restaurant.contactDetails.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs rounded-none"
                        onClick={() => window.open(restaurant.contactDetails.website, '_blank')}
                      >
                        <Globe className="h-3 w-3" />
                        Website
                      </Button>
                    )}
                    
                    {restaurant.contactDetails.menuLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs rounded-none"
                        onClick={() => window.open(restaurant.contactDetails.menuLink, '_blank')}
                      >
                        <Menu className="h-3 w-3" />
                        Menu
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs col-span-2 rounded-none"
                      onClick={() => window.open(restaurant.googleMapRef, '_blank')}
                    >
                      <MapPin className="h-3 w-3" />
                      View on Maps
                    </Button>
                  </div>

                  {(restaurant.socialMediaLinks.facebook || 
                    restaurant.socialMediaLinks.instagram || 
                    restaurant.socialMediaLinks.twitter) && (
                    <div className="flex gap-2 pt-2 border-t">
                      {restaurant.socialMediaLinks.facebook && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 rounded-none"
                          onClick={() => window.open(restaurant.socialMediaLinks.facebook, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      {restaurant.socialMediaLinks.instagram && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 rounded-none"
                          onClick={() => window.open(restaurant.socialMediaLinks.instagram, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      {restaurant.contactDetails.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 rounded-none"
                          onClick={() => window.open(`mailto:${restaurant.contactDetails.email}`)}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};