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
}

interface SearchParams {
  country: string;
  city: string;
  cuisine: string;
  resultCount: number;
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

    return businessNames.slice(0, params.resultCount).map((name, index) => ({
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
      
      // First try to get real businesses from Supabase
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('business_type', params.cuisine)
        .eq('city', params.city)
        .eq('country', params.country)
        .eq('status', 'active')
        .limit(params.resultCount);

      const { data: realBusinesses, error } = await query;

      if (error) {
        console.error('Database query error:', error);
      }

      let businesses: Business[] = [];

      if (realBusinesses && realBusinesses.length > 0) {
        console.log('✅ Found real businesses:', realBusinesses.length);
        // Transform business data to Business format
        businesses = realBusinesses.map((business) => ({
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
          source: 'Business Directory'
        }));
      }

      // If no real businesses found or we need more to reach the target count, 
      // supplement with mock data
      if (businesses.length < params.resultCount) {
        const remainingCount = params.resultCount - businesses.length;
        const mockBusinesses = generateMockBusinesses(params).slice(0, remainingCount);
        businesses = [...businesses, ...mockBusinesses];
      }

      console.log('📋 Final businesses array:', businesses);
      setBusinesses(businesses);
      setShowResults(true);
      console.log('🎯 Set showResults to true, businesses length:', businesses.length);

      const realCount = realBusinesses?.length || 0;
      toast({
        title: "Search Complete!",
        description: realCount > 0 
          ? `Found ${realCount} real businesses${businesses.length > realCount ? ` and ${businesses.length - realCount} additional suggestions` : ''} in ${params.city}, ${params.country}` 
          : `Found ${businesses.length} suggestions in ${params.city}, ${params.country}`,
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
    link.setAttribute('download', `${searchParams.cuisine}_${searchParams.city}_${searchParams.country}.csv`);
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
          {/* Header Section */}
          <div className="flex-shrink-0 flex flex-col justify-center items-center text-center px-4 py-8 mt-16">
            <h1 className="text-white font-bold text-2xl leading-tight mb-2">
              {t('main_heading')}
            </h1>
            <p className="text-white text-base mb-1">
              Made for seniors by seniors
            </p>
            <p className="text-white text-sm mb-4">
              Discover the perfect dining experience in your chosen destination
            </p>
            <div className="flex justify-center">
              <Link 
                to="/how-to" 
                className="border border-white/80 hover:border-white w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/10 rounded-none"
              >
                <span className="text-white font-bold text-lg">?</span>
              </Link>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 flex items-center justify-center px-4 pb-8">
            <SinglePageRestaurantForm
              onSearch={handleSearch}
              onReset={handleReset}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Results Section */}
        {showResults && businesses.length > 0 && (
          <div className="relative z-50 bg-white min-h-screen w-full md:absolute md:top-0 md:left-0 md:right-0 md:overflow-y-auto">
            {/* Navigation header with logo and action buttons */}
            <div className="sticky top-0 bg-white z-50 px-4 py-4 border-b border-dotted border-gray-400">
              {/* Mobile layout */}
              <div className="flex items-center justify-between md:hidden">
                {/* Logo for mobile */}
                <span className="font-bold text-black text-sm">seniortravel.agency</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={exportToCSV}
                    variant="outline" 
                    size="sm"
                    className="h-12 w-12 rounded-none border-black"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleReset}
                    variant="outline" 
                    size="sm"
                    className="h-12 w-12 rounded-none border-black"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-12 w-12 rounded-none border-black"
                        size="sm"
                      >
                        <Menu className="h-5 w-5 text-black" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[85vw] sm:w-80 max-w-sm">
                      <div className="flex flex-col gap-3 pt-6 h-full">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-12 text-left" 
                          onClick={() => window.location.href = '/'}
                        >
                          <Home className="h-5 w-5 mr-3" />
                          <span className="text-base">Home</span>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/about-us">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">About Us</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/how-to">
                            <HelpCircle className="h-5 w-5 mr-3" />
                            <span className="text-base">How To</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/advertise">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">Advertise</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/toolbox">
                            <Info className="h-5 w-5 mr-3" />
                            <span className="text-base">Toolbox</span>
                          </a>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <a href="/business-centre">
                            <Users className="h-5 w-5 mr-3" />
                            <span className="text-base">Business Centre</span>
                          </a>
                        </Button>
                        <div className="flex-1"></div>
                        <div className="border-t pt-3">
                          <p className="text-sm text-gray-600 text-center">
                            Made for seniors by seniors
                          </p>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:flex items-center justify-between">
                {/* Logo and branding for desktop */}
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-black text-lg">seniortravel.agency</span>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <span className="text-gray-600 text-sm">Made for seniors by seniors</span>
                </div>
                
                {/* Action buttons for desktop */}
                <div className="flex gap-3">
                  <Button 
                    onClick={exportToCSV}
                    variant="outline" 
                    className="h-10 px-4 rounded-none border-black"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={handleReset}
                    variant="outline" 
                    className="h-10 px-4 rounded-none border-black"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Search
                  </Button>
                </div>
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
                  source: business.source
                }))} 
                selectedCity={searchParams?.city || ''} 
                selectedCountry={searchParams?.country || ''} 
                selectedCategory={searchParams?.cuisine}
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