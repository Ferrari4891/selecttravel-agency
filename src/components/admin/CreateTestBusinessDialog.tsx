import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Youtube, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { 
  MediaType, 
  extractYouTubeId, 
  isValidYouTubeId, 
  uploadAndProcessImage 
} from '@/lib/businessMedia';

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
    air_conditioned: false,
    // Social media
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    tiktok: '',
    youtube: '',
    // Transport apps
    grab_link: '',
    uber_link: ''
  });

  // Media upload states
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [mediaImages, setMediaImages] = useState<File[]>([]);
  const [youtubePreviews, setYoutubePreviews] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [imageAltTexts, setImageAltTexts] = useState<string[]>(['']);
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Update media options based on subscription
  useEffect(() => {
    const subscription = formData.subscription;
    if (subscription === 'trial' || subscription === 'basic') {
      setMediaType('image');
      setMediaImages([]);
      setYoutubePreviews([]);
      setYoutubeUrl('');
      setImageAltTexts(['']);
    } else if (subscription === 'premium') {
      if (mediaType === 'youtube') {
        setMediaType('carousel');
      }
      setYoutubeUrl('');
    }
  }, [formData.subscription]);

  // Get subscription permissions
  const getMediaPermissions = () => {
    const subscription = formData.subscription;
    return {
      singleImage: true, // Available to all
      carousel: subscription === 'premium' || subscription === 'firstclass',
      youtube: subscription === 'firstclass'
    };
  };

  const initializeMediaForType = (type: MediaType) => {
    if (type === 'carousel') {
      setMediaImages(Array(3).fill(null));
      setImageAltTexts(Array(3).fill(''));
      setYoutubePreviews([]);
    } else if (type === 'image') {
      setMediaImages([]);
      setImageAltTexts(['']);
      setYoutubePreviews([]);
    } else {
      setMediaImages([]);
      setImageAltTexts([]);
      setYoutubePreviews([]);
    }
  };

  const handleMediaTypeChange = (type: MediaType) => {
    setMediaType(type);
    initializeMediaForType(type);
    setYoutubeUrl('');
  };

  const handleImageUpload = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large", 
        description: "Image must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    const newImages = [...mediaImages];
    newImages[index] = file;
    setMediaImages(newImages);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...youtubePreviews];
      newPreviews[index] = e.target?.result as string;
      setYoutubePreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...mediaImages];
    newImages[index] = null as any;
    setMediaImages(newImages);

    const newPreviews = [...youtubePreviews];
    newPreviews[index] = '';
    setYoutubePreviews(newPreviews);
  };

  const generateAppLink = (appType: 'grab' | 'uber', location: string) => {
    const encodedLocation = encodeURIComponent(location);
    
    if (appType === 'grab') {
      // Grab deep link format
      return `grab://open?screen=booking&pickup=my_location&destination=${encodedLocation}`;
    } else {
      // Uber deep link format  
      return `uber://?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodedLocation}`;
    }
  };

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

    // Validate media based on type and subscription
    const permissions = getMediaPermissions();
    if (mediaType === 'carousel' && !permissions.carousel) {
      toast({
        title: "Subscription Required",
        description: "Carousel media requires Premium or First Class subscription",
        variant: "destructive"
      });
      return;
    }
    
    if (mediaType === 'youtube' && !permissions.youtube) {
      toast({
        title: "Subscription Required", 
        description: "YouTube video requires First Class subscription",
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

      // Generate transport app links
      const businessAddress = formData.address || `${formData.business_name}, ${selectedCity}`;
      const grabLink = formData.grab_link || generateAppLink('grab', businessAddress);
      const uberLink = formData.uber_link || generateAppLink('uber', businessAddress);

      const { data: businessData, error } = await supabase.from('businesses').insert([{
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
        facebook: formData.facebook,
        instagram: formData.instagram,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
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
      }]).select().single();

      if (error) throw error;

      // Handle media upload if there's media content
      if (businessData?.id && (
        (mediaType === 'image' && mediaImages[0]) ||
        (mediaType === 'carousel' && mediaImages.filter(Boolean).length === 3) ||
        (mediaType === 'youtube' && youtubeUrl && isValidYouTubeId(extractYouTubeId(youtubeUrl) || ''))
      )) {
        let mediaData: any = {
          business_id: businessData.id,
          media_type: mediaType
        };

        if (mediaType === 'youtube') {
          const youtubeId = extractYouTubeId(youtubeUrl);
          mediaData.youtube_url = youtubeUrl;
          mediaData.youtube_id = youtubeId;
          mediaData.images = null;
        } else {
          // Upload images
          const imagePromises = mediaImages.filter(Boolean).map(async (file, index) => {
            const path = await uploadAndProcessImage(file, businessData.id);
            return {
              url: path,
              alt: imageAltTexts[index] || `${formData.business_name} image ${index + 1}`,
              width: 1920,
              height: 1080
            };
          });

          const processedImages = await Promise.all(imagePromises);
          mediaData.images = processedImages;
          mediaData.youtube_url = null;
          mediaData.youtube_id = null;
        }

        const { error: mediaError } = await supabase
          .from('business_media')
          .upsert(mediaData, { onConflict: 'business_id' });

        if (mediaError) {
          console.error('Media upload error:', mediaError);
          toast({
            title: "Warning",
            description: "Business created but media upload failed",
            variant: "destructive"
          });
        }
      }

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
        air_conditioned: false,
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        tiktok: '',
        youtube: '',
        grab_link: '',
        uber_link: ''
      });
      
      setMediaType('image');
      setMediaImages([]);
      setYoutubePreviews([]);
      setYoutubeUrl('');
      setImageAltTexts(['']);

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

          {/* Media Upload Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Business Media (Header Images 16:9)</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Media Type</Label>
                <p className="text-sm text-muted-foreground">
                  {getMediaPermissions().singleImage && 'Single image: Available to all subscriptions'}<br/>
                  {getMediaPermissions().carousel && 'Carousel: Business/First Class only'}<br/>
                  {getMediaPermissions().youtube && 'YouTube: First Class only'}
                </p>
                <RadioGroup 
                  value={mediaType} 
                  onValueChange={handleMediaTypeChange}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="single-image" />
                    <Label htmlFor="single-image">Single image</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="carousel" 
                      id="carousel-images" 
                      disabled={!getMediaPermissions().carousel}
                    />
                    <Label htmlFor="carousel-images" className={!getMediaPermissions().carousel ? 'text-muted-foreground' : ''}>
                      3-image carousel (2s intervals) - Business/First Class
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="youtube" 
                      id="youtube-video" 
                      disabled={!getMediaPermissions().youtube}
                    />
                    <Label htmlFor="youtube-video" className={!getMediaPermissions().youtube ? 'text-muted-foreground' : ''}>
                      YouTube video - First Class only
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Image Upload */}
              {(mediaType === 'image' || mediaType === 'carousel') && (
                <div>
                  <Label>Upload Images (JPG, PNG, WEBP, max 10MB)</Label>
                  <div className="grid gap-4 mt-2">
                    {Array.from({ length: mediaType === 'carousel' ? 3 : 1 }).map((_, index) => (
                      <div key={index} className="border border-dashed p-4 space-y-3">
                        <Label>Image {index + 1} {mediaType === 'carousel' && '(Required)'}</Label>
                        
                        {youtubePreviews[index] ? (
                          <div className="space-y-2">
                            <img 
                              src={youtubePreviews[index]} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover border"
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="Alt text for accessibility"
                                value={imageAltTexts[index] || ''}
                                onChange={(e) => {
                                  const newAltTexts = [...imageAltTexts];
                                  newAltTexts[index] = e.target.value;
                                  setImageAltTexts(newAltTexts);
                                }}
                                className="rounded-none"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleImageRemove(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-dashed p-8 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(index, file);
                              }}
                              className="hidden"
                              id={`upload-${index}`}
                            />
                            <Label htmlFor={`upload-${index}`} className="cursor-pointer">
                              <div className="flex flex-col items-center space-y-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Click to upload image
                                </span>
                              </div>
                            </Label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube URL */}
              {mediaType === 'youtube' && (
                <div>
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="rounded-none"
                  />
                  {youtubeUrl && isValidYouTubeId(extractYouTubeId(youtubeUrl) || '') && (
                    <div className="mt-2 aspect-video">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(youtubeUrl)}`}
                        title="YouTube preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="font-medium">Social Media & Online Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
                { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourpage' },
                { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/yourpage' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourpage' },
                { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourpage' },
                { key: 'youtube', label: 'YouTube Channel', placeholder: 'https://youtube.com/c/yourchannel' }
              ].map((social) => (
                <div key={social.key}>
                  <Label htmlFor={social.key}>{social.label}</Label>
                  <Input
                    id={social.key}
                    value={formData[social.key as keyof typeof formData] as string}
                    onChange={(e) => handleInputChange(social.key, e.target.value)}
                    placeholder={social.placeholder}
                    className="rounded-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Transport App Links */}
          <div className="space-y-4">
            <h3 className="font-medium">Transport App Integration</h3>
            <p className="text-sm text-muted-foreground">
              Links will auto-generate based on business address. These will open the app if installed, 
              or redirect to app stores if not installed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grab_link">Grab Link (Optional Override)</Label>
                <Input
                  id="grab_link"
                  value={formData.grab_link}
                  onChange={(e) => handleInputChange('grab_link', e.target.value)}
                  placeholder="Auto-generated from address"
                  className="rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="uber_link">Uber Link (Optional Override)</Label>
                <Input
                  id="uber_link"
                  value={formData.uber_link}
                  onChange={(e) => handleInputChange('uber_link', e.target.value)}
                  placeholder="Auto-generated from address"
                  className="rounded-none"
                />
              </div>
            </div>
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