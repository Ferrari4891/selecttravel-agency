import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Mail, Clock, Star } from 'lucide-react';
import { GoogleMap } from '@/components/GoogleMap';
import { GiftCardPurchase } from './GiftCardPurchase';

interface BusinessCardProps {
  business: {
    id: string;
    business_name: string;
    business_type: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    website?: string;
    image_1_url?: string;
    image_2_url?: string;
    image_3_url?: string;
    business_hours?: any;
    wheelchair_access?: boolean;
    extended_hours?: boolean;
    gluten_free?: boolean;
    low_noise?: boolean;
    public_transport?: boolean;
    pet_friendly?: boolean;
    outdoor_seating?: boolean;
    senior_discounts?: boolean;
    online_booking?: boolean;
    air_conditioned?: boolean;
    gift_cards_enabled?: boolean;
    subscription_tier?: string;
  };
  showFullDetails?: boolean;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ 
  business, 
  showFullDetails = false 
}) => {
  const amenities = [
    { key: 'wheelchair_access', label: 'Wheelchair Access', value: business.wheelchair_access },
    { key: 'extended_hours', label: 'Extended Hours', value: business.extended_hours },
    { key: 'gluten_free', label: 'Gluten Free Options', value: business.gluten_free },
    { key: 'low_noise', label: 'Quiet Environment', value: business.low_noise },
    { key: 'public_transport', label: 'Public Transport', value: business.public_transport },
    { key: 'pet_friendly', label: 'Pet Friendly', value: business.pet_friendly },
    { key: 'outdoor_seating', label: 'Outdoor Seating', value: business.outdoor_seating },
    { key: 'senior_discounts', label: 'Senior Discounts', value: business.senior_discounts },
    { key: 'online_booking', label: 'Online Booking', value: business.online_booking },
    { key: 'air_conditioned', label: 'Air Conditioned', value: business.air_conditioned },
  ].filter(amenity => amenity.value);

  const formatBusinessHours = (hours: any) => {
    if (!hours) return 'Hours not specified';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const dayHours = hours[day];
      if (dayHours?.closed) {
        return `${dayNames[index]}: Closed`;
      }
      return `${dayNames[index]}: ${dayHours?.open || '9:00'} - ${dayHours?.close || '17:00'}`;
    }).join('\n');
  };

  const fullAddress = [business.address, business.city, business.state, business.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-foreground">{business.business_name}</h3>
              <Badge variant="secondary">{business.business_type}</Badge>
            </div>
            {business.description && (
              <p className="text-muted-foreground text-sm mb-3">{business.description}</p>
            )}
          </div>
          {business.image_1_url && (
            <div className="ml-4">
              <img 
                src={business.image_1_url} 
                alt={business.business_name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {fullAddress && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{fullAddress}</span>
            </div>
          )}
          
          {business.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a href={`tel:${business.phone}`} className="text-primary hover:underline">
                {business.phone}
              </a>
            </div>
          )}
          
          {business.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a href={`mailto:${business.email}`} className="text-primary hover:underline">
                {business.email}
              </a>
            </div>
          )}
          
          {business.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Visit Website
              </a>
            </div>
          )}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Star className="w-4 h-4" />
              Features
            </h4>
            <div className="flex flex-wrap gap-1">
              {amenities.slice(0, showFullDetails ? amenities.length : 6).map((amenity) => (
                <Badge key={amenity.key} variant="outline" className="text-xs">
                  {amenity.label}
                </Badge>
              ))}
              {!showFullDetails && amenities.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{amenities.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Business Hours */}
        {showFullDetails && business.business_hours && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Hours
            </h4>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">
              {formatBusinessHours(business.business_hours)}
            </pre>
          </div>
        )}

        {/* Google Map */}
        {showFullDetails && (business.address || business.city) && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location
            </h4>
            <GoogleMap
              address={business.address}
              city={business.city}
              country={business.country}
              height="250px"
              className="w-full"
            />
          </div>
        )}

        {/* Additional Images */}
        {showFullDetails && (business.image_2_url || business.image_3_url) && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Gallery</h4>
            <div className="grid grid-cols-2 gap-2">
              {business.image_2_url && (
                <img 
                  src={business.image_2_url} 
                  alt={`${business.business_name} - Image 2`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              {business.image_3_url && (
                <img 
                  src={business.image_3_url} 
                  alt={`${business.business_name} - Image 3`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>
        )}

        {/* Gift Card Section */}
        {business.gift_cards_enabled && business.subscription_tier === 'firstclass' && (
          <div className="pt-4 border-t">
            <GiftCardPurchase 
              businessId={business.id} 
              businessName={business.business_name}
            />
          </div>
        )}

        {/* Action Buttons */}
        {!showFullDetails && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
            {business.phone && (
              <Button variant="default" size="sm" asChild>
                <a href={`tel:${business.phone}`}>Call Now</a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};