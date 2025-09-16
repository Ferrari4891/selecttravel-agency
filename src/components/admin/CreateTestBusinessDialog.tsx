import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreateTestBusinessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onBusinessCreated: () => void;
}

// Business type hierarchical structure matching the home page
const businessCategories = {
  'Food': {
    'Restaurants': [
      'African Food', 'British Food', 'Cajun Food', 'Caribbean Food', 'Chinese Food', 
      'Eastern European Food', 'French Food', 'German Food', 'Greek Food', 'Indian Food', 
      'International Food', 'Irish Food', 'Italian Food', 'Japanese Food', 'Mediterranean Food', 
      'Mexican Food', 'South American Food', 'Spanish Food', 'Thai Food', 'Vietnamese Food'
    ],
    'Fast Food': [
      'Burger Chains', 'Pizza Chains', 'Chicken Chains', 'Sandwich Shops', 'Taco Shops',
      'Asian Fast Food', 'Coffee Chains', 'Bakery Chains', 'Ice Cream Shops', 'Donut Shops'
    ]
  },
  'Drink': {
    'Bars': [
      'Sports Bars', 'Wine Bars', 'Cocktail Bars', 'Beer Gardens', 'Rooftop Bars',
      'Dive Bars', 'Hotel Bars', 'Beach Bars', 'Whiskey Bars', 'Piano Bars'
    ],
    'Clubs': [
      'Dance Clubs', 'Jazz Clubs', 'Comedy Clubs', 'Strip Clubs', 'Karaoke Bars',
      'Live Music Venues', 'Lounge Bars', 'Themed Clubs', 'Beach Clubs', 'Underground Clubs'
    ]
  },
  'Stay': {
    'Hotels': [
      'Luxury Hotels', 'Business Hotels', 'Budget Hotels', 'Boutique Hotels', 'Resort Hotels'
    ],
    'Alternative': [
      'Hostels', 'Bed & Breakfast', 'Vacation Rentals', 'Guesthouses', 'Motels'
    ]
  },
  'Play': {
    'Entertainment': [
      'Theaters', 'Cinemas', 'Concert Halls', 'Comedy Venues', 'Arcades'
    ],
    'Recreation': [
      'Sports Centers', 'Gyms', 'Spas', 'Adventure Parks', 'Gaming Centers'
    ]
  }
};

const subscriptionTiers = [
  { value: 'trial', label: 'Trial (Free)', tier: null },
  { value: 'basic', label: 'Basic Plan', tier: 'basic' },
  { value: 'premium', label: 'Premium Plan', tier: 'premium' },
  { value: 'firstclass', label: 'First Class Plan', tier: 'firstclass' }
];

export const CreateTestBusinessDialog: React.FC<CreateTestBusinessDialogProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onBusinessCreated
}) => {
  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    subcategory: '',
    business_type: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    subscription: 'trial',
    wheelchair_access: false,
    extended_hours: false,
    gluten_free: false,
    low_noise: false,
    public_transport: false,
    pet_friendly: false,
    outdoor_seating: false,
    senior_discounts: false,
    online_booking: false,
    air_conditioned: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.business_name || !formData.category || !formData.subcategory || !formData.business_type) {
      toast({
        title: "Validation Error", 
        description: "Please fill in all required fields (name, category, subcategory, and type)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const selectedSubscription = subscriptionTiers.find(s => s.value === formData.subscription);
      const subscriptionData = {
        subscription_tier: selectedSubscription?.tier,
        subscription_status: formData.subscription === 'trial' ? 'trial' : 'active',
        subscription_end_date: formData.subscription !== 'trial' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null
      };

      const { error } = await supabase.from('businesses').insert([{
        user_id: user?.id,
        business_name: formData.business_name,
        business_type: `${formData.category} - ${formData.subcategory} - ${formData.business_type}`,
        description: formData.description,
        address: formData.address,
        city: selectedCity,
        country: 'Vietnam', // Default for Danang test market
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        status: 'active', // Auto-approve test businesses
        ...subscriptionData,
        wheelchair_access: formData.wheelchair_access,
        extended_hours: formData.extended_hours,
        gluten_free: formData.gluten_free,
        low_noise: formData.low_noise,
        public_transport: formData.public_transport,
        pet_friendly: formData.pet_friendly,
        outdoor_seating: formData.outdoor_seating,
        senior_discounts: formData.senior_discounts,
        online_booking: formData.online_booking,
        air_conditioned: formData.air_conditioned
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test business created successfully!",
      });

      // Reset form
      setFormData({
        business_name: '',
        category: '',
        subcategory: '',
        business_type: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        subscription: 'trial',
        wheelchair_access: false,
        extended_hours: false,
        gluten_free: false,
        low_noise: false,
        public_transport: false,
        pet_friendly: false,
        outdoor_seating: false,
        senior_discounts: false,
        online_booking: false,
        air_conditioned: false
      });

      onBusinessCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating test business:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create test business.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Test Business</DialogTitle>
          <DialogDescription>
            Create a new test business in {selectedCity} for market testing purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Enter business name"
                  className="rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    handleInputChange('category', value);
                    handleInputChange('subcategory', '');
                    handleInputChange('business_type', '');
                  }}
                >
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(businessCategories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.category && (
                <div>
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value) => {
                      handleInputChange('subcategory', value);
                      handleInputChange('business_type', '');
                    }}
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(businessCategories[formData.category as keyof typeof businessCategories] || {}).map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.category && formData.subcategory && (
                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const category = businessCategories[formData.category as keyof typeof businessCategories];
                        if (!category) return [];
                        const subcategory = category[formData.subcategory as keyof typeof category] as string[] | undefined;
                        return (subcategory || []).map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the business"
                className="rounded-none"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Business address"
                  className="rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                  className="rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Business email"
                  className="rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="Website URL"
                  className="rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="space-y-4">
            <h3 className="font-medium">Subscription Plan</h3>
            <Select value={formData.subscription} onValueChange={(value) => handleInputChange('subscription', value)}>
              <SelectTrigger className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subscriptionTiers.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-medium">Amenities & Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'wheelchair_access', label: 'Wheelchair Access' },
                { key: 'extended_hours', label: 'Extended Hours' },
                { key: 'gluten_free', label: 'Gluten Free Options' },
                { key: 'low_noise', label: 'Low Noise Environment' },
                { key: 'public_transport', label: 'Public Transport' },
                { key: 'pet_friendly', label: 'Pet Friendly' },
                { key: 'outdoor_seating', label: 'Outdoor Seating' },
                { key: 'senior_discounts', label: 'Senior Discounts' },
                { key: 'online_booking', label: 'Online Booking' },
                { key: 'air_conditioned', label: 'Air Conditioned' }
              ].map((amenity) => (
                <div key={amenity.key} className="flex items-center space-x-2">
                  <Switch
                    id={amenity.key}
                    checked={formData[amenity.key as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) => handleInputChange(amenity.key, checked)}
                  />
                  <Label htmlFor={amenity.key} className="text-sm">{amenity.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="flex-1 rounded-none"
            >
              {loading ? 'Creating...' : 'Create Business'}
            </Button>
            <Button variant="outline" onClick={onClose} className="rounded-none">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};