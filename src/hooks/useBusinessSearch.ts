import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessSearchFilters {
  category: string;
  subcategory?: string;
  type?: string;
  city: string;
  country: string;
  userPreferences?: {
    wheelchair_access?: boolean;
    extended_hours?: boolean;
    gluten_free?: boolean;
    low_noise?: boolean;
    public_transport?: boolean;
    pet_friendly?: boolean;
    outdoor_seating?: boolean;
    senior_discounts?: boolean;
    online_booking?: boolean;
    air_conditioned?: boolean;
  };
}

export const useBusinessSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchBusinesses = async (filters: BusinessSearchFilters) => {
    setIsLoading(true);
    
    try {
      // Build query filters with correct field names
      const queryFilters: any = {
        city: filters.city,
        country: filters.country,
        status: 'approved'
      };

      // Map search categories to database values with fallback logic
      if (filters.category) {
        // Handle both new category structure and legacy data
        if (filters.category === 'Food') {
          // Use OR condition to match both new and legacy categories
          // This will be handled in the query below
        } else if (filters.category === 'Drink') {
          queryFilters.business_category = 'Drink';
        } else {
          queryFilters.business_category = filters.category;
        }
      }

      if (filters.subcategory) {
        // Map new subcategory names to database values
        const subcategoryMap: { [key: string]: string[] } = {
          'Restaurants': ['Restaurants', 'restaurant', 'fine-dining', 'casual-dining', 'family-restaurant', 'buffet', 'food-truck', 'takeaway'],
          'Fast Food': ['Fast Food', 'fast-food', 'quick-service', 'counter-service', 'drive-through'],
          'Bars': ['Bars', 'bar', 'traditional-pub', 'modern-bar', 'lounge'],
          'Clubs': ['Clubs', 'club', 'nightclub', 'music-venue', 'entertainment-club']
        };
        
        const possibleValues = subcategoryMap[filters.subcategory] || [filters.subcategory];
        // We'll handle this in the query using OR conditions
      }

      if (filters.type) {
        queryFilters.business_specific_type = filters.type;
      }

      // Add user preference filters
      if (filters.userPreferences) {
        const prefs = filters.userPreferences;
        if (prefs.wheelchair_access) queryFilters.wheelchair_access = true;
        if (prefs.extended_hours) queryFilters.extended_hours = true;
        if (prefs.gluten_free) queryFilters.gluten_free = true;
        if (prefs.low_noise) queryFilters.low_noise = true;
        if (prefs.public_transport) queryFilters.public_transport = true;
        if (prefs.pet_friendly) queryFilters.pet_friendly = true;
        if (prefs.outdoor_seating) queryFilters.outdoor_seating = true;
        if (prefs.senior_discounts) queryFilters.senior_discounts = true;
        if (prefs.online_booking) queryFilters.online_booking = true;
        if (prefs.air_conditioned) queryFilters.air_conditioned = true;
      }

      // Build the base query
      let query = supabase
        .from('businesses')
        .select('*')
        .match({
          city: filters.city,
          country: filters.country,
          status: 'approved'
        });

      // Handle category filtering with fallback for legacy data
      if (filters.category === 'Food') {
        query = query.or('business_category.eq.Food,business_category.eq.restaurant');
      } else if (filters.category) {
        query = query.eq('business_category', filters.category);
      }

      // Handle subcategory filtering with multiple possible values
      if (filters.subcategory) {
        const subcategoryMap: { [key: string]: string[] } = {
          'Restaurants': ['Restaurants', 'restaurant', 'fine-dining', 'casual-dining', 'family-restaurant', 'buffet', 'food-truck', 'takeaway'],
          'Fast Food': ['Fast Food', 'fast-food', 'quick-service', 'counter-service', 'drive-through'],
          'Bars': ['Bars', 'bar', 'traditional-pub', 'modern-bar', 'lounge'],
          'Clubs': ['Clubs', 'club', 'nightclub', 'music-venue', 'entertainment-club']
        };
        
        const possibleValues = subcategoryMap[filters.subcategory] || [filters.subcategory];
        const orConditions = possibleValues.map(val => `business_subcategory.eq.${val}`).join(',');
        query = query.or(orConditions);
      }

      // Handle specific type filtering
      if (filters.type) {
        query = query.eq('business_specific_type', filters.type);
      }

      // Add user preference filters
      if (filters.userPreferences) {
        const prefs = filters.userPreferences;
        if (prefs.wheelchair_access) query = query.eq('wheelchair_access', true);
        if (prefs.extended_hours) query = query.eq('extended_hours', true);
        if (prefs.gluten_free) query = query.eq('gluten_free', true);
        if (prefs.low_noise) query = query.eq('low_noise', true);
        if (prefs.public_transport) query = query.eq('public_transport', true);
        if (prefs.pet_friendly) query = query.eq('pet_friendly', true);
        if (prefs.outdoor_seating) query = query.eq('outdoor_seating', true);
        if (prefs.senior_discounts) query = query.eq('senior_discounts', true);
        if (prefs.online_booking) query = query.eq('online_booking', true);
        if (prefs.air_conditioned) query = query.eq('air_conditioned', true);
      }

      const { data: businesses, error } = await query
        .order('subscription_tier', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!businesses || businesses.length === 0) {
        toast({
          title: "No Results",
          description: "No businesses found matching your preferences in this location.",
        });
        return [];
      }

      // Transform business data to match the Restaurant interface with subscription ordering
      const getSubscriptionPriority = (tier: string | null) => {
        switch (tier) {
          case 'firstclass': return 4;
          case 'premium': return 3;
          case 'basic': return 2;
          default: return 1; // trial or null
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
          rating: 4.0 + Math.random() * 1.0, // Placeholder rating
          reviewCount: Math.floor(Math.random() * 500) + 50, // Placeholder review count
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
        }));

      toast({
        title: "Success!",
        description: `Found ${businesses.length} businesses matching your preferences in ${filters.city}`,
      });

      return transformedResults;

    } catch (error) {
      console.error('Business search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search businesses. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchBusinesses,
    isLoading,
  };
};