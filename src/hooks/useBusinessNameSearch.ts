import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NameSearchFilters {
  businessName: string;
  city?: string;
  country?: string;
}

export const useBusinessNameSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchByName = async (filters: NameSearchFilters) => {
    setIsLoading(true);
    
    try {
      // Build the base query
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('status', 'approved')
        .ilike('business_name', `%${filters.businessName}%`);

      // Add optional location filters
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      const { data: businesses, error } = await query
        .order('subscription_tier', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      if (!businesses || businesses.length === 0) {
        const locationMsg = filters.city && filters.country 
          ? ` in ${filters.city}, ${filters.country}`
          : filters.country 
          ? ` in ${filters.country}`
          : '';
        
        toast({
          title: "No Results",
          description: `No businesses found matching "${filters.businessName}"${locationMsg}.`,
        });
        return [];
      }

      // Transform business data
      const getSubscriptionPriority = (tier: string | null) => {
        switch (tier) {
          case 'firstclass': return 4;
          case 'premium': return 3;
          case 'basic': return 2;
          default: return 1;
        }
      };

      const transformedResults = businesses
        .sort((a, b) => {
          const priorityA = getSubscriptionPriority(a.subscription_tier);
          const priorityB = getSubscriptionPriority(b.subscription_tier);
          return priorityB - priorityA;
        })
        .map((business) => ({
          name: business.business_name,
          address: business.address || `${business.city}, ${business.country}`,
          googleMapRef: business.address 
            ? `https://maps.google.com/?q=${encodeURIComponent(business.address)}`
            : `https://maps.google.com/?q=${encodeURIComponent(`${business.city}, ${business.country}`)}`,
          socialMediaLinks: {
            facebook: business.facebook || undefined,
            instagram: business.instagram || undefined,
            twitter: business.twitter || undefined,
          },
          contactDetails: {
            phone: business.phone || undefined,
            email: business.email || undefined,
            website: business.website || undefined,
          },
          imageLinks: [
            business.image_1_url,
            business.image_2_url,
            business.image_3_url,
          ].filter(Boolean),
          rating: 4.0 + Math.random() * 1.0,
          reviewCount: Math.floor(Math.random() * 500) + 50,
          source: 'Business Directory',
          subscriptionTier: business.subscription_tier,
          businessFeatures: {
            wheelchair_access: business.wheelchair_access,
            extended_hours: business.extended_hours,
            gluten_free: business.gluten_free,
            low_noise: business.low_noise,
            public_transport: business.public_transport,
            pet_friendly: business.pet_friendly,
            outdoor_seating: business.outdoor_seating,
            senior_discounts: business.senior_discounts,
            online_booking: business.online_booking,
            air_conditioned: business.air_conditioned,
          },
          priceLevel: business.price_level,
          cuisineType: business.cuisine_type,
          foodSpecialties: business.food_specialties || [],
          drinkSpecialties: business.drink_specialties || [],
        }));

      const locationMsg = filters.city && filters.country 
        ? ` in ${filters.city}, ${filters.country}`
        : filters.country 
        ? ` in ${filters.country}`
        : '';

      toast({
        title: "Success!",
        description: `Found ${businesses.length} business(es) matching "${filters.businessName}"${locationMsg}`,
      });

      return transformedResults;

    } catch (error) {
      console.error('Name search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search businesses by name. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchByName,
    isLoading,
  };
};
