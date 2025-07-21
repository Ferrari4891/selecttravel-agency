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

const businessSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_type: z.string().min(1, 'Business type is required'),
  description: z.string().optional(),
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
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface BusinessProfileProps {
  business?: any;
  onBusinessCreated?: (business: any) => void;
  onBusinessUpdated?: (business: any) => void;
}

const businessTypes = [
  'Restaurant', 'Retail', 'Service', 'Technology', 'Healthcare', 
  'Finance', 'Education', 'Manufacturing', 'Real Estate', 'Other'
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
  const { toast } = useToast();
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
          .update(data)
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                  <Input type="email" {...field} />
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
                  <Input {...field} />
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
                  <Input type="url" {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  placeholder="Describe your business, services, and what makes you unique..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : business ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
};