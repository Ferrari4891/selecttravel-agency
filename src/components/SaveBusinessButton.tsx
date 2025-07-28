import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SaveBusinessButtonProps {
  restaurant: any;
  selectedCity: string;
  selectedCountry: string;
  selectedCategory?: string;
}

interface Collection {
  id: string;
  name: string;
}

const SaveBusinessButton: React.FC<SaveBusinessButtonProps> = ({
  restaurant,
  selectedCity,
  selectedCountry,
  selectedCategory
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadCollections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleOpenDialog = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save businesses to your collections.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setIsDialogOpen(true);
    loadCollections();
  };

  const createNewCollection = async () => {
    if (!newCollectionName.trim() || !user) return;

    setIsCreatingCollection(true);
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          name: newCollectionName,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCollections(prev => [data, ...prev]);
      setSelectedCollection(data.id);
      setNewCollectionName('');
      
      toast({
        title: "Collection Created",
        description: `"${data.name}" collection has been created.`,
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const saveRestaurant = async () => {
    if (!user || !selectedCollection) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saved_restaurants')
        .insert({
          user_id: user.id,
          restaurant_name: restaurant.name,
          restaurant_address: restaurant.address,
          city: selectedCity,
          country: selectedCountry,
          category: selectedCategory || null,
          collection_id: selectedCollection,
          restaurant_data: restaurant,
        });

      if (error) throw error;

      toast({
        title: "Business Saved",
        description: `${restaurant.name} has been saved to your collection.`,
      });

      setIsDialogOpen(false);
      setSelectedCollection('');
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to save business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleOpenDialog}
          variant="default"
          size="sm"
          className="flex items-center gap-2 w-full bg-black text-white hover:bg-black/90 rounded-none"
        >
          <Heart className="w-4 h-4" />
          SAVE
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="collection">Select Collection</Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newCollection">Or Create New Collection</Label>
            <div className="flex gap-2">
              <Input
                id="newCollection"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
              />
              <Button
                onClick={createNewCollection}
                disabled={!newCollectionName.trim() || isCreatingCollection}
                variant="outline"
              >
                {isCreatingCollection ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={saveRestaurant}
              disabled={!selectedCollection || isSaving}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Business'}
            </Button>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveBusinessButton;