import { useState } from 'react';
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
import { Plus, Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { uploadImage } from '@/lib/imageUtils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AddAmenityDialog } from './AddAmenityDialog';

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
  image_1_url: z.string().optional(),
  image_2_url: z.string().optional(),
  image_3_url: z.string().optional(),
  voucher_title: z.string().optional(),
  voucher_description: z.string().optional(),
  custom_amenities: z.record(z.boolean()).optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export const PlaceholderGenerator = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInputType, setImageInputType] = useState<{ [key: string]: 'url' | 'upload' }>({
    image_1: 'url',
    image_2: 'url',
    image_3: 'url',
  });
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({
    image_1: null,
    image_2: null,
    image_3: null,
  });
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({
    image_1: '',
    image_2: '',
    image_3: '',
  });
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

  const { data: amenityOptions = [], refetch: refetchAmenities } = useQuery({
    queryKey: ['amenity-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amenity_options')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
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
      custom_amenities: {},
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
  const watchCustomAmenities = form.watch('custom_amenities') || {};
  const watchBusinessType = form.watch('business_type');

  const validateImageFile = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (!validTypes.includes(file.type)) {
        reject(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.'));
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        reject(new Error('File size must be less than 3MB.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const target = 16 / 9;
        const tolerance = 0.1;
        
        if (Math.abs(aspectRatio - target) > tolerance) {
          reject(new Error('Image must be in 16:9 aspect ratio.'));
        } else {
          resolve(true);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageFileChange = async (key: string, file: File | null) => {
    if (!file) {
      setImageFiles({ ...imageFiles, [key]: null });
      setImagePreviews({ ...imagePreviews, [key]: '' });
      return;
    }

    try {
      await validateImageFile(file);
      setImageFiles({ ...imageFiles, [key]: file });
      setImagePreviews({ ...imagePreviews, [key]: URL.createObjectURL(file) });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Invalid Image',
        description: error.message,
      });
      setImageFiles({ ...imageFiles, [key]: null });
      setImagePreviews({ ...imagePreviews, [key]: '' });
    }
  };

  const onSubmit = async (data: BusinessFormData) => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload images if files are selected
      let uploadedImageUrls: { [key: string]: string } = {};
      
      for (const key of ['image_1', 'image_2', 'image_3']) {
        if (imageInputType[key] === 'upload' && imageFiles[key]) {
          try {
            const fileName = await uploadImage(imageFiles[key]!);
            const { data: { publicUrl } } = supabase.storage
              .from('heroimages')
              .getPublicUrl(fileName);
            uploadedImageUrls[key] = publicUrl;
          } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Image Upload Failed',
              description: `Failed to upload ${key}: ${error.message}`,
            });
            throw error;
          }
        }
      }

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
        image_1_url: uploadedImageUrls.image_1 || data.image_1_url || null,
        image_2_url: uploadedImageUrls.image_2 || data.image_2_url || null,
        image_3_url: uploadedImageUrls.image_3 || data.image_3_url || null,
        custom_amenities: data.custom_amenities || {},
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

                {(watchTier === 'premium' || watchTier === 'firstclass') && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Social Media (Premium & First Class)</h4>
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
                )}

                {watchTier === 'firstclass' && (
                  <>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Media (First Class Only)</h4>
                      <p className="text-sm text-muted-foreground">
                        Images must be 16:9 aspect ratio, max 3MB (JPEG, PNG, WEBP only)
                      </p>
                      
                      {['image_1', 'image_2', 'image_3'].map((imageKey, index) => (
                        <div key={imageKey} className="space-y-2 border rounded-lg p-4">
                          <Label>Image {index + 1} (Optional)</Label>
                          <RadioGroup
                            value={imageInputType[imageKey]}
                            onValueChange={(value: 'url' | 'upload') => {
                              setImageInputType({ ...imageInputType, [imageKey]: value });
                              if (value === 'url') {
                                setImageFiles({ ...imageFiles, [imageKey]: null });
                                setImagePreviews({ ...imagePreviews, [imageKey]: '' });
                              } else {
                                form.setValue(`${imageKey}_url` as any, '');
                              }
                            }}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="url" id={`${imageKey}-url`} />
                              <Label htmlFor={`${imageKey}-url`} className="font-normal flex items-center gap-1">
                                <LinkIcon className="h-3 w-3" />
                                URL
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="upload" id={`${imageKey}-upload`} />
                              <Label htmlFor={`${imageKey}-upload`} className="font-normal flex items-center gap-1">
                                <Upload className="h-3 w-3" />
                                Upload
                              </Label>
                            </div>
                          </RadioGroup>

                          {imageInputType[imageKey] === 'url' ? (
                            <FormField
                              control={form.control}
                              name={`${imageKey}_url` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} placeholder="https://example.com/image.jpg" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : (
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleImageFileChange(imageKey, file);
                                }}
                              />
                              {imagePreviews[imageKey] && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                                  <img
                                    src={imagePreviews[imageKey]}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Amenities</h4>
                    <AddAmenityDialog onAmenityAdded={refetchAmenities} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {amenityOptions.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={watchCustomAmenities[amenity.option_key] || false}
                          onCheckedChange={(checked) => {
                            const current = form.getValues('custom_amenities') || {};
                            form.setValue('custom_amenities', {
                              ...current,
                              [amenity.option_key]: checked === true,
                            });
                          }}
                        />
                        <Label className="font-normal cursor-pointer" htmlFor={amenity.option_key}>
                          {amenity.display_name}
                        </Label>
                      </div>
                    ))}
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
