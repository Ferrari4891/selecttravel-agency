import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AmenityOption {
  id: string;
  option_key: string;
  display_name: string;
  description?: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useAmenityOptions = () => {
  const [amenityOptions, setAmenityOptions] = useState<AmenityOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAmenityOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('amenity_options')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAmenityOptions(data || []);
    } catch (error) {
      console.error('Error fetching amenity options:', error);
      toast({
        title: "Error",
        description: "Failed to load amenity options",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAmenityOption = async (option: Omit<AmenityOption, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('amenity_options')
        .insert([option])
        .select()
        .single();

      if (error) throw error;

      setAmenityOptions(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      
      toast({
        title: "Success",
        description: "Amenity option created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating amenity option:', error);
      toast({
        title: "Error",
        description: "Failed to create amenity option",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAmenityOption = async (id: string, updates: Partial<AmenityOption>) => {
    try {
      const { data, error } = await supabase
        .from('amenity_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAmenityOptions(prev => 
        prev.map(option => option.id === id ? data : option)
          .sort((a, b) => a.sort_order - b.sort_order)
      );

      toast({
        title: "Success",
        description: "Amenity option updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating amenity option:', error);
      toast({
        title: "Error",
        description: "Failed to update amenity option",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAmenityOption = async (id: string) => {
    try {
      const { error } = await supabase
        .from('amenity_options')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setAmenityOptions(prev => prev.filter(option => option.id !== id));

      toast({
        title: "Success",
        description: "Amenity option deactivated successfully",
      });
    } catch (error) {
      console.error('Error deactivating amenity option:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate amenity option",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAmenityOptions();

    // Set up real-time subscription
    const channel = supabase
      .channel('amenity_options_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'amenity_options'
        },
        () => {
          fetchAmenityOptions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    amenityOptions,
    isLoading,
    createAmenityOption,
    updateAmenityOption,
    deleteAmenityOption,
    refetch: fetchAmenityOptions,
  };
};