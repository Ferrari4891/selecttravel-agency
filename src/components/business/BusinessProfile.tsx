import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { BusinessHours } from './BusinessHours';

const businessSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_type: z.string().min(1, 'Business type is required'),
  description: z.string().max(180, 'Description must be 180 characters or less').optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  image_1_url: z.string().optional(),
  image_2_url: z.string().optional(),
  image_3_url: z.string().optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface BusinessProfileProps {
  business?: any;
  onBusinessCreated?: (business: any) => void;
  onBusinessUpdated?: (business: any) => void;
}

const businessTypes = [
  'Eat', 'Stay', 'Drink', 'Shop', 'Play'
];

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland',
  'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary',
  'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'New Zealand',
  'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru',
  'India', 'China', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines',
  'South Africa', 'Egypt', 'Israel', 'UAE', 'Saudi Arabia', 'Turkey'
];

const citiesByCountry: Record<string, string[]> = {
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans', 'Wichita'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Mississauga', 'Winnipeg', 'Quebec City', 'Hamilton', 'Brampton', 'Surrey', 'Laval', 'Halifax', 'London', 'Markham', 'Vaughan', 'Gatineau', 'Saskatoon', 'Longueuil', 'Burnaby', 'Regina', 'Richmond', 'Richmond Hill', 'Oakville', 'Burlington', 'Sherbrooke', 'Oshawa', 'Saguenay', 'Lévis', 'Barrie', 'Abbotsford', 'Coquitlam', 'Trois-Rivières', 'St. Catharines', 'Guelph', 'Cambridge', 'Whitby', 'Kelowna', 'Kingston'],
  'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Wakefield', 'Coventry', 'Belfast', 'Nottingham', 'Newcastle', 'Bradford', 'Stoke-on-Trent', 'Wolverhampton', 'Plymouth', 'Southampton', 'Reading', 'Derby', 'Dudley', 'Northampton', 'Portsmouth', 'Luton', 'Preston', 'Milton Keynes', 'Aberdeen', 'Sunderland', 'Norwich', 'Walsall', 'Bournemouth', 'Southend-on-Sea', 'Swindon', 'Huddersfield', 'Oxford', 'Poole', 'Bolton'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Central Coast', 'Wollongong', 'Logan City', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury', 'Bundaberg', 'Coffs Harbour', 'Wagga Wagga', 'Hervey Bay', 'Mildura', 'Shepparton'],
  'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen', 'Mönchengladbach', 'Braunschweig', 'Chemnitz', 'Kiel', 'Aachen'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Saint-Denis', 'Le Mans', 'Aix-en-Provence', 'Clermont-Ferrand', 'Brest', 'Limoges', 'Tours', 'Amiens', 'Perpignan', 'Metz'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'San Luis Potosí', 'Aguascalientes', 'Hermosillo', 'Saltillo', 'Mexicali', 'Culiacán', 'Guadalupe', 'Acapulco', 'Tlalnepantla', 'Cancún', 'Querétaro', 'Chimalhuacán', 'Torreón', 'Morelia', 'Reynosa', 'Tlaquepaque', 'Tuxtla Gutiérrez', 'Victoria de Durango', 'Toluca', 'Chihuahua', 'Veracruz'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Nova Iguaçu', 'Natal', 'Campo Grande', 'Teresina', 'São Bernardo do Campo', 'João Pessoa', 'Jaboatão dos Guararapes', 'Santo André', 'Osasco', 'Contagem', 'São José dos Campos', 'Uberlândia'],
  'Japan': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Okayama', 'Sagamihara', 'Kumamoto', 'Shizuoka', 'Kagoshima', 'Matsuyama', 'Wakayama', 'Kawaguchi', 'Utsunomiya', 'Toyama', 'Kanazawa', 'Takasaki', 'Yokosuka'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar'],
  'China': ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Chengdu', 'Tianjin', 'Nanjing', 'Wuhan', 'Xian', 'Hangzhou', 'Chongqing', 'Zhengzhou', 'Qingdao', 'Dalian', 'Jinan', 'Kunming', 'Shenyang', 'Harbin', 'Changchun', 'Fuzhou', 'Shijiazhuang', 'Changsha', 'Hefei', 'Urumqi', 'Suzhou', 'Wuxi', 'Ningbo', 'Dongguan', 'Foshan', 'Nanchang'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang', 'Yongin', 'Seongnam', 'Bucheon', 'Ansan', 'Jeonju', 'Anyang', 'Cheongju', 'Cheonan', 'Namyangju', 'Hwaseong', 'Pohang', 'Uijeongbu', 'Siheung', 'Gimhae', 'Pyeongtaek', 'Gunpo', 'Jinju', 'Osan', 'Iksan', 'Yangsan']
};

