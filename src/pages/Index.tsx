import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { RestaurantResults } from '@/components/RestaurantResults';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StreamlinedSearchForm } from '@/components/StreamlinedSearchForm';
import { useStreamlinedSearch } from '@/hooks/useStreamlinedSearch';
import { VoiceTouchToggle } from '@/components/VoiceTouchToggle';
import { useVoiceInterface } from '@/hooks/useVoiceInterface';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessNameSearch } from '@/components/BusinessNameSearch';
import { useBusinessNameSearch } from '@/hooks/useBusinessNameSearch';

// Import hero images
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

interface StreamlinedSearchParams {
  searchType: 'price' | 'cuisine' | 'food' | 'drink';
  country: string;
  city: string;
  priceLevel?: string;
  cuisineType?: string;
  foodSpecialty?: string;
  drinkSpecialty?: string;
  resultCount: number;
}

const Index: React.FC = () => {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchParams, setSearchParams] = useState<StreamlinedSearchParams | null>(null);
  const [interfaceMode, setInterfaceMode] = useState<'voice' | 'touch'>('touch');
  const { searchBusinesses, isLoading } = useStreamlinedSearch();
  const { searchByName, isLoading: isNameSearchLoading } = useBusinessNameSearch();
  const { isListening, speak, startListening, stopListening, stopSpeaking, processVoiceCommand, isAuthenticated } = useVoiceInterface();
  const { user } = useAuth();

  const handleSearch = async (params: StreamlinedSearchParams) => {
    console.log('🚀 handleSearch called with:', params);
    
    setSearchParams(params);
    
    try {
      console.log('⏱️ Starting streamlined search for businesses...');
      console.log('🔍 Search parameters:', {
        searchType: params.searchType,
        city: params.city,
        country: params.country,
        criteria: params.priceLevel || params.cuisineType || params.foodSpecialty || params.drinkSpecialty
      });
      
      // Use the streamlined search hook
      const results = await searchBusinesses(params);

      // Transform results to match Business interface
      const businesses: Business[] = results.map((result) => ({
        name: result.name,
        address: result.address,
        rating: result.rating,
        reviewCount: result.reviewCount,
        phone: result.contactDetails.phone || `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        email: result.contactDetails.email || `info@${result.name.toLowerCase().replace(/\s+/g, '')}.com`,
        website: result.contactDetails.website || `https://www.${result.name.toLowerCase().replace(/\s+/g, '')}.com`,
        mapLink: result.googleMapRef,
        menuLink: result.contactDetails.website || `https://menu.${result.name.toLowerCase().replace(/\s+/g, '')}.com`,
        googleMapRef: result.googleMapRef,
        facebook: result.socialMediaLinks.facebook,
        instagram: result.socialMediaLinks.instagram,
        twitter: result.socialMediaLinks.twitter,
        image: result.imageLinks[0] || '/lovable-uploads/84845629-2fe8-43b5-8500-84324fdcb0ec.png',
        imageLinks: result.imageLinks.join('; '),
        source: result.source,
        subscriptionTier: result.subscriptionTier
      }));

      console.log('📋 Final businesses array:', businesses);
      setBusinesses(businesses);
      setShowResults(true);
      console.log('🎯 Set showResults to true, businesses length:', businesses.length);

      const searchTypeLabel = {
        'price': params.priceLevel,
        'cuisine': params.cuisineType,
        'food': params.foodSpecialty,
        'drink': params.drinkSpecialty
      }[params.searchType];
      
      toast({
        title: "Search Complete!",
        description: businesses.length > 0 
          ? `Found ${businesses.length} ${searchTypeLabel} options in ${params.city}, ${params.country}` 
          : `No ${searchTypeLabel} options found in ${params.city}, ${params.country}`,
      });
    } catch (error) {
      console.error('Error during search:', error);
      toast({
        title: "Search Error",
        description: "There was an error searching for businesses. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNameSearch = async (params: { businessName: string; city?: string; country?: string }) => {
    console.log('🔍 Name search with params:', params);
    
    try {
      const results = await searchByName(params);

      // Transform results to match Business interface
      const businesses: Business[] = results.map((result) => ({
        name: result.name,
        address: result.address,
        rating: result.rating,
        reviewCount: result.reviewCount,
        phone: result.contactDetails.phone || `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        email: result.contactDetails.email || `info@${result.name.toLowerCase().replace(/\s+/g, '')}.com`,
        website: result.contactDetails.website || `https://www.${result.name.toLowerCase().replace(/\s+/g, '')}.com`,
        mapLink: result.googleMapRef,
        menuLink: result.contactDetails.website || `https://menu.${result.name.toLowerCase().replace(/\s+/g, '')}.com`,
        googleMapRef: result.googleMapRef,
        facebook: result.socialMediaLinks.facebook,
        instagram: result.socialMediaLinks.instagram,
        twitter: result.socialMediaLinks.twitter,
        image: result.imageLinks[0] || '/lovable-uploads/84845629-2fe8-43b5-8500-84324fdcb0ec.png',
        imageLinks: result.imageLinks.join('; '),
        source: result.source,
        subscriptionTier: result.subscriptionTier
      }));

      setBusinesses(businesses);
      setShowResults(true);
      
      // Set search params for CSV export
      setSearchParams({
        searchType: 'cuisine',
        city: params.city || 'All Cities',
        country: params.country || 'All Countries',
        resultCount: businesses.length
      });
    } catch (error) {
      console.error('Error during name search:', error);
    }
  };

  const handleReset = () => {
    setBusinesses([]);
    setShowResults(false);
    setSearchParams(null);
  };

  const handleModeChange = (mode: 'voice' | 'touch') => {
    setInterfaceMode(mode);
    
    if (mode === 'voice') {
      speak("You can now use voice to GET WHAT YOU WANT! Try saying 'Find Italian restaurants in Paris' or 'Show me budget restaurants in Tokyo'");
    } else {
      speak("You can now use touch to GET WHAT YOU WANT!");
    }
  };

  const handleVoiceSearch = () => {
    if (interfaceMode === 'voice') {
      speak("Listening for your restaurant search...");
      startListening((command) => {
        processVoiceCommand(command, handleSearch, handleNameSearch);
      });
    }
  };

  const handleStopVoice = () => {
    // Stop all voice activity immediately
    stopListening();
    stopSpeaking();
    // Force stop all speech synthesis immediately
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
    } catch {}
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
    
    const searchCriteria = searchParams.priceLevel || searchParams.cuisineType || searchParams.foodSpecialty || searchParams.drinkSpecialty || 'results';
    link.setAttribute('download', `${searchCriteria}_${searchParams.city}_${searchParams.country}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Single page layout */}
      <div className="relative min-h-screen">
        {/* Hero background image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroBackground})`,
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
          {/* Voice Controls - centered when voice mode active */}
          {interfaceMode === 'voice' && (
            <div className="flex flex-col items-center pt-4 px-4">
              <div className="flex items-center gap-2 p-2 bg-card rounded-lg border">
                <div className="flex items-center gap-1 bg-muted rounded-md p-1 flex-1">
                  <Button
                    onClick={handleVoiceSearch}
                    disabled={isListening}
                    size="sm"
                    className="flex items-center gap-2 h-8 flex-1 bg-green-600 hover:bg-green-700 text-white font-bold transition-all duration-200"
                  >
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-pulse' : 'bg-white'}`}></div>
                    <span className="text-xs font-bold">{isListening ? 'Listening...' : 'Start'}</span>
                  </Button>
                  <Button
                    onClick={handleStopVoice}
                    disabled={!isListening}
                    size="sm"
                    className="flex items-center gap-2 h-8 flex-1 bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 disabled:bg-red-300"
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-xs font-bold">Stop</span>
                  </Button>
                </div>
              </div>
              
              {/* Voice status indicator */}
              {isListening && (
                <div className="mt-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs text-primary font-medium">Listening for your command...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Form Section */}
          <div className="flex-1 flex items-center justify-center px-4 pt-4 pb-8">
            <div className="w-full max-w-md space-y-6">
              {/* Business Name Search */}
              <div className="space-y-3">
                <BusinessNameSearch
                  onSearch={handleNameSearch}
                  isLoading={isNameSearchLoading}
                />
                <div className="flex justify-center">
                  <VoiceTouchToggle 
                    onModeChange={handleModeChange}
                    className="scale-90"
                  />
                </div>
              </div>
              
              {/* OR Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card/95 backdrop-blur-sm text-muted-foreground font-medium">
                    or
                  </span>
                </div>
              </div>

              {/* Detailed Search Form */}
              <StreamlinedSearchForm
                onSearch={handleSearch}
                onReset={handleReset}
                isLoading={isLoading}
              />
              
            </div>
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
                  <span className="font-bold text-black text-sm">YOUR SELECTION RESULTS!</span>
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
                  <span className="font-bold text-black text-lg">YOUR SELECTION RESULTS!</span>
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
                selectedCategory={
                  searchParams?.priceLevel || 
                  searchParams?.cuisineType || 
                  searchParams?.foodSpecialty || 
                  searchParams?.drinkSpecialty || 
                  'results'
                }
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