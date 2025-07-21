import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, ExternalLink, Phone, Mail, Globe, Menu, Bookmark } from 'lucide-react';
import { MailingListSignup } from './MailingListSignup';

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
          {restaurants.map((restaurant, index) => {
            const items = [];
            
            // Add restaurant card
            items.push(
              <Card key={`restaurant-${index}`} className="group hover:shadow-lg transition-all duration-300 rounded-none">
                <div className="aspect-video relative overflow-hidden rounded-t-none">
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
                      <h3 className="font-semibold text-lg line-clamp-1 uppercase">{restaurant.name}</h3>
                       <div className="flex items-center gap-2 mt-1">
                         <div className="flex items-center gap-1">
                           <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                           <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                         </div>
                         <span className="text-xs text-muted-foreground">
                           ({restaurant.reviewCount} reviews)
                         </span>
                         {selectedCountry === 'United States' && (
                           <div className="bg-black rounded-sm px-2 py-1 flex items-center gap-1 ml-auto">
                             <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                               <path d="M17.625 6.625h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zM6.375 6.625h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5z"/>
                             </svg>
                             <span className="text-white text-xs font-semibold">UBER</span>
                           </div>
                         )}
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
                        className="flex items-center gap-1 text-xs rounded-none"
                        onClick={() => window.open(restaurant.googleMapRef, '_blank')}
                      >
                        <MapPin className="h-3 w-3" />
                        View on Maps
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-1 text-xs col-span-2 rounded-none bg-primary hover:bg-primary/90"
                        onClick={() => {
                          // Add save functionality here
                          console.log('Saved restaurant:', restaurant.name);
                          // You can implement actual save logic here
                        }}
                      >
                        <Bookmark className="h-3 w-3" />
                        SAVE
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
            );

            // Add mailing list signup after the 2nd restaurant (index 1)
            if (index === 1) {
              items.push(
                <div key="mailing-list" className="md:col-span-2 lg:col-span-1">
                  <MailingListSignup location={`${selectedCity}, ${selectedCountry}`} />
                </div>
              );
            }

            return items;
          }).flat()}
        </div>
      </CardContent>
    </Card>
  );
};