const statesByCity: Record<string, string> = {
  // United States
  'New York': 'New York', 'Los Angeles': 'California', 'Chicago': 'Illinois', 'Houston': 'Texas', 'Phoenix': 'Arizona', 'Philadelphia': 'Pennsylvania', 'San Antonio': 'Texas', 'San Diego': 'California', 'Dallas': 'Texas', 'San Jose': 'California', 'Austin': 'Texas', 'Jacksonville': 'Florida', 'Fort Worth': 'Texas', 'Columbus': 'Ohio', 'Charlotte': 'North Carolina', 'San Francisco': 'California', 'Indianapolis': 'Indiana', 'Seattle': 'Washington', 'Denver': 'Colorado', 'Washington DC': 'District of Columbia', 'Boston': 'Massachusetts', 'El Paso': 'Texas', 'Nashville': 'Tennessee', 'Detroit': 'Michigan', 'Oklahoma City': 'Oklahoma', 'Portland': 'Oregon', 'Las Vegas': 'Nevada', 'Memphis': 'Tennessee', 'Louisville': 'Kentucky', 'Baltimore': 'Maryland', 'Milwaukee': 'Wisconsin', 'Albuquerque': 'New Mexico', 'Tucson': 'Arizona', 'Fresno': 'California', 'Sacramento': 'California', 'Kansas City': 'Missouri', 'Mesa': 'Arizona', 'Atlanta': 'Georgia', 'Omaha': 'Nebraska', 'Colorado Springs': 'Colorado', 'Raleigh': 'North Carolina', 'Miami': 'Florida', 'Virginia Beach': 'Virginia', 'Oakland': 'California', 'Minneapolis': 'Minnesota', 'Tulsa': 'Oklahoma', 'Arlington': 'Texas', 'Tampa': 'Florida', 'New Orleans': 'Louisiana', 'Wichita': 'Kansas',
  // Canada
  'Toronto': 'Ontario', 'Montreal': 'Quebec', 'Vancouver': 'British Columbia', 'Calgary': 'Alberta', 'Edmonton': 'Alberta', 'Ottawa': 'Ontario', 'Mississauga': 'Ontario', 'Winnipeg': 'Manitoba', 'Quebec City': 'Quebec', 'Hamilton': 'Ontario', 'Brampton': 'Ontario', 'Surrey': 'British Columbia', 'Laval': 'Quebec', 'Halifax': 'Nova Scotia', 'London': 'Ontario', 'Markham': 'Ontario', 'Vaughan': 'Ontario', 'Gatineau': 'Quebec', 'Saskatoon': 'Saskatchewan', 'Longueuil': 'Quebec', 'Burnaby': 'British Columbia', 'Regina': 'Saskatchewan', 'Richmond': 'British Columbia', 'Richmond Hill': 'Ontario', 'Oakville': 'Ontario', 'Burlington': 'Ontario', 'Sherbrooke': 'Quebec', 'Oshawa': 'Ontario', 'Saguenay': 'Quebec', 'Lévis': 'Quebec', 'Barrie': 'Ontario', 'Abbotsford': 'British Columbia', 'Coquitlam': 'British Columbia', 'Trois-Rivières': 'Quebec', 'St. Catharines': 'Ontario', 'Guelph': 'Ontario', 'Cambridge': 'Ontario', 'Whitby': 'Ontario', 'Kelowna': 'British Columbia', 'Kingston': 'Ontario',
  // Australia  
  'Sydney': 'New South Wales', 'Melbourne': 'Victoria', 'Brisbane': 'Queensland', 'Perth': 'Western Australia', 'Adelaide': 'South Australia', 'Gold Coast': 'Queensland', 'Newcastle': 'New South Wales', 'Canberra': 'Australian Capital Territory', 'Central Coast': 'New South Wales', 'Wollongong': 'New South Wales', 'Logan City': 'Queensland', 'Geelong': 'Victoria', 'Hobart': 'Tasmania', 'Townsville': 'Queensland', 'Cairns': 'Queensland', 'Darwin': 'Northern Territory', 'Toowoomba': 'Queensland', 'Ballarat': 'Victoria', 'Bendigo': 'Victoria', 'Albury': 'New South Wales', 'Launceston': 'Tasmania', 'Mackay': 'Queensland', 'Rockhampton': 'Queensland', 'Bunbury': 'Western Australia', 'Bundaberg': 'Queensland', 'Coffs Harbour': 'New South Wales', 'Wagga Wagga': 'New South Wales', 'Hervey Bay': 'Queensland', 'Mildura': 'Victoria', 'Shepparton': 'Victoria'
};

export const BusinessProfile: React.FC<BusinessProfileProps> = ({
  business,
  onBusinessCreated,
  onBusinessUpdated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const [businessHours, setBusinessHours] = useState(
    business?.business_hours || {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    }
  );
  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      business_name: business?.business_name || '',
      business_type: business?.business_type || '',
      description: business?.description || '',
      website: business?.website || '',
      phone: business?.phone || '',
      email: business?.email || '',
      address: business?.address || '',
      city: business?.city || '',
      state: business?.state || '',
      country: business?.country || '',
      postal_code: business?.postal_code || '',
      facebook: business?.facebook || '',
      instagram: business?.instagram || '',
      twitter: business?.twitter || '',
      linkedin: business?.linkedin || '',
      image_1_url: business?.image_1_url || '',
      image_2_url: business?.image_2_url || '',
      image_3_url: business?.image_3_url || '',
    },
  });

  const watchedCountry = form.watch('country');
  const watchedCity = form.watch('city');

  const onSubmit = async (data: BusinessFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      if (business) {
        // Update existing business
        const { data: updatedBusiness, error } = await supabase
          .from('businesses')
          .update({
            ...data,
            business_hours: businessHours
          })
          .eq('id', business.id)
          .select()
          .single();

        if (error) throw error;

        onBusinessUpdated?.(updatedBusiness);
        toast({
          title: "Success",
          description: "Business profile updated successfully!",
        });
      } else {
        // Create new business
        const { data: newBusiness, error } = await supabase
          .from('businesses')
          .insert({
            user_id: user.id,
            business_name: data.business_name,
            business_type: data.business_type,
            description: data.description,
            website: data.website,
            phone: data.phone,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            postal_code: data.postal_code,
            facebook: data.facebook,
            instagram: data.instagram,
            twitter: data.twitter,
            linkedin: data.linkedin,
            business_hours: businessHours,
            image_1_url: data.image_1_url,
            image_2_url: data.image_2_url,
            image_3_url: data.image_3_url,
          })
          .select()
          .single();

        if (error) throw error;

        onBusinessCreated?.(newBusiness);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save business profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBusinessHours = (hours: Record<string, any>) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => {
      const dayHours = hours[day];
      if (dayHours?.closed) {
        return `${dayNames[index]}: Closed`;
      }
      return `${dayNames[index]}: ${dayHours?.open || '09:00'} - ${dayHours?.close || '17:00'}`;
    }).join('\n');
  };

  const handleImageUpload = async (file: File, imageNumber: string) => {
    if (!user) return;

    setUploadingImages(prev => ({ ...prev, [imageNumber]: true }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${imageNumber}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);

      form.setValue(`${imageNumber}_url` as keyof BusinessFormData, publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(prev => ({ ...prev, [imageNumber]: false }));
    }
  };

  const removeImage = async (imageNumber: string) => {
    const currentUrl = form.getValues(`${imageNumber}_url` as keyof BusinessFormData);
    if (currentUrl && typeof currentUrl === 'string') {
      try {
        const fileName = currentUrl.split('/').pop();
        if (fileName && fileName.includes(user?.id || '')) {
          await supabase.storage
            .from('business-images')
            .remove([`${user?.id}/${fileName}`]);
        }
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }
    
    form.setValue(`${imageNumber}_url` as keyof BusinessFormData, '');
  };

  const getCurrentFormValues = () => form.getValues();

  if (showPreview) {
    const formData = getCurrentFormValues();
    return (
      <div className="w-full mx-auto px-2 sm:px-4">
        <div className="bg-card border rounded-lg p-6 sm:p-8 lg:p-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Business Profile Preview</h2>
            <p className="text-muted-foreground">Review your business profile before publishing</p>
          </div>
          
          <div className="w-full space-y-8">
            {/* Business Header */}
            <div className="text-center pb-6 border-b border-dotted border-border">
              <div className="mb-1">
                <p className="text-sm font-medium text-black uppercase tracking-wide">Business Name</p>
                <h3 className="text-2xl sm:text-3xl font-bold">{formData.business_name || 'Business Name'}</h3>
              </div>
              <div>
                <p className="text-sm font-medium text-black uppercase tracking-wide">Business Type</p>
                <p className="text-lg sm:text-xl text-foreground">{formData.business_type || 'Business Type'}</p>
              </div>
            </div>
            
            {/* Business Images */}
            {(formData.image_1_url || formData.image_2_url || formData.image_3_url) && (
              <div className="space-y-4 pb-6 border-b border-dotted border-border">
                <p className="text-sm font-medium text-black uppercase tracking-wide">Business Photos</p>
                <div className="space-y-4">
                  {formData.image_1_url && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden">
                      <img src={formData.image_1_url} alt="Business photo 1" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {formData.image_2_url && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden">
                      <img src={formData.image_2_url} alt="Business photo 2" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {formData.image_3_url && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden">
                      <img src={formData.image_3_url} alt="Business photo 3" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* About Section */}
            {formData.description && (
              <div className="space-y-2 pb-6 border-b border-dotted border-border">
                <p className="text-sm font-medium text-black uppercase tracking-wide">About</p>
                <p className="text-foreground leading-relaxed">{formData.description}</p>
              </div>
            )}
            
            {/* Contact Information */}
            <div className="space-y-4 pb-6 border-b border-dotted border-border">
              <p className="text-sm font-medium text-black uppercase tracking-wide">Contact Information</p>
              <div className="space-y-3">
                {formData.email && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="text-foreground">{formData.email}</p>
                  </div>
                )}
                {formData.phone && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                    <p className="text-foreground">{formData.phone}</p>
                  </div>
                )}
                {formData.website && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Website</p>
                    <p className="text-primary break-all">{formData.website}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Location */}
            <div className="space-y-2 pb-6 border-b border-dotted border-border">
              <p className="text-sm font-medium text-black uppercase tracking-wide">Location</p>
              <div className="text-foreground space-y-1">
                {formData.address && <p>{formData.address}</p>}
                <p>{formData.city}{formData.state && `, ${formData.state}`}</p>
                <p>{formData.country} {formData.postal_code}</p>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="space-y-2 pb-6 border-b border-dotted border-border">
              <p className="text-sm font-medium text-black uppercase tracking-wide">Business Hours</p>
              <div className="text-sm text-foreground whitespace-pre-wrap font-sans">
                {formatBusinessHours(businessHours)}
              </div>
            </div>
            
            {/* Social Media */}
            {(formData.facebook || formData.instagram || formData.twitter || formData.linkedin) && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-black uppercase tracking-wide">Social Media</p>
                <div className="space-y-3">
                  {formData.facebook && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Facebook</p>
                      <p className="text-primary break-all">{formData.facebook}</p>
                    </div>
                  )}
                  {formData.instagram && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Instagram</p>
                      <p className="text-primary break-all">{formData.instagram}</p>
                    </div>
                  )}
                  {formData.twitter && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Twitter</p>
                      <p className="text-primary break-all">{formData.twitter}</p>
                    </div>
                  )}
                  {formData.linkedin && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">LinkedIn</p>
                      <p className="text-primary break-all">{formData.linkedin}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="pt-8 border-t mt-8">
            <div className="flex flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
                className="w-auto px-6"
              >
                Edit Profile
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                disabled={loading} 
                className="w-auto px-8 py-2 h-9"
                size="default"
              >
                {loading ? "Saving..." : business ? "Update Profile" : "Create Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input {...field} className="w-full" />
              </FormControl>
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="w-full min-w-[200px]">
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} className="w-full" />
              </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
              <FormControl>
                <Input type="url" {...field} className="w-full" />
              </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} className="w-full" />
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
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Clear city when country changes
                    form.setValue('city', '');
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Set state automatically when city is selected
                    if (statesByCity[value]) {
                      form.setValue('state', statesByCity[value]);
                    }
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={watchedCountry ? "Select city" : "Select country first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {watchedCountry && citiesByCountry[watchedCountry] ? 
                      citiesByCountry[watchedCountry].map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      )) : null
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code / Zip Code</FormLabel>
                <FormControl>
                  <Input {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={4}
                  maxLength={180}
                  placeholder="Describe your business, services, and what makes you unique... (max 180 characters)"
                  className="w-full"
                />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0}/180 characters
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Media</h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://facebook.com/yourpage"
                      className="w-full"
                    />
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
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://instagram.com/youraccount"
                      className="w-full"
                    />
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
                  <FormLabel>Twitter/X</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://twitter.com/youraccount"
                      className="w-full"
                    />
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
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <BusinessHours
          control={form.control}
          businessHours={businessHours}
          onBusinessHoursChange={setBusinessHours}
        />

        {/* Business Images Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Photos</h3>
          <p className="text-sm text-muted-foreground">
            Upload up to 3 photos of your business. Supported formats: JPG, PNG, WebP (max 5MB each)
          </p>
          <div className="space-y-4">
            {[1, 2, 3].map((num) => {
              const imageKey = `image_${num}`;
              const currentImage = form.watch(`${imageKey}_url` as keyof BusinessFormData);
              const isUploading = uploadingImages[imageKey];
              
              return (
                <div key={num} className="space-y-2">
                  <FormField
                    control={form.control}
                    name={`${imageKey}_url` as keyof BusinessFormData}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo {num}</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {currentImage && typeof currentImage === 'string' && currentImage ? (
                              <div className="relative">
                                <img 
                                  src={currentImage} 
                                  alt={`Business photo ${num}`}
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => removeImage(imageKey)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 5 * 1024 * 1024) {
                                        toast({
                                          title: "Error",
                                          description: "File size must be less than 5MB",
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                      handleImageUpload(file, imageKey);
                                    }
                                  }}
                                  className="w-full"
                                  disabled={isUploading}
                                />
                                {isUploading && (
                                  <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                                )}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowPreview(true)}
            className="flex-1"
          >
            Preview Profile
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 px-8 py-2 h-9" size="default">
            {loading ? "Saving..." : business ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
};