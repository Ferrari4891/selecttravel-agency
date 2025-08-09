import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { BusinessHours } from './BusinessHours';
import { useAmenityOptions } from '@/hooks/useAmenityOptions';
import { GoogleMap } from '@/components/GoogleMap';

const businessSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_type: z.string().min(1, 'Business type is required'),
  description: z.string().max(180, 'Description must be 180 characters or less').optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  country_code: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  custom_city: z.string().optional(),
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
  // Business amenities matching member preferences
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

interface BusinessProfileProps {
  business?: any;
  onBusinessCreated?: (business: any) => void;
  onBusinessUpdated?: (business: any) => void;
}

const businessTypes = [
  'Japanese', 'Korean', 'French', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Thai'
];

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland',
  'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary',
  'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'New Zealand',
  'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru',
  'India', 'China', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines',
  'Vietnam', 'South Africa', 'Egypt', 'Israel', 'UAE', 'Saudi Arabia', 'Turkey'
];

const countryPhoneCodes = [
  { country: 'United States', code: '+1' },
  { country: 'Canada', code: '+1' },
  { country: 'United Kingdom', code: '+44' },
  { country: 'Australia', code: '+61' },
  { country: 'Germany', code: '+49' },
  { country: 'France', code: '+33' },
  { country: 'Italy', code: '+39' },
  { country: 'Spain', code: '+34' },
  { country: 'Netherlands', code: '+31' },
  { country: 'Belgium', code: '+32' },
  { country: 'Switzerland', code: '+41' },
  { country: 'Austria', code: '+43' },
  { country: 'Sweden', code: '+46' },
  { country: 'Norway', code: '+47' },
  { country: 'Denmark', code: '+45' },
  { country: 'Finland', code: '+358' },
  { country: 'Ireland', code: '+353' },
  { country: 'Portugal', code: '+351' },
  { country: 'Greece', code: '+30' },
  { country: 'Poland', code: '+48' },
  { country: 'Czech Republic', code: '+420' },
  { country: 'Hungary', code: '+36' },
  { country: 'Japan', code: '+81' },
  { country: 'South Korea', code: '+82' },
  { country: 'Singapore', code: '+65' },
  { country: 'Hong Kong', code: '+852' },
  { country: 'New Zealand', code: '+64' },
  { country: 'Brazil', code: '+55' },
  { country: 'Mexico', code: '+52' },
  { country: 'Argentina', code: '+54' },
  { country: 'Chile', code: '+56' },
  { country: 'Colombia', code: '+57' },
  { country: 'Peru', code: '+51' },
  { country: 'India', code: '+91' },
  { country: 'China', code: '+86' },
  { country: 'Thailand', code: '+66' },
  { country: 'Malaysia', code: '+60' },
  { country: 'Indonesia', code: '+62' },
  { country: 'Philippines', code: '+63' },
  { country: 'Vietnam', code: '+84' },
  { country: 'South Africa', code: '+27' },
  { country: 'Egypt', code: '+20' },
  { country: 'Israel', code: '+972' },
  { country: 'UAE', code: '+971' },
  { country: 'Saudi Arabia', code: '+966' },
  { country: 'Turkey', code: '+90' },
  { country: 'Russia', code: '+7' },
  { country: 'Ukraine', code: '+380' },
  { country: 'Romania', code: '+40' },
  { country: 'Bulgaria', code: '+359' },
  { country: 'Croatia', code: '+385' },
  { country: 'Serbia', code: '+381' },
  { country: 'Slovenia', code: '+386' },
  { country: 'Slovakia', code: '+421' },
  { country: 'Lithuania', code: '+370' },
  { country: 'Latvia', code: '+371' },
  { country: 'Estonia', code: '+372' },
  { country: 'Luxembourg', code: '+352' },
  { country: 'Iceland', code: '+354' },
  { country: 'Malta', code: '+356' },
  { country: 'Cyprus', code: '+357' },
  { country: 'Morocco', code: '+212' },
  { country: 'Tunisia', code: '+216' },
  { country: 'Algeria', code: '+213' },
  { country: 'Libya', code: '+218' },
  { country: 'Sudan', code: '+249' },
  { country: 'Ethiopia', code: '+251' },
  { country: 'Kenya', code: '+254' },
  { country: 'Tanzania', code: '+255' },
  { country: 'Uganda', code: '+256' },
  { country: 'Rwanda', code: '+250' },
  { country: 'Ghana', code: '+233' },
  { country: 'Nigeria', code: '+234' },
  { country: 'Ivory Coast', code: '+225' },
  { country: 'Senegal', code: '+221' },
  { country: 'Mali', code: '+223' },
  { country: 'Burkina Faso', code: '+226' },
  { country: 'Niger', code: '+227' },
  { country: 'Chad', code: '+235' },
  { country: 'Cameroon', code: '+237' },
  { country: 'Central African Republic', code: '+236' },
  { country: 'Gabon', code: '+241' },
  { country: 'Republic of the Congo', code: '+242' },
  { country: 'Democratic Republic of the Congo', code: '+243' },
  { country: 'Angola', code: '+244' },
  { country: 'Zambia', code: '+260' },
  { country: 'Zimbabwe', code: '+263' },
  { country: 'Botswana', code: '+267' },
  { country: 'Namibia', code: '+264' },
  { country: 'Lesotho', code: '+266' },
  { country: 'Swaziland', code: '+268' },
  { country: 'Mozambique', code: '+258' },
  { country: 'Madagascar', code: '+261' },
  { country: 'Mauritius', code: '+230' },
  { country: 'Seychelles', code: '+248' },
  { country: 'Comoros', code: '+269' },
  { country: 'Mayotte', code: '+262' },
  { country: 'Reunion', code: '+262' },
  { country: 'Lebanon', code: '+961' },
  { country: 'Syria', code: '+963' },
  { country: 'Jordan', code: '+962' },
  { country: 'Iraq', code: '+964' },
  { country: 'Iran', code: '+98' },
  { country: 'Afghanistan', code: '+93' },
  { country: 'Pakistan', code: '+92' },
  { country: 'Bangladesh', code: '+880' },
  { country: 'Sri Lanka', code: '+94' },
  { country: 'Maldives', code: '+960' },
  { country: 'Nepal', code: '+977' },
  { country: 'Bhutan', code: '+975' },
  { country: 'Myanmar', code: '+95' },
  { country: 'Laos', code: '+856' },
  { country: 'Cambodia', code: '+855' },
  { country: 'Brunei', code: '+673' },
  { country: 'East Timor', code: '+670' },
  { country: 'Papua New Guinea', code: '+675' },
  { country: 'Fiji', code: '+679' },
  { country: 'Vanuatu', code: '+678' },
  { country: 'Solomon Islands', code: '+677' },
  { country: 'Tonga', code: '+676' },
  { country: 'Samoa', code: '+685' },
  { country: 'Kiribati', code: '+686' },
  { country: 'Tuvalu', code: '+688' },
  { country: 'Nauru', code: '+674' },
  { country: 'Palau', code: '+680' },
  { country: 'Marshall Islands', code: '+692' },
  { country: 'Micronesia', code: '+691' },
  { country: 'Guam', code: '+1' },
  { country: 'Northern Mariana Islands', code: '+1' },
  { country: 'American Samoa', code: '+1' },
  { country: 'Puerto Rico', code: '+1' },
  { country: 'US Virgin Islands', code: '+1' },
  { country: 'Dominican Republic', code: '+1' },
  { country: 'Jamaica', code: '+1' },
  { country: 'Trinidad and Tobago', code: '+1' },
  { country: 'Barbados', code: '+1' },
  { country: 'Bahamas', code: '+1' },
  { country: 'Bermuda', code: '+1' },
  { country: 'Grenada', code: '+1' },
  { country: 'Saint Lucia', code: '+1' },
  { country: 'Saint Vincent and the Grenadines', code: '+1' },
  { country: 'Antigua and Barbuda', code: '+1' },
  { country: 'Saint Kitts and Nevis', code: '+1' },
  { country: 'Dominica', code: '+1' },
  { country: 'Cuba', code: '+53' },
  { country: 'Haiti', code: '+509' },
  { country: 'Greenland', code: '+299' },
  { country: 'Faroe Islands', code: '+298' },
  { country: 'Gibraltar', code: '+350' },
  { country: 'Monaco', code: '+377' },
  { country: 'San Marino', code: '+378' },
  { country: 'Vatican City', code: '+379' },
  { country: 'Andorra', code: '+376' },
  { country: 'Liechtenstein', code: '+423' },
  { country: 'Uruguay', code: '+598' },
  { country: 'Paraguay', code: '+595' },
  { country: 'Bolivia', code: '+591' },
  { country: 'Ecuador', code: '+593' },
  { country: 'Venezuela', code: '+58' },
  { country: 'Guyana', code: '+592' },
  { country: 'Suriname', code: '+597' },
  { country: 'French Guiana', code: '+594' },
  { country: 'Falkland Islands', code: '+500' },
  { country: 'South Georgia', code: '+500' },
  { country: 'Saint Helena', code: '+290' },
  { country: 'Ascension Island', code: '+247' },
  { country: 'Tristan da Cunha', code: '+290' }
];

const statesByCountry: Record<string, string[]> = {
  'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
  'Australia': ['Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'],
  'Germany': ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia']
};

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
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang', 'Yongin', 'Seongnam', 'Bucheon', 'Ansan', 'Jeonju', 'Anyang', 'Cheongju', 'Cheonan', 'Namyangju', 'Hwaseong', 'Pohang', 'Uijeongbu', 'Siheung', 'Gimhae', 'Pyeongtaek', 'Gunpo', 'Jinju', 'Osan', 'Iksan', 'Yangsan'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Danang', 'Can Tho', 'Bien Hoa', 'Hue', 'Nha Trang', 'Buon Ma Thuot', 'Vung Tau', 'Nam Dinh']
};

const statesByCityLegacy: Record<string, string> = {
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
  const [showCustomCity, setShowCustomCity] = useState(false);
  const { toast } = useToast();
  const { amenityOptions, isLoading: amenityLoading } = useAmenityOptions();
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
      country_code: business?.country_code || '+1',
      email: business?.email || '',
      address: business?.address || '',
      city: business?.city || '',
      custom_city: business?.custom_city || '',
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
      // Business amenities
      wheelchair_access: business?.wheelchair_access || false,
      extended_hours: business?.extended_hours || false,
      gluten_free: business?.gluten_free || false,
      low_noise: business?.low_noise || false,
      public_transport: business?.public_transport || false,
      pet_friendly: business?.pet_friendly || false,
      outdoor_seating: business?.outdoor_seating || false,
      senior_discounts: business?.senior_discounts || false,
      online_booking: business?.online_booking || false,
      air_conditioned: business?.air_conditioned || false,
    },
  });

  const watchedCountry = form.watch('country');
  const watchedCity = form.watch('city');
  const watchedState = form.watch('state');

  const onSubmit = async (data: BusinessFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      if (business) {
        // Update existing business
        const { data: updatedBusiness, error } = await supabase
          .from('businesses')
          .update({
            business_name: data.business_name,
            business_type: data.business_type,
            description: data.description,
            website: data.website,
            phone: data.phone,
            country_code: data.country_code,
            email: data.email,
            address: data.address,
            city: data.custom_city || data.city,
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
            // Business amenities
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
            country_code: data.country_code,
            email: data.email,
            address: data.address,
            city: data.custom_city || data.city,
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
            // Business amenities
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
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const dayHours = hours[day];
      if (dayHours?.closed) {
        return `${dayNames[index]}: Closed`;
      }
      return `${dayNames[index]}: ${dayHours?.open || '9:00 AM'} - ${dayHours?.close || '5:00 PM'}`;
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
      <div className="w-full max-w-none mx-auto px-2 sm:px-4">
        <div className="bg-card border rounded-lg p-6 sm:p-8 lg:p-16 max-w-none">
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

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone Number</label>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="+1" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryPhoneCodes.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder="Phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
                    // Clear city and state when country changes
                    form.setValue('city', '');
                    form.setValue('state', '');
                    form.setValue('custom_city', '');
                    setShowCustomCity(false);
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

          {watchedCountry && statesByCountry[watchedCountry] && (
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Clear city when state changes
                      form.setValue('city', '');
                      form.setValue('custom_city', '');
                      setShowCustomCity(false);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state/province" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statesByCountry[watchedCountry].map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
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
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('custom_city', '');
                    setShowCustomCity(false);
                    // Set state automatically when city is selected from legacy mapping
                    if (statesByCityLegacy[value]) {
                      form.setValue('state', statesByCityLegacy[value]);
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

          {watchedCountry && (
            <div className="space-y-2">
              {!showCustomCity ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomCity(true)}
                  className="w-full"
                >
                  City not listed? Add custom city
                </Button>
              ) : (
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="custom_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom City</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your city name"
                            onChange={(e) => {
                              field.onChange(e);
                              form.setValue('city', '');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomCity(false);
                      form.setValue('custom_city', '');
                    }}
                    className="w-full"
                  >
                    Use city dropdown instead
                  </Button>
                </div>
              )}
            </div>
          )}

          {!statesByCountry[watchedCountry] && (
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter state/province" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code / Zip Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter postal/zip code" />
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

        {/* Business Features & Amenities Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Features & Amenities</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select the features and amenities your business offers. This helps members find businesses that match their preferences.
            </p>
          </div>
          
          <div className="space-y-4">
            {amenityLoading ? (
              <div className="text-center text-muted-foreground">Loading amenity options...</div>
            ) : (
              amenityOptions.map((amenity) => (
                <FormField
                  key={amenity.option_key}
                  control={form.control}
                  name={amenity.option_key as keyof BusinessFormData}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          {amenity.display_name}
                        </FormLabel>
                        {amenity.description && (
                          <p className="text-xs text-muted-foreground">
                            {amenity.description}
                          </p>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              ))
            )}
          </div>
        </div>

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

        {/* Location Preview */}
        {(form.watch('address') || form.watch('city')) && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Location Preview</h3>
            <GoogleMap
              address={form.watch('address')}
              city={form.watch('city')}
              country={form.watch('country')}
              height="200px"
              className="w-full"
            />
          </div>
        )}

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