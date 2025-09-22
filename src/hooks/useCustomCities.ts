import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCustomCities = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addCustomCity = async (cityName: string, country: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_cities')
        .insert({
          name: cityName,
          country: country,
          added_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "City Already Exists",
            description: `${cityName} is already in the system for ${country}`,
            variant: "destructive",
          });
          return null;
        }
        throw error;
      }

      toast({
        title: "City Added",
        description: `${cityName} has been submitted for approval and added to ${country}`,
      });

      return data;
    } catch (error) {
      console.error('Error adding custom city:', error);
      toast({
        title: "Error",
        description: "Failed to add city. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomCities = async (country: string) => {
    try {
      const { data, error } = await supabase
        .from('custom_cities')
        .select('name')
        .eq('country', country)
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data?.map(city => city.name) || [];
    } catch (error) {
      console.error('Error fetching custom cities:', error);
      return [];
    }
  };

  return {
    addCustomCity,
    getCustomCities,
    isLoading,
  };
};