import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Share2, Trash2, Eye, MapPin, Phone, Globe, Star } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  restaurantCount?: number;
}

interface SavedRestaurant {
  id: string;
  restaurant_name: string;
  restaurant_address: string;
  city: string;
  country: string;
  category: string | null;
  restaurant_data: any;
  created_at: string;
}

const Collections: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionIsPublic, setNewCollectionIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Get collections with restaurant count
      const { data: collectionsData, error } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          description,
          is_public,
          created_at,
          saved_restaurants(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const collectionsWithCount = collectionsData?.map(collection => ({
        ...collection,
        restaurantCount: collection.saved_restaurants?.[0]?.count || 0
      })) || [];

      setCollections(collectionsWithCount);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast({
        title: "Error",
        description: "Failed to load collections.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollectionRestaurants = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_restaurants')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedRestaurants(data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      toast({
        title: "Error",
        description: "Failed to load saved restaurants.",
        variant: "destructive",
      });
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim() || !user) return;

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('collections')
        .insert({
          name: newCollectionName,
          description: newCollectionDescription || null,
          is_public: newCollectionIsPublic,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Collection Created",
        description: `"${newCollectionName}" has been created.`,
      });

      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionIsPublic(false);
      setIsCreateDialogOpen(false);
      loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: "Failed to create collection.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: "Collection Deleted",
        description: "Collection has been deleted successfully.",
      });

      loadCollections();
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
        setSavedRestaurants([]);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: "Error",
        description: "Failed to delete collection.",
        variant: "destructive",
      });
    }
  };

  const deleteRestaurant = async (restaurantId: string) => {
    try {
      const { error } = await supabase
        .from('saved_restaurants')
        .delete()
        .eq('id', restaurantId);

      if (error) throw error;

      toast({
        title: "Business Removed",
        description: "Business has been removed from collection.",
      });

      setSavedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      loadCollections(); // Refresh counts
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to remove business.",
        variant: "destructive",
      });
    }
  };

  const shareCollection = async (collection: Collection) => {
    try {
      // Create a sharing token
      const { data, error } = await supabase
        .from('collection_shares')
        .insert({
          collection_id: collection.id,
        })
        .select()
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared/${data.share_token}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Share Link Created",
        description: "Share link has been copied to clipboard.",
      });
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading collections...</div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">My Collections</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="My Favorite Restaurants"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newCollectionDescription}
                      onChange={(e) => setNewCollectionDescription(e.target.value)}
                      placeholder="A collection of my favorite places to eat..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={newCollectionIsPublic}
                      onCheckedChange={setNewCollectionIsPublic}
                    />
                    <Label htmlFor="public">Make this collection public</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={createCollection}
                      disabled={!newCollectionName.trim() || isCreating}
                      className="flex-1"
                    >
                      {isCreating ? 'Creating...' : 'Create Collection'}
                    </Button>
                    <Button
                      onClick={() => setIsCreateDialogOpen(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Collections List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold">Collections</h2>
              {collections.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No collections yet. Create your first collection to start saving businesses!
                  </CardContent>
                </Card>
              ) : (
                collections.map((collection) => (
                  <Card
                    key={collection.id}
                    className={`cursor-pointer transition-colors ${
                      selectedCollection?.id === collection.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedCollection(collection);
                      loadCollectionRestaurants(collection.id);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              shareCollection(collection);
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{collection.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCollection(collection.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground mb-2">{collection.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{collection.restaurantCount} businesses</Badge>
                        {collection.is_public && <Badge variant="outline">Public</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Selected Collection Details */}
            <div className="lg:col-span-2">
              {selectedCollection ? (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">{selectedCollection.name}</h2>
                  {selectedCollection.description && (
                    <p className="text-muted-foreground mb-6">{selectedCollection.description}</p>
                  )}
                  
                  {savedRestaurants.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center text-muted-foreground">
                        No businesses saved in this collection yet.
                        <br />
                        Start adding businesses from your search results!
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {savedRestaurants.map((restaurant) => {
                        const data = restaurant.restaurant_data;
                        return (
                          <Card key={restaurant.id}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold">{restaurant.restaurant_name}</h3>
                                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <MapPin className="w-4 h-4" />
                                    {restaurant.restaurant_address}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {restaurant.city}, {restaurant.country}
                                    {restaurant.category && ` • ${restaurant.category}`}
                                  </p>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Business</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove "{restaurant.restaurant_name}" from this collection?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteRestaurant(restaurant.id)}>
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              
                              {data && (
                                <div className="space-y-3">
                                  {data.rating && (
                                    <div className="flex items-center gap-2">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span>{data.rating}</span>
                                      {data.reviewCount && (
                                        <span className="text-muted-foreground">({data.reviewCount} reviews)</span>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {data.contactDetails?.phone && (
                                      <Button size="sm" variant="outline" asChild>
                                        <a href={`tel:${data.contactDetails.phone}`}>
                                          <Phone className="w-4 h-4 mr-2" />
                                          Call
                                        </a>
                                      </Button>
                                    )}
                                    {data.contactDetails?.website && (
                                      <Button size="sm" variant="outline" asChild>
                                        <a href={data.contactDetails.website} target="_blank" rel="noopener noreferrer">
                                          <Globe className="w-4 h-4 mr-2" />
                                          Website
                                        </a>
                                      </Button>
                                    )}
                                    {data.contactDetails?.googleMapsLink && (
                                      <Button size="sm" variant="outline" asChild>
                                        <a href={data.contactDetails.googleMapsLink} target="_blank" rel="noopener noreferrer">
                                          <MapPin className="w-4 h-4 mr-2" />
                                          Directions
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    Select a collection from the left to view its contents.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Collections;