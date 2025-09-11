import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Globe, Clock, Users, Star } from 'lucide-react';

interface BusinessFormData {
  business_name?: string;
  business_category?: string;
  business_subtype?: string;
  business_specific_type?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  image_1_url?: string;
  image_2_url?: string;
  image_3_url?: string;
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
}

interface BusinessProfilePreviewProps {
  formData: BusinessFormData;
  businessHours: any;
  onEdit: () => void;
  onSave: () => void;
  loading?: boolean;
  isUpdate?: boolean;
}

const formatBusinessHours = (hours: any) => {
  if (!hours) return 'Hours not specified';
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.map((day, index) => {
    const dayData = hours[day];
    if (!dayData) return `${dayNames[index]}: Closed`;
    if (dayData.closed) return `${dayNames[index]}: Closed`;
    return `${dayNames[index]}: ${dayData.open} - ${dayData.close}`;
  }).join('\n');
};

const getAmenities = (formData: BusinessFormData) => {
  const amenities = [];
  if (formData.wheelchair_access) amenities.push('Wheelchair Access');
  if (formData.extended_hours) amenities.push('Extended Hours');
  if (formData.gluten_free) amenities.push('Gluten Free Options');
  if (formData.low_noise) amenities.push('Quiet Environment');
  if (formData.public_transport) amenities.push('Public Transport');
  if (formData.pet_friendly) amenities.push('Pet Friendly');
  if (formData.outdoor_seating) amenities.push('Outdoor Seating');
  if (formData.senior_discounts) amenities.push('Senior Discounts');
  if (formData.online_booking) amenities.push('Online Booking');
  if (formData.air_conditioned) amenities.push('Air Conditioned');
  return amenities;
};

export const BusinessProfilePreview: React.FC<BusinessProfilePreviewProps> = ({
  formData,
  businessHours,
  onEdit,
  onSave,
  loading = false,
  isUpdate = false
}) => {
  const amenities = getAmenities(formData);
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs font-medium">
            BUSINESS PROFILE PREVIEW
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">
            {formData.business_name || 'Business Name'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {formData.business_category && formData.business_subtype 
              ? `${formData.business_category} - ${formData.business_subtype}${formData.business_specific_type ? ` (${formData.business_specific_type})` : ''}` 
              : 'Business Type Not Specified'}
          </p>
        </div>
      </div>

      {/* Hero Images */}
      {(formData.image_1_url || formData.image_2_url || formData.image_3_url) && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.image_1_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={formData.image_1_url} 
                    alt="Business photo 1" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              )}
              {formData.image_2_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={formData.image_2_url} 
                    alt="Business photo 2" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              )}
              {formData.image_3_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={formData.image_3_url} 
                    alt="Business photo 3" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          {formData.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{formData.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Features & Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="space-y-4">
                {formData.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground break-all">{formData.email}</p>
                    </div>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{formData.phone}</p>
                    </div>
                  </div>
                )}
                {formData.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Website</p>
                      <p className="font-medium text-primary break-all">{formData.website}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </h2>
              <div className="text-sm space-y-1">
                {formData.address && <p className="font-medium">{formData.address}</p>}
                <p className="text-muted-foreground">
                  {formData.city}{formData.state && `, ${formData.state}`}
                </p>
                <p className="text-muted-foreground">
                  {formData.country} {formData.postal_code}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hours
              </h2>
              <div className="text-sm space-y-1 font-mono">
                {formatBusinessHours(businessHours).split('\n').map((line, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">{line.split(':')[0]}:</span>
                    <span className="font-medium">{line.split(':').slice(1).join(':').trim()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          {(formData.facebook || formData.instagram || formData.twitter || formData.linkedin) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Social Media</h2>
                <div className="space-y-3">
                  {formData.facebook && (
                    <div>
                      <p className="text-sm text-muted-foreground">Facebook</p>
                      <p className="text-sm font-medium text-primary break-all">{formData.facebook}</p>
                    </div>
                  )}
                  {formData.instagram && (
                    <div>
                      <p className="text-sm text-muted-foreground">Instagram</p>
                      <p className="text-sm font-medium text-primary break-all">{formData.instagram}</p>
                    </div>
                  )}
                  {formData.twitter && (
                    <div>
                      <p className="text-sm text-muted-foreground">Twitter</p>
                      <p className="text-sm font-medium text-primary break-all">{formData.twitter}</p>
                    </div>
                  )}
                  {formData.linkedin && (
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      <p className="text-sm font-medium text-primary break-all">{formData.linkedin}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-8 border-t">
        <Button 
          variant="outline" 
          onClick={onEdit}
          size="lg"
          className="px-8"
        >
          Edit Profile
        </Button>
        <Button 
          onClick={onSave} 
          disabled={loading}
          size="lg"
          className="px-8"
        >
          {loading ? "Saving..." : isUpdate ? "Update Profile" : "Create Profile"}
        </Button>
      </div>
    </div>
  );
};