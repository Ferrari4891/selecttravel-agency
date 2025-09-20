import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface Business {
  id: string;
  business_name: string;
  business_type: string;
  business_subcategory: string | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  status: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_end_date: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  logo_url: string | null;
  image_1_url: string | null;
  image_2_url: string | null;
  image_3_url: string | null;
  wheelchair_access: boolean | null;
  extended_hours: boolean | null;
  gluten_free: boolean | null;
  low_noise: boolean | null;
  public_transport: boolean | null;
  pet_friendly: boolean | null;
  outdoor_seating: boolean | null;
  senior_discounts: boolean | null;
  online_booking: boolean | null;
  air_conditioned: boolean | null;
  business_hours: any;
  admin_notes: string | null;
  rejection_reason: string | null;
}

interface EditBusinessDialogProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onBusinessUpdated: () => void;
}

export const EditBusinessDialog: React.FC<EditBusinessDialogProps> = ({
  business,
  isOpen,
  onClose,
  onBusinessUpdated
}) => {
  const [formData, setFormData] = useState<Partial<Business>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (business) {
      setFormData(business);
    }
  }, [business]);

  const handleInputChange = (field: keyof Business, value: any) => {
    setFormData(prev => {
      const updates: any = { ...prev, [field]: value };
      if (field === 'subscription_status') {
        if (value === 'trial') {
          updates.subscription_tier = null;
          updates.subscription_end_date = null;
        } else if (value === 'active' && !updates.subscription_tier) {
          // Default to basic when activating and no tier is set
          updates.subscription_tier = 'basic';
        }
      }
      return updates;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setLoading(true);
    try {
      const sanitizedForm: any = { ...formData };

      // Map legacy app values to DB-enforced values
      if (sanitizedForm.subscription_status === 'suspended') {
        sanitizedForm.subscription_status = 'canceled';
      }
      if (sanitizedForm.subscription_status === 'trial') {
        sanitizedForm.subscription_tier = null;
        sanitizedForm.subscription_end_date = null;
      } else if (sanitizedForm.subscription_status === 'active' && !sanitizedForm.subscription_tier) {
        sanitizedForm.subscription_tier = 'basic';
      }
      if (sanitizedForm.subscription_tier === 'economy') sanitizedForm.subscription_tier = 'basic';
      if (sanitizedForm.subscription_tier === 'firstclass') sanitizedForm.subscription_tier = 'premium';

      const { data, error } = await supabase
        .from('businesses')
        .update(sanitizedForm)
        .eq('id', business.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      onBusinessUpdated();
      toast({
        title: "Success",
        description: "Business updated successfully.",
      });
      onClose();
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: "Error",
        description: "Failed to update business.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!business) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Business: {business.business_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name || ''}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select
                    value={formData.business_type || ''}
                    onValueChange={(value) => {
                      handleInputChange('business_type', value);
                      // Reset subcategory when type changes
                      handleInputChange('business_subcategory', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="attraction">Attraction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="business_subcategory">Subcategory</Label>
                  <Select
                    value={formData.business_subcategory || ''}
                    onValueChange={(value) => handleInputChange('business_subcategory', value)}
                    disabled={!formData.business_type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.business_type === 'restaurant' && (
                        <>
                          <SelectItem value="fine-dining">Fine Dining</SelectItem>
                          <SelectItem value="casual-dining">Casual Dining</SelectItem>
                          <SelectItem value="fast-food">Fast Food</SelectItem>
                          <SelectItem value="buffet">Buffet</SelectItem>
                          <SelectItem value="food-truck">Food Truck</SelectItem>
                          <SelectItem value="takeaway">Takeaway</SelectItem>
                        </>
                      )}
                      {formData.business_type === 'bar' && (
                        <>
                          <SelectItem value="sports-bar">Sports Bar</SelectItem>
                          <SelectItem value="cocktail-bar">Cocktail Bar</SelectItem>
                          <SelectItem value="wine-bar">Wine Bar</SelectItem>
                          <SelectItem value="pub">Pub</SelectItem>
                          <SelectItem value="nightclub">Nightclub</SelectItem>
                        </>
                      )}
                      {formData.business_type === 'cafe' && (
                        <>
                          <SelectItem value="coffee-shop">Coffee Shop</SelectItem>
                          <SelectItem value="tea-house">Tea House</SelectItem>
                          <SelectItem value="bakery-cafe">Bakery Cafe</SelectItem>
                          <SelectItem value="internet-cafe">Internet Cafe</SelectItem>
                        </>
                      )}
                      {formData.business_type === 'hotel' && (
                        <>
                          <SelectItem value="luxury">Luxury Hotel</SelectItem>
                          <SelectItem value="boutique">Boutique Hotel</SelectItem>
                          <SelectItem value="budget">Budget Hotel</SelectItem>
                          <SelectItem value="resort">Resort</SelectItem>
                          <SelectItem value="bed-breakfast">Bed & Breakfast</SelectItem>
                        </>
                      )}
                      {formData.business_type === 'retail' && (
                        <>
                          <SelectItem value="clothing">Clothing Store</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="grocery">Grocery Store</SelectItem>
                          <SelectItem value="bookstore">Bookstore</SelectItem>
                          <SelectItem value="gift-shop">Gift Shop</SelectItem>
                        </>
                      )}
                      {formData.business_type === 'service' && (
                        <>
                          <SelectItem value="beauty-salon">Beauty Salon</SelectItem>
                          <SelectItem value="spa">Spa</SelectItem>
                          <SelectItem value="gym">Gym/Fitness</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="cleaning">Cleaning Service</SelectItem>
                        </>
                      )}
                      {formData.business_type === 'entertainment' && (
                        <>
                          <SelectItem value="cinema">Cinema</SelectItem>
                          <SelectItem value="theater">Theater</SelectItem>
                          <SelectItem value="arcade">Arcade</SelectItem>
                          <SelectItem value="bowling">Bowling Alley</SelectItem>
                          <SelectItem value="karaoke">Karaoke</SelectItem>
                        </>
                      )}
                      {formData.business_type === 'attraction' && (
                        <>
                          <SelectItem value="museum">Museum</SelectItem>
                          <SelectItem value="gallery">Art Gallery</SelectItem>
                          <SelectItem value="park">Park</SelectItem>
                          <SelectItem value="zoo">Zoo</SelectItem>
                          <SelectItem value="landmark">Landmark</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || ''}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subscription_tier">Subscription Tier</Label>
                  <Select
                    value={formData.subscription_tier || ''}
                    onValueChange={(value) => handleInputChange('subscription_tier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="firstclass">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code || ''}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Social Media</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.facebook || ''}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram || ''}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.twitter || ''}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin || ''}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wheelchair_access">Wheelchair Access</Label>
                    <Switch
                      id="wheelchair_access"
                      checked={formData.wheelchair_access || false}
                      onCheckedChange={(checked) => handleInputChange('wheelchair_access', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="extended_hours">Extended Hours</Label>
                    <Switch
                      id="extended_hours"
                      checked={formData.extended_hours || false}
                      onCheckedChange={(checked) => handleInputChange('extended_hours', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gluten_free">Gluten Free Options</Label>
                    <Switch
                      id="gluten_free"
                      checked={formData.gluten_free || false}
                      onCheckedChange={(checked) => handleInputChange('gluten_free', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="low_noise">Low Noise Environment</Label>
                    <Switch
                      id="low_noise"
                      checked={formData.low_noise || false}
                      onCheckedChange={(checked) => handleInputChange('low_noise', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public_transport">Public Transport Access</Label>
                    <Switch
                      id="public_transport"
                      checked={formData.public_transport || false}
                      onCheckedChange={(checked) => handleInputChange('public_transport', checked)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pet_friendly">Pet Friendly</Label>
                    <Switch
                      id="pet_friendly"
                      checked={formData.pet_friendly || false}
                      onCheckedChange={(checked) => handleInputChange('pet_friendly', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="outdoor_seating">Outdoor Seating</Label>
                    <Switch
                      id="outdoor_seating"
                      checked={formData.outdoor_seating || false}
                      onCheckedChange={(checked) => handleInputChange('outdoor_seating', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="senior_discounts">Senior Discounts</Label>
                    <Switch
                      id="senior_discounts"
                      checked={formData.senior_discounts || false}
                      onCheckedChange={(checked) => handleInputChange('senior_discounts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="online_booking">Online Booking</Label>
                    <Switch
                      id="online_booking"
                      checked={formData.online_booking || false}
                      onCheckedChange={(checked) => handleInputChange('online_booking', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="air_conditioned">Air Conditioned</Label>
                    <Switch
                      id="air_conditioned"
                      checked={formData.air_conditioned || false}
                      onCheckedChange={(checked) => handleInputChange('air_conditioned', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div>
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={formData.admin_notes || ''}
                  onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                  rows={3}
                  placeholder="Internal notes about this business..."
                />
              </div>

              <div>
                <Label htmlFor="rejection_reason">Rejection Reason</Label>
                <Textarea
                  id="rejection_reason"
                  value={formData.rejection_reason || ''}
                  onChange={(e) => handleInputChange('rejection_reason', e.target.value)}
                  rows={2}
                  placeholder="Reason for rejection (if applicable)..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscription_status">Subscription Status</Label>
                  <Select
                    value={formData.subscription_status || ''}
                    onValueChange={(value) => handleInputChange('subscription_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subscription_end_date">Subscription End Date</Label>
                  <Input
                    id="subscription_end_date"
                    type="date"
                    value={formData.subscription_end_date?.split('T')[0] || ''}
                    onChange={(e) => handleInputChange('subscription_end_date', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Business
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};