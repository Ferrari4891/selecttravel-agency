import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MapPin, Star, ExternalLink, Phone, Mail, Globe, Menu, Ticket } from 'lucide-react';
import { MailingListSignup } from './MailingListSignup';
import SaveBusinessButton from './SaveBusinessButton';
import { useIsMobile } from '@/hooks/use-mobile';

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
  selectedCategory?: string;
}

export const RestaurantResults: React.FC<RestaurantResultsProps> = ({
  restaurants,
  selectedCity,
  selectedCountry,
  selectedCategory,
}) => {
  const isMobile = useIsMobile();

  // Placeholder image for restaurants
  const placeholderImage = '/lovable-uploads/84845629-2fe8-43b5-8500-84324fdcb0ec.png';

  if (isMobile) {
    // Mobile layout - stacked vertical design
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <h2 className="text-xl font-bold">Top {selectedCategory} in {selectedCity}, {selectedCountry}</h2>
          <p className="text-muted-foreground">{restaurants.length} businesses found with 3+ star ratings</p>
        </div>
        
        {restaurants.map((restaurant, index) => (
          <Card key={`mobile-restaurant-${index}`} className="rounded-none shadow-lg">
            {/* Restaurant Image */}
            <div className="aspect-video relative overflow-hidden">
              <img
                src={restaurant.imageLinks[0] || placeholderImage}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              {/* Business Name Overlay */}
              <div className="absolute top-3 left-3 right-3">
                <h3 className="font-bold text-lg uppercase text-white bg-black/80 px-3 py-2 rounded-none">
                  {restaurant.name}
                </h3>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-white/90 text-black rounded-none">
                  {restaurant.source}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-4">
              {/* Restaurant Rating */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({restaurant.reviewCount} reviews)
                  </span>
                  {selectedCountry === 'United States' && (
                    <div className="bg-black rounded-none px-2 py-1 flex items-center gap-1 ml-auto">
                      <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.625 6.625h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zM6.375 6.625h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5z"/>
                      </svg>
                      <span className="text-white text-xs font-semibold">UBER</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Placeholder Text */}
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Authentic cuisine served in a welcoming atmosphere with excellent service.</p>
                <p>Fresh ingredients and traditional recipes make this a local favorite.</p>
                <p>Perfect for casual dining, family gatherings, and special occasions.</p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{restaurant.address}</p>
              </div>

              {/* Contact Options - Stacked vertically */}
              <div className="space-y-2">
                {restaurant.contactDetails.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                    onClick={() => window.open(`tel:${restaurant.contactDetails.phone}`)}
                  >
                    <Phone className="h-4 w-4" />
                    Call: {restaurant.contactDetails.phone}
                  </Button>
                )}
                
                {restaurant.contactDetails.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                    onClick={() => window.open(restaurant.contactDetails.website, '_blank')}
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                  </Button>
                )}
                
                {restaurant.contactDetails.menuLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                    onClick={() => window.open(restaurant.contactDetails.menuLink, '_blank')}
                  >
                    <Menu className="h-4 w-4" />
                    See Menu
                  </Button>
                )}
                
                 <Button
                   variant="outline"
                   size="sm"
                   className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                   onClick={() => window.open(restaurant.googleMapRef, '_blank')}
                 >
                   <MapPin className="h-8 w-8" />
                   View on Maps
                 </Button>

              {restaurant.contactDetails.email && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                  onClick={() => window.open(`mailto:${restaurant.contactDetails.email}`)}
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
              >
                <Ticket className="h-4 w-4" />
                Voucher
              </Button>
              </div>

              {/* Social Media Links */}
              {(restaurant.socialMediaLinks.facebook || 
                restaurant.socialMediaLinks.instagram || 
                restaurant.socialMediaLinks.twitter) && (
                <div className="space-y-2 pt-2 border-t border-black">
                  <p className="text-sm font-medium">Follow Us:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-black"
                    >
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-black"
                    >
                      Instagram
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-black"
                    >
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-black"
                    >
                      TikTok
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-black"
                    >
                      YouTube
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-black"
                    >
                      LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-black"
                    >
                      Snapchat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-black"
                    >
                      Pinterest
                    </Button>
                  </div>
                </div>
              )}

              {/* Save Button at Bottom */}
              <div className="pt-2">
                <SaveBusinessButton
                  restaurant={restaurant}
                  selectedCity={selectedCity}
                  selectedCountry={selectedCountry}
                  selectedCategory={selectedCategory}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Mailing List Signup after 2nd restaurant */}
        {restaurants.length > 1 && (
          <div className="pt-4">
            <MailingListSignup location={`${selectedCity}, ${selectedCountry}`} category={selectedCategory} />
          </div>
        )}
      </div>
    );
  }

  // Desktop layout - now matches mobile design
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h2 className="text-xl font-bold">Top {selectedCategory} in {selectedCity}, {selectedCountry}</h2>
        <p className="text-muted-foreground">{restaurants.length} businesses found with 3+ star ratings</p>
      </div>
      
      {restaurants.map((restaurant, index) => (
        <Card key={`desktop-restaurant-${index}`} className="rounded-none shadow-lg">
          {/* Restaurant Image */}
          <div className="aspect-video relative overflow-hidden">
            <img
              src={restaurant.imageLinks[0] || placeholderImage}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            {/* Business Name Overlay */}
            <div className="absolute top-3 left-3 right-3">
              <h3 className="font-bold text-lg uppercase text-white bg-black/80 px-3 py-2 rounded-none">
                {restaurant.name}
              </h3>
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-black rounded-none">
                {restaurant.source}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4 space-y-4">
            {/* Restaurant Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({restaurant.reviewCount} reviews)
                </span>
                {selectedCountry === 'United States' && (
                  <div className="bg-black rounded-none px-2 py-1 flex items-center gap-1 ml-auto">
                    <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.625 6.625h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zm0 2.5h-6.25v1.5h6.25v-1.5zM6.375 6.625h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5zm0 2.5h1.5v1.5h-1.5v-1.5z"/>
                    </svg>
                    <span className="text-white text-xs font-semibold">UBER</span>
                  </div>
                )}
              </div>
            </div>

            {/* Placeholder Text */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Authentic cuisine served in a welcoming atmosphere with excellent service.</p>
              <p>Fresh ingredients and traditional recipes make this a local favorite.</p>
              <p>Perfect for casual dining, family gatherings, and special occasions.</p>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{restaurant.address}</p>
            </div>

            {/* Contact Options - Stacked vertically */}
            <div className="space-y-2">
              {restaurant.contactDetails.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                  onClick={() => window.open(`tel:${restaurant.contactDetails.phone}`)}
                >
                  <Phone className="h-4 w-4" />
                  Call: {restaurant.contactDetails.phone}
                </Button>
              )}
              
              {restaurant.contactDetails.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                  onClick={() => window.open(restaurant.contactDetails.website, '_blank')}
                >
                  <Globe className="h-4 w-4" />
                  Visit Website
                </Button>
              )}
              
              {restaurant.contactDetails.menuLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                  onClick={() => window.open(restaurant.contactDetails.menuLink, '_blank')}
                >
                  <Menu className="h-4 w-4" />
                  See Menu
                </Button>
              )}
              
               <Button
                 variant="outline"
                 size="sm"
                 className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                 onClick={() => window.open(restaurant.googleMapRef, '_blank')}
               >
                 <MapPin className="h-8 w-8" />
                 View on Maps
               </Button>

            {restaurant.contactDetails.email && (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
                onClick={() => window.open(`mailto:${restaurant.contactDetails.email}`)}
              >
                <Mail className="h-4 w-4" />
                Send Email
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-sm rounded-none border-black"
            >
              <Ticket className="h-4 w-4" />
              Voucher
            </Button>
            </div>

            {/* Social Media Links */}
            {(restaurant.socialMediaLinks.facebook || 
              restaurant.socialMediaLinks.instagram || 
              restaurant.socialMediaLinks.twitter) && (
              <div className="space-y-2 pt-2 border-t border-black">
                <p className="text-sm font-medium">Follow Us:</p>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-black"
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-black"
                  >
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-black"
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-black"
                  >
                    TikTok
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-black"
                  >
                    YouTube
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-black"
                  >
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-black"
                  >
                    Snapchat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-black"
                  >
                    Pinterest
                  </Button>
                </div>
              </div>
            )}

            {/* Save Button at Bottom */}
            <div className="pt-2">
              <SaveBusinessButton
                restaurant={restaurant}
                selectedCity={selectedCity}
                selectedCountry={selectedCountry}
                selectedCategory={selectedCategory}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Mailing List Signup after 2nd restaurant */}
      {restaurants.length > 1 && (
        <div className="pt-4">
          <MailingListSignup location={`${selectedCity}, ${selectedCountry}`} category={selectedCategory} />
        </div>
      )}
    </div>
  );
};