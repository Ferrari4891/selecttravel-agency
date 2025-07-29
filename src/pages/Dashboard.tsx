import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, Globe, Eye, Plus } from 'lucide-react';
import heroImage from "@/assets/hero-members.jpg";

interface UserPreferences {
  wheelchair_access: boolean;
  extended_hours: boolean;
  gluten_free: boolean;
  low_noise: boolean;
  public_transport: boolean;
  pet_friendly: boolean;
  outdoor_seating: boolean;
  senior_discounts: boolean;
  online_booking: boolean;
  air_conditioned: boolean;
  preferred_language: string;
}

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

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    wheelchair_access: false,
    extended_hours: false,
    gluten_free: false,
    low_noise: false,
    public_transport: false,
    pet_friendly: false,
    outdoor_seating: false,
    senior_discounts: false,
    online_booking: false,
    air_conditioned: false,
    preferred_language: 'en'
  });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentRestaurants, setRecentRestaurants] = useState<SavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('Dashboard useEffect triggered, user:', user?.id);
    if (user?.id) {
      console.log('Starting to load user data...');
      loadUserData();
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    console.log('loadUserData started');
    setLoading(true);
    
    try {
      // Load preferences first (fastest)
      console.log('Loading preferences...');
      await loadUserPreferences();
      console.log('Preferences loaded');
      
      // Set loading to false early so page shows
      setLoading(false);
      
      // Load other data in background
      console.log('Loading collections and restaurants in background...');
      setTimeout(async () => {
        try {
          await loadCollections();
          console.log('Collections loaded');
          await loadRecentRestaurants();
          console.log('Recent restaurants loaded');
        } catch (error) {
          console.warn('Background loading failed:', error);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error in loadUserData:', error);
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadCollections = async () => {
    if (!user?.id) return;
    
    try {
      // Simplified query without complex joins
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('id, name, description, is_public, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (collectionsError) throw collectionsError;

      // Get counts separately to avoid complex join issues
      const collectionsWithCount = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          try {
            const { count } = await supabase
              .from('saved_restaurants')
              .select('*', { count: 'exact', head: true })
              .eq('collection_id', collection.id);

            return {
              ...collection,
              restaurantCount: count || 0
            };
          } catch (error) {
            console.warn('Error getting count for collection:', collection.id);
            return {
              ...collection,
              restaurantCount: 0
            };
          }
        })
      );

      setCollections(collectionsWithCount);
    } catch (error) {
      console.error('Error loading collections:', error);
      setCollections([]); // Set empty array on error
    }
  };

  const loadRecentRestaurants = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_restaurants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentRestaurants(data || []);
    } catch (error) {
      console.error('Error loading recent restaurants:', error);
      setRecentRestaurants([]); // Set empty array on error
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, checked: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences');
        return;
      }

      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative w-full h-96 mb-8">
        <div className="w-full h-full bg-background relative" style={{
          border: '8px solid white',
          boxShadow: '0 8px 12px -4px rgba(169, 169, 169, 0.4)'
        }}>
          <img src={heroImage} alt="Dashboard" className="w-full h-full object-cover" />
          
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4 md:text-9xl">My Dashboard</h1>
              <p className="text-lg">Welcome back, {user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
              <TabsTrigger value="preferences">My Preferences</TabsTrigger>
              <TabsTrigger value="collections">My Collections</TabsTrigger>
              <TabsTrigger value="saved">Recent Saves</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center border-b-2 border-black pb-2 text-2xl text-foreground font-extrabold">
                    YOUR PREFERENCES
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-lg text-center mb-8 text-gray-700">
                    Update your preferences to personalize your recommendations.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="wheelchair_access" 
                          checked={preferences.wheelchair_access} 
                          onCheckedChange={checked => handlePreferenceChange('wheelchair_access', checked as boolean)} 
                        />
                        <label htmlFor="wheelchair_access" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Wheelchair Access
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="extended_hours" 
                          checked={preferences.extended_hours} 
                          onCheckedChange={checked => handlePreferenceChange('extended_hours', checked as boolean)} 
                        />
                        <label htmlFor="extended_hours" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Extended Open Hours
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="gluten_free" 
                          checked={preferences.gluten_free} 
                          onCheckedChange={checked => handlePreferenceChange('gluten_free', checked as boolean)} 
                        />
                        <label htmlFor="gluten_free" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Gluten Free Options
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="low_noise" 
                          checked={preferences.low_noise} 
                          onCheckedChange={checked => handlePreferenceChange('low_noise', checked as boolean)} 
                        />
                        <label htmlFor="low_noise" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Low Noise Environment
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="public_transport" 
                          checked={preferences.public_transport} 
                          onCheckedChange={checked => handlePreferenceChange('public_transport', checked as boolean)} 
                        />
                        <label htmlFor="public_transport" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Public Transport Access
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="pet_friendly" 
                          checked={preferences.pet_friendly} 
                          onCheckedChange={checked => handlePreferenceChange('pet_friendly', checked as boolean)} 
                        />
                        <label htmlFor="pet_friendly" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Pet Friendly Venues
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="outdoor_seating" 
                          checked={preferences.outdoor_seating} 
                          onCheckedChange={checked => handlePreferenceChange('outdoor_seating', checked as boolean)} 
                        />
                        <label htmlFor="outdoor_seating" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Outdoor Seating Available
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="senior_discounts" 
                          checked={preferences.senior_discounts} 
                          onCheckedChange={checked => handlePreferenceChange('senior_discounts', checked as boolean)} 
                        />
                        <label htmlFor="senior_discounts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Senior Discounts Available
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="online_booking" 
                          checked={preferences.online_booking} 
                          onCheckedChange={checked => handlePreferenceChange('online_booking', checked as boolean)} 
                        />
                        <label htmlFor="online_booking" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Online Booking Available
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="air_conditioned" 
                          checked={preferences.air_conditioned} 
                          onCheckedChange={checked => handlePreferenceChange('air_conditioned', checked as boolean)} 
                        />
                        <label htmlFor="air_conditioned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Air Conditioned
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium leading-none">Preferred Language:</span>
                          <LanguageSelector />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-8">
                      <Button 
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="px-8"
                      >
                        {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collections" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">My Collections</h3>
                <Button variant="outline" asChild>
                  <a href="/collections">
                    <Plus className="w-4 h-4 mr-2" />
                    Manage All
                  </a>
                </Button>
              </div>
              
              {collections.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">No collections yet</h4>
                      <p>Create your first collection to start organizing your saved businesses!</p>
                      <Button asChild>
                        <a href="/collections">Create Collection</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {collections.map((collection) => (
                    <Card key={collection.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground mb-3">{collection.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{collection.restaurantCount} businesses</Badge>
                          {collection.is_public && <Badge variant="outline">Public</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Recently Saved Businesses</h3>
                <Button variant="outline" asChild>
                  <a href="/collections">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </a>
                </Button>
              </div>
              
              {recentRestaurants.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">No saved businesses yet</h4>
                      <p>Start exploring and save your favorite places to eat, drink, and visit!</p>
                      <Button asChild>
                        <a href="/">Start Exploring</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {recentRestaurants.map((restaurant) => {
                    const data = restaurant.restaurant_data;
                    return (
                      <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold">{restaurant.restaurant_name}</h4>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <MapPin className="w-4 h-4" />
                              {restaurant.restaurant_address}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{restaurant.city}, {restaurant.country}</span>
                              {restaurant.category && (
                                <>
                                  <span>•</span>
                                  <span>{restaurant.category}</span>
                                </>
                              )}
                            </div>
                            {data?.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{data.rating}</span>
                                {data?.review_count && (
                                  <span className="text-sm text-muted-foreground">({data.review_count} reviews)</span>
                                )}
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              {data?.website && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={data.website} target="_blank" rel="noopener noreferrer">
                                    <Globe className="w-3 h-3 mr-1" />
                                    Website
                                  </a>
                                </Button>
                              )}
                              {data?.phone && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`tel:${data.phone}`}>
                                    <Phone className="w-3 h-3 mr-1" />
                                    Call
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;