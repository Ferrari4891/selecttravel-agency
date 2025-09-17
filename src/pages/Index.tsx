import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { RestaurantResults } from '@/components/RestaurantResults';
import { Download, RotateCcw, Menu, Home, Info, HelpCircle, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SaveBusinessButton from '@/components/SaveBusinessButton';
import { SinglePageRestaurantForm } from '@/components/SinglePageRestaurantForm';

import { supabase } from '@/integrations/supabase/client';

// Import hero images
import heroEat from '@/assets/hero-eat.jpg';
import heroDrink from '@/assets/hero-drink.jpg';
import heroStay from '@/assets/hero-stay.jpg';
import heroPlay from '@/assets/hero-play.jpg';
import heroBackground from '@/assets/hero-background.jpg';

interface Business {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  website: string;
  mapLink: string;
  menuLink: string;
  googleMapRef?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  image: string;
  imageLinks?: string;
  source: string;
  subscriptionTier?: string;
}

interface SearchParams {
  country: string;
  city: string;
  category: string;
  subcategory: string;
  type: string;
  resultCount: number | string;
}

const Index: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const generateMockBusinesses = (params: SearchParams): Business[] => {
    const businessNames = [
      'The Golden Fork', 'Urban Bistro', 'Sunset Café', 'Mountain View Restaurant',
      'Coastal Grill', 'The Local Pub', 'Heritage Hotel', 'Modern Suites',
      'Adventure Sports Center', 'Entertainment Complex', 'Wine Bar & Lounge',
      'Family Restaurant', 'Boutique Inn', 'Gaming Center', 'Coffee Roasters',
      'Fine Dining House', 'Beach Resort', 'Sports Bar', 'Luxury Lodge',
      'Activity Center', 'Central Plaza', 'Metro Grill', 'Riverside Cafe',
      'Downtown Lounge', 'Grand Hotel', 'City Center', 'Royal Restaurant',
      'Elite Bistro', 'Premium Venue', 'Classic Eatery', 'Modern Bar',
      'Urban Lodge', 'Sunset Restaurant', 'Golden Cafe', 'Prime Location',
      'Central Hub', 'Main Street Grill', 'Plaza Hotel', 'Metro Bar',
      'Downtown Restaurant', 'City Cafe', 'Grand Lounge', 'Elite Hotel',
      'Premium Restaurant', 'Classic Bar', 'Modern Hotel', 'Urban Cafe',
      'Riverside Restaurant', 'Central Lounge', 'Metro Hotel', 'Plaza Bar'
    ];

    const restaurantImages = [
      '/lovable-uploads/84845629-2fe8-43b5-8500-84324fdcb0ec.png',
      '/lovable-uploads/c15f396d-92ad-4582-a3f5-25d92bfbd8dd.png',
      '/lovable-uploads/fb361fa1-a99f-4c63-aa4b-68502ea4bb3e.png',
      '/lovable-uploads/6eeb2749-5d4b-4b88-9d7f-53654734a0d6.png'
    ];

    const count = typeof params.resultCount === 'string' ? parseInt(params.resultCount) : params.resultCount;
    return businessNames.slice(0, count).map((name, index) => ({
      name,
      address: `${100 + index} Main Street, ${params.city}, ${params.country}`,
      rating: parseFloat((3.0 + Math.random() * 2).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 500) + 50,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
      mapLink: `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + params.city)}`,
      menuLink: `https://menu.${name.toLowerCase().replace(/\s+/g, '')}.com`,
      facebook: Math.random() > 0.5 ? `https://facebook.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      instagram: Math.random() > 0.5 ? `https://instagram.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      twitter: Math.random() > 0.5 ? `https://twitter.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      image: restaurantImages[Math.floor(Math.random() * restaurantImages.length)],
      source: 'SmartGuides Database'
    }));
  };

  const handleSearch = async (params: SearchParams) => {
    console.log('🚀 handleSearch called with:', params);
    
    setIsLoading(true);
    setSearchParams(params);
    
    try {
      console.log('⏱️ Starting search for real businesses...');
      
      // Normalize city (handles diacritics like "Đà Nẵng") and decide query city
      const normalize = (s: string) => s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[\s-]/g, '');
      const normalizedCity = normalize(params.city);
      const isDanang = normalizedCity.includes('danang');
      const queryCity = isDanang ? 'Danang' : params.city;
      
      // First try to get real businesses from Supabase
      // Search both business_type and business_categories for multi-category support
      let query = supabase
        .from('businesses')
        .select('*')
        .or(`business_type.eq.${params.type},business_categories.cs.{${params.type}}`)
        .eq('city', queryCity)
        .eq('country', params.country)
        .eq('status', 'active')
        .order('subscription_tier', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      const { data: realBusinesses, error } = await query;

      if (error) {
        console.error('Database query error:', error);
      }

      let businesses: Business[] = [];

      if (realBusinesses && realBusinesses.length > 0) {
        console.log('✅ Found real businesses:', realBusinesses.length);
        // Transform business data to Business format with subscription ordering
        const getSubscriptionPriority = (tier: string | null) => {
          switch (tier) {
            case 'firstclass': return 4;
            case 'premium': return 3;
            case 'basic': return 2;
            default: return 1; // trial or null
          }
        };

        businesses = realBusinesses
          .sort((a, b) => {
            const priorityA = getSubscriptionPriority(a.subscription_tier);
            const priorityB = getSubscriptionPriority(b.subscription_tier);
            return priorityB - priorityA;
          })
          .map((business) => ({
            name: business.business_name,
            address: business.address || `${business.city}, ${business.country}`,
            rating: 4.0 + Math.random() * 1.0,
            reviewCount: Math.floor(Math.random() * 500) + 50,
            phone: business.phone || `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            email: business.email || `info@${business.business_name.toLowerCase().replace(/\s+/g, '')}.com`,
            website: business.website || `https://www.${business.business_name.toLowerCase().replace(/\s+/g, '')}.com`,
            mapLink: business.address 
              ? `https://maps.google.com/?q=${encodeURIComponent(business.address)}`
              : `https://maps.google.com/?q=${encodeURIComponent(`${business.city}, ${business.country}`)}`,
            menuLink: business.website || `https://menu.${business.business_name.toLowerCase().replace(/\s+/g, '')}.com`,
            facebook: business.facebook,
            instagram: business.instagram,
            twitter: business.twitter,
            image: business.image_1_url || '/lovable-uploads/84845629-2fe8-43b5-8500-84324fdcb0ec.png',
            source: 'Business Directory',
            subscriptionTier: business.subscription_tier
          }));
      }

      let finalBusinesses = businesses;

      // Handle result count logic
      if (params.resultCount !== 'all') {
        const requestedCount = parseInt(params.resultCount as string);
        
        if (businesses.length < requestedCount) {
          // Generate mock businesses to supplement if needed (except for Danang test market)
          const isDanangTestMarket = isDanang;
          
          if (!isDanangTestMarket) {
            const mockBusinessesToGenerate = requestedCount - businesses.length;
            const mockBusinesses = generateMockBusinesses(params).slice(0, mockBusinessesToGenerate);
            finalBusinesses = [...businesses, ...mockBusinesses];
          }
        } else {
          // Limit to requested count
          finalBusinesses = businesses.slice(0, requestedCount);
        }
      }
      // For 'all', show all available businesses

      console.log('📋 Final businesses array:', finalBusinesses);
      setBusinesses(finalBusinesses);
      setShowResults(true);
      console.log('🎯 Set showResults to true, businesses length:', finalBusinesses.length);

      const realCount = realBusinesses?.length || 0;
      const resultText = params.resultCount === 'all' 
        ? `all ${finalBusinesses.length}` 
        : `${finalBusinesses.length}`;
      
      toast({
        title: "Search Complete!",
        description: realCount > 0 
          ? `Found ${resultText} businesses in ${params.city}, ${params.country}` 
          : `Found ${resultText} suggestions in ${params.city}, ${params.country}`,
      });
    } catch (error) {
      console.error('Error during search:', error);
      toast({
        title: "Search Error",
        description: "There was an error searching for businesses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 handleSearch finished');
    }
  };

  const handleReset = () => {
    setBusinesses([]);
    setShowResults(false);
    setSearchParams(null);
  };

  const exportToCSV = () => {
    if (!searchParams) return;
    
    const headers = ['Name', 'Address', 'Rating', 'Reviews', 'Phone', 'Email', 'Website', 'Maps Link', 'Facebook', 'Instagram', 'Twitter'];
    const csvContent = [
      headers.join(','),
      ...businesses.map(business => [
        `"${business.name}"`,
        `"${business.address}"`,
        business.rating,
        business.reviewCount,
        `"${business.phone}"`,
        `"${business.email}"`,
        `"${business.website}"`,
        `"${business.mapLink}"`,
        `"${business.facebook || ''}"`,
        `"${business.instagram || ''}"`,
        `"${business.twitter || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${searchParams.type}_${searchParams.city}_${searchParams.country}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded successfully.",
    });
  };

  // Get background image
  const getBackgroundImage = () => {
    return heroBackground;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Single page layout */}
      <div className="relative min-h-screen">
        {/* Hero background image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${getBackgroundImage()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Navigation */}
        <div className="relative z-50">
          <Navigation />
        </div>
        
        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Form Section */}
          <div className="flex-1 flex items-center justify-center px-4 pt-4 pb-8">
            <SinglePageRestaurantForm
              onSearch={handleSearch}
              onReset={handleReset}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Results Section */}
        {showResults && businesses.length > 0 && (
          <div className="absolute z-50 bg-white min-h-screen w-full top-0 left-0 right-0 overflow-y-auto">
            {/* Navigation header with logo and action buttons */}
            <div className="sticky top-0 bg-white z-50 px-4 py-4 border-b border-dotted border-gray-400">
              {/* Mobile layout */}
              <div className="flex items-center justify-between md:hidden">
                {/* Logo and text for mobile */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12">
                    <img src="/lovable-uploads/6ce4c283-5ad7-4b59-a3a8-4254d29cd162.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-black text-sm">YOUR RESTAURANT RESULTS!</span>
                </div>
                {/* Home button for mobile */}
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline" 
                  size="sm"
                  className="h-12 w-12 rounded-none border-black bg-black hover:bg-black/80"
                >
                  <Home className="h-10 w-10 text-white" />
                </Button>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:flex items-center justify-between">
                {/* Logo and text for desktop */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12">
                    <img src="/lovable-uploads/6ce4c283-5ad7-4b59-a3a8-4254d29cd162.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-black text-lg">YOUR RESTAURANT RESULTS!</span>
                </div>
                
                {/* Home button for desktop */}
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline" 
                  className="h-12 w-12 rounded-none border-black bg-black hover:bg-black/80"
                >
                  <Home className="h-10 w-10 text-white" />
                </Button>
              </div>
            </div>

            {/* Results content */}
            <div className="p-4">
              <RestaurantResults 
                restaurants={businesses.map(business => ({
                  name: business.name,
                  address: business.address,
                  googleMapRef: business.mapLink,
                  socialMediaLinks: {
                    facebook: business.facebook,
                    instagram: business.instagram,
                    twitter: business.twitter,
                  },
                  contactDetails: {
                    phone: business.phone,
                    email: business.email,
                    website: business.website,
                    menuLink: business.menuLink,
                  },
                  imageLinks: [business.image],
                  rating: business.rating,
                  reviewCount: business.reviewCount,
                  source: business.source,
                  subscriptionTier: business.subscriptionTier
                }))} 
                selectedCity={searchParams?.city || ''} 
                selectedCountry={searchParams?.country || ''} 
                selectedCategory={searchParams?.type}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Footer - only visible when not showing results */}
      {!showResults && <Footer />}
    </div>
  );
};

export default Index;