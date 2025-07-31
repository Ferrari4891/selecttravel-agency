import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Globe, Star, Calendar, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
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

const SharedCollection: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [restaurants, setRestaurants] = useState<SavedRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (token) {
      loadSharedCollection();
    }
  }, [token]);

  const loadSharedCollection = async () => {
    try {
      setIsLoading(true);
      
      // First, verify the share token exists and is valid
      const { data: shareData, error: shareError } = await supabase
        .from('collection_shares')
        .select('collection_id, expires_at')
        .eq('share_token', token)
        .single();

      if (shareError || !shareData) {
        setIsNotFound(true);
        return;
      }

      // Check if token has expired
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        setIsNotFound(true);
        return;
      }

      // Get the collection details
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('id, name, description, created_at')
        .eq('id', shareData.collection_id)
        .single();

      if (collectionError || !collectionData) {
        setIsNotFound(true);
        return;
      }

      setCollection(collectionData);

      // Get the restaurants in this collection
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('saved_restaurants')
        .select('*')
        .eq('collection_id', shareData.collection_id)
        .order('created_at', { ascending: false });

      if (restaurantsError) {
        console.error('Error loading restaurants:', restaurantsError);
      } else {
        setRestaurants(restaurantsData || []);
      }
    } catch (error) {
      console.error('Error loading shared collection:', error);
      setIsNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading shared collection...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isNotFound || !collection) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
              <p className="text-muted-foreground">
                This shared collection link is invalid or has expired.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground text-lg">{collection.description}</p>
              )}
            </div>
            <Button onClick={copyShareLink} variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Copy Link
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created {new Date(collection.created_at).toLocaleDateString()}
            </div>
            <Badge variant="secondary">{restaurants.length} businesses</Badge>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              This collection doesn't have any businesses yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {restaurants.map((restaurant) => {
              const data = restaurant.restaurant_data;
              return (
                <Card key={restaurant.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{restaurant.restaurant_name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {restaurant.restaurant_address}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.city}, {restaurant.country}
                      {restaurant.category && ` • ${restaurant.category}`}
                    </p>
                  </CardHeader>
                  <CardContent>
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

                        {/* Social Media Links */}
                        {data.socialMediaLinks && (
                          <div className="flex flex-wrap gap-2">
                            {data.socialMediaLinks.facebook && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={data.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer">
                                  Facebook
                                </a>
                              </Button>
                            )}
                            {data.socialMediaLinks.instagram && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={data.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer">
                                  Instagram
                                </a>
                              </Button>
                            )}
                            {data.socialMediaLinks.twitter && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={data.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer">
                                  Twitter
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SharedCollection;