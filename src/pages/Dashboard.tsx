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
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 rounded-lg p-1">
              <TabsTrigger value="preferences" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                My Preferences
              </TabsTrigger>
              <TabsTrigger value="collections" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                My Collections
              </TabsTrigger>
              <TabsTrigger value="saved" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                Recent Saves
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-foreground">
                    <span>Account Preferences</span>
                    <Badge variant="secondary" className="text-xs">Settings</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Accessibility</h4>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="wheelchair_access" className="text-sm font-medium cursor-pointer">
                            Wheelchair Access
                          </label>
                          <Checkbox 
                            id="wheelchair_access" 
                            checked={preferences.wheelchair_access} 
                            onCheckedChange={checked => handlePreferenceChange('wheelchair_access', checked as boolean)} 
                          />
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="low_noise" className="text-sm font-medium cursor-pointer">
                            Low Noise Environment
                          </label>
                          <Checkbox 
                            id="low_noise" 
                            checked={preferences.low_noise} 
                            onCheckedChange={checked => handlePreferenceChange('low_noise', checked as boolean)} 
                          />
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="public_transport" className="text-sm font-medium cursor-pointer">
                            Public Transport Access
                          </label>
                          <Checkbox 
                            id="public_transport" 
                            checked={preferences.public_transport} 
                            onCheckedChange={checked => handlePreferenceChange('public_transport', checked as boolean)} 
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Dining</h4>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="gluten_free" className="text-sm font-medium cursor-pointer">
                            Gluten Free Options
                          </label>
                          <Checkbox 
                            id="gluten_free" 
                            checked={preferences.gluten_free} 
                            onCheckedChange={checked => handlePreferenceChange('gluten_free', checked as boolean)} 
                          />
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="outdoor_seating" className="text-sm font-medium cursor-pointer">
                            Outdoor Seating
                          </label>
                          <Checkbox 
                            id="outdoor_seating" 
                            checked={preferences.outdoor_seating} 
                            onCheckedChange={checked => handlePreferenceChange('outdoor_seating', checked as boolean)} 
                          />
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="pet_friendly" className="text-sm font-medium cursor-pointer">
                            Pet Friendly Venues
                          </label>
                          <Checkbox 
                            id="pet_friendly" 
                            checked={preferences.pet_friendly} 
                            onCheckedChange={checked => handlePreferenceChange('pet_friendly', checked as boolean)} 
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Services</h4>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="extended_hours" className="text-sm font-medium cursor-pointer">
                            Extended Hours
                          </label>
                          <Checkbox 
                            id="extended_hours" 
                            checked={preferences.extended_hours} 
                            onCheckedChange={checked => handlePreferenceChange('extended_hours', checked as boolean)} 
                          />
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="online_booking" className="text-sm font-medium cursor-pointer">
                            Online Booking
                          </label>
                          <Checkbox 
                            id="online_booking" 
                            checked={preferences.online_booking} 
                            onCheckedChange={checked => handlePreferenceChange('online_booking', checked as boolean)} 
                          />
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="senior_discounts" className="text-sm font-medium cursor-pointer">
                            Senior Discounts
                          </label>
                          <Checkbox 
                            id="senior_discounts" 
                            checked={preferences.senior_discounts} 
                            onCheckedChange={checked => handlePreferenceChange('senior_discounts', checked as boolean)} 
                          />
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <label htmlFor="air_conditioned" className="text-sm font-medium cursor-pointer">
                            Air Conditioned
                          </label>
                          <Checkbox 
                            id="air_conditioned" 
                            checked={preferences.air_conditioned} 
                            onCheckedChange={checked => handlePreferenceChange('air_conditioned', checked as boolean)} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between max-w-sm">
                        <span className="text-sm font-medium">Preferred Language:</span>
                        <LanguageSelector />
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-8">
                      <Button 
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="px-8"
                      >
                        {saving ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collections" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="flex items-center justify-between text-xl font-semibold">
                    <span>Collections Overview</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{collections.length} total</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/collections">
                          <Plus className="w-4 h-4 mr-1" />
                          Manage
                        </a>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {collections.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium">No collections yet</h4>
                        <p>Create your first collection to start organizing your saved businesses!</p>
                        <Button asChild>
                          <a href="/collections">Create Collection</a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {collections.map((collection) => (
                        <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium">{collection.name}</h4>
                            {collection.description && (
                              <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{collection.restaurantCount} items</Badge>
                            {collection.is_public && <Badge variant="outline" className="text-xs">Public</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="flex items-center justify-between text-xl font-semibold">
                    <span>Recent Activity</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{recentRestaurants.length} recent</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/collections">
                          <Eye className="w-4 h-4 mr-1" />
                          View All
                        </a>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {recentRestaurants.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium">No saved businesses yet</h4>
                        <p>Start exploring and save your favorite places to eat, drink, and visit!</p>
                        <Button asChild>
                          <a href="/">Start Exploring</a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentRestaurants.map((restaurant) => {
                        const data = restaurant.restaurant_data;
                        return (
                          <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{restaurant.restaurant_name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{restaurant.restaurant_address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{restaurant.city}, {restaurant.country}</span>
                                {restaurant.category && (
                                  <>
                                    <span>•</span>
                                    <span>{restaurant.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {data?.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium">{data.rating}</span>
                                </div>
                              )}
                              <div className="flex gap-1">
                                {data?.website && (
                                  <Button size="sm" variant="outline" asChild className="h-7 px-2">
                                    <a href={data.website} target="_blank" rel="noopener noreferrer">
                                      <Globe className="w-3 h-3" />
                                    </a>
                                  </Button>
                                )}
                                {data?.phone && (
                                  <Button size="sm" variant="outline" asChild className="h-7 px-2">
                                    <a href={`tel:${data.phone}`}>
                                      <Phone className="w-3 h-3" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;