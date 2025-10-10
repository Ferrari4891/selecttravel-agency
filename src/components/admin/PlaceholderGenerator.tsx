import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const businessSchema = z.object({
  business_name: z.string().min(1, 'Business name required'),
  business_type: z.enum(['EAT', 'DRINK']),
  subscription_tier: z.enum(['basic', 'premium', 'firstclass']),
  price_level: z.enum(['$', '$$', '$$$']),
  cuisine_type: z.string().optional(),
  drink_specialties: z.array(z.string()).optional(),
  food_specialties: z.array(z.string()).optional(),
  description: z.string().optional(),
  city: z.string().min(1, 'City required'),
  country: z.string().min(1, 'Country required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  image_1_url: z.string().url().optional().or(z.literal('')),
  image_2_url: z.string().url().optional().or(z.literal('')),
  image_3_url: z.string().url().optional().or(z.literal('')),
  voucher_title: z.string().optional(),
  voucher_description: z.string().optional(),
  wheelchair_access: z.boolean().default(false),
  extended_hours: z.boolean().default(false),
  gluten_free: z.boolean().default(false),
  low_noise: z.boolean().default(false),
  public_transport: z.boolean().default(false),
  pet_friendly: z.boolean().default(false),
  outdoor_seating: z.boolean().default(false),
  senior_discounts: z.boolean().default(false),
  online_booking: z.boolean().default(false),
  air_conditioned: z.boolean().default(false),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export const PlaceholderGenerator = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: cuisineTypes = [] } = useQuery({
    queryKey: ['cuisine-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cuisine_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: drinkSpecialties = [] } = useQuery({
    queryKey: ['drink-specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drink_specialties')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: foodSpecialties = [] } = useQuery({
    queryKey: ['food-specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_specialties')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      subscription_tier: 'basic',
      business_type: 'EAT',
      price_level: '$',
      wheelchair_access: false,
      extended_hours: false,
      gluten_free: false,
      low_noise: false,
      public_transport: false,
      pet_friendly: false,
      outdoor_seating: false,
      senior_discounts: false,
      online_booking: false,
      air_conditioned: false,
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      image_1_url: '',
      image_2_url: '',
      image_3_url: '',
      voucher_title: '',
      voucher_description: '',
    },
  });

  const watchTier = form.watch('subscription_tier');
  const watchBusinessType = form.watch('business_type');

  const onSubmit = async (data: BusinessFormData) => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const businessData = {
        user_id: user.id,
        business_name: data.business_name,
        business_type: data.business_type,
        business_categories: [data.business_type],
        subscription_tier: data.subscription_tier,
        subscription_status: 'trial',
        status: 'pending',
        price_level: data.price_level,
        cuisine_type: data.business_type === 'EAT' ? data.cuisine_type : null,
        drink_specialties: data.business_type === 'DRINK' ? data.drink_specialties : null,
        food_specialties: data.business_type === 'EAT' ? data.food_specialties : null,
        description: data.description,
        city: data.city,
        country: data.country,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        facebook: data.facebook,
        instagram: data.instagram,
        twitter: data.twitter,
        linkedin: data.linkedin,
        image_1_url: data.image_1_url,
        image_2_url: data.image_2_url,
        image_3_url: data.image_3_url,
        wheelchair_access: data.wheelchair_access,
        extended_hours: data.extended_hours,
        gluten_free: data.gluten_free,
        low_noise: data.low_noise,
        public_transport: data.public_transport,
        pet_friendly: data.pet_friendly,
        outdoor_seating: data.outdoor_seating,
        senior_discounts: data.senior_discounts,
        online_booking: data.online_booking,
        air_conditioned: data.air_conditioned,
      };

      const { data: insertedBusiness, error } = await supabase
        .from('businesses')
        .insert([businessData])
        .select()
        .single();

      if (error) throw error;

      // Create placeholder voucher for first class tier
      if (data.subscription_tier === 'firstclass' && data.voucher_title && insertedBusiness) {
        const { error: voucherError } = await supabase.from('business_vouchers').insert([{
          business_id: insertedBusiness.id,
          title: data.voucher_title,
          description: data.voucher_description || 'Placeholder voucher - to be configured',
          voucher_type: 'percentage_discount',
          discount_value: 10,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: false,
        }]);
        
        if (voucherError) console.error('Voucher creation error:', voucherError);
      }

      toast({
        title: 'Success',
        description: 'Placeholder business created and pending approval',
      });

      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating placeholder:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create placeholder business',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierFeatures = (tier: string) => {
    switch (tier) {
      case 'firstclass':
        return 'All amenities, vouchers, gift cards, analytics';
      case 'premium':
        return 'Most amenities, enhanced visibility';
      case 'basic':
      default:
        return 'Basic amenities and listing';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Placeholder Business</CardTitle>
        <CardDescription>
          Create individual placeholder entries with custom data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create New Placeholder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Placeholder Business</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter business name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscription_tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Tier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic - {getTierFeatures('basic')}</SelectItem>
                          <SelectItem value="premium">Premium - {getTierFeatures('premium')}</SelectItem>
                          <SelectItem value="firstclass">First Class - {getTierFeatures('firstclass')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EAT">EAT (Food)</SelectItem>
                          <SelectItem value="DRINK">DRINK</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="$">$ - Budget</SelectItem>
                          <SelectItem value="$$">$$ - Moderate</SelectItem>
                          <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchBusinessType === 'EAT' && (
                  <FormField
                    control={form.control}
                    name="cuisine_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuisine Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cuisine type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cuisineTypes.map((cuisine) => (
                              <SelectItem key={cuisine.id} value={cuisine.name}>
                                {cuisine.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Business description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Street address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <h4 className="font-semibold">Social Media</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://facebook.com/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://instagram.com/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://twitter.com/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://linkedin.com/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {watchTier === 'firstclass' && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Media (First Class Only)</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="image_1_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image 1 URL (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="image_2_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image 2 URL (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="image_3_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image 3 URL (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Voucher (First Class Only - Placeholder)</h4>
                      <FormField
                        control={form.control}
                        name="voucher_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Voucher Title (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 10% Off Special" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voucher_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Voucher Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Placeholder voucher details..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="wheelchair_access"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Wheelchair Access</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="public_transport"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Public Transport</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pet_friendly"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Pet Friendly</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="outdoor_seating"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Outdoor Seating</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="air_conditioned"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Air Conditioned</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="senior_discounts"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Senior Discounts</FormLabel>
                        </FormItem>
                      )}
                    />

                    {watchTier !== 'basic' && (
                      <>
                        <FormField
                          control={form.control}
                          name="extended_hours"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Extended Hours</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="online_booking"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Online Booking</FormLabel>
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {watchBusinessType === 'EAT' && (
                      <>
                        <FormField
                          control={form.control}
                          name="gluten_free"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Gluten Free Options</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="low_noise"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Low Noise</FormLabel>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Placeholder Business'
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
