import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, Globe, Eye, Plus } from 'lucide-react';
import heroImage from "@/assets/hero-members.jpg";
import { ImageUpload } from "@/components/ImageUpload";
import MobileContainer from "@/components/MobileContainer";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentRestaurants, setRecentRestaurants] = useState<SavedRestaurant[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
      fetchCollections();
      fetchRecentRestaurants();
    }
  }, [user]);

  const fetchUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          wheelchair_access: data.wheelchair_access || false,
          extended_hours: data.extended_hours || false,
          gluten_free: data.gluten_free || false,
          low_noise: data.low_noise || false,
          public_transport: data.public_transport || false,
          pet_friendly: data.pet_friendly || false,
          outdoor_seating: data.outdoor_seating || false,
          senior_discounts: data.senior_discounts || false,
          online_booking: data.online_booking || false,
          air_conditioned: data.air_conditioned || false,
          preferred_language: data.preferred_language || 'en'
        });
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          description,
          is_public,
          created_at,
          saved_restaurants (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const collectionsWithCount = data?.map(collection => ({
        ...collection,
        restaurantCount: collection.saved_restaurants?.[0]?.count || 0
      })) || [];

      setCollections(collectionsWithCount);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    }
  };

  const fetchRecentRestaurants = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_restaurants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching recent restaurants:', error);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: boolean | string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          [key]: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, [key]: value }));
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    try {
      const { error } = await supabase
        .from('saved_restaurants')
        .delete()
        .eq('id', restaurantId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setRecentRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      toast.success('Restaurant removed successfully');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to remove restaurant');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Please sign in to access your dashboard</div>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <MobileContainer>
      <div className="min-h-screen bg-background">
        {/* Hero Section - Mobile Optimized */}
        <div className="relative w-full h-48 md:h-64 mb-4">
          <img 
            src={heroImage} 
            alt="My Dashboard" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">My Dashboard</h1>
              <p className="text-sm md:text-lg">Welcome back, {user?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="px-4 pb-8 space-y-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-1 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger value="preferences" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Preferences</TabsTrigger>
              <TabsTrigger value="collections" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Collections</TabsTrigger>
              <TabsTrigger value="saved" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Saved</TabsTrigger>
              <TabsTrigger value="images" className="w-full text-sm md:text-base font-medium px-4 py-3 border border-border rounded data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Travel Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Accessibility</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.wheelchair_access}
                            onCheckedChange={(checked) => updatePreference('wheelchair_access', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">♿ Wheelchair accessible venues</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.low_noise}
                            onCheckedChange={(checked) => updatePreference('low_noise', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">🔇 Quiet, low-noise environments</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Dining</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.gluten_free}
                            onCheckedChange={(checked) => updatePreference('gluten_free', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">🌾 Gluten-free options available</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.outdoor_seating}
                            onCheckedChange={(checked) => updatePreference('outdoor_seating', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">🌳 Outdoor seating available</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Convenience</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.extended_hours}
                            onCheckedChange={(checked) => updatePreference('extended_hours', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">🕐 Extended operating hours</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.public_transport}
                            onCheckedChange={(checked) => updatePreference('public_transport', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">🚌 Near public transportation</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.online_booking}
                            onCheckedChange={(checked) => updatePreference('online_booking', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">💻 Online booking available</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.air_conditioned}
                            onCheckedChange={(checked) => updatePreference('air_conditioned', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">❄️ Air conditioned</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Special Features</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.pet_friendly}
                            onCheckedChange={(checked) => updatePreference('pet_friendly', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">🐕 Pet-friendly venues</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded bg-muted/30">
                          <Checkbox
                            checked={preferences.senior_discounts}
                            onCheckedChange={(checked) => updatePreference('senior_discounts', checked as boolean)}
                            disabled={saving}
                            className="h-5 w-5"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">💰 Senior discounts available</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">My Collections</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {collections.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium">No collections yet</h4>
                        <p className="text-sm">Start saving restaurants to create your first collection</p>
                        <Link to="/">
                          <Button variant="outline" className="rounded-none">
                            <Plus className="h-4 w-4 mr-2" />
                            Explore Restaurants
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {collections.map((collection) => (
                        <div key={collection.id} className="p-4 border rounded-lg">
                          <div className="space-y-2">
                            <h4 className="font-medium">{collection.name}</h4>
                            {collection.description && (
                              <p className="text-sm text-muted-foreground">{collection.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">{collection.restaurantCount} items</Badge>
                              {collection.is_public && <Badge variant="outline" className="text-xs">Public</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {recentRestaurants.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium">No saved businesses yet</h4>
                        <p className="text-sm">Start exploring to discover great places to save</p>
                        <Link to="/">
                          <Button variant="outline" className="rounded-none">
                            <Eye className="h-4 w-4 mr-2" />
                            Start Exploring
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="p-4 border rounded-lg">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium">{restaurant.restaurant_name}</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteRestaurant(restaurant.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{restaurant.restaurant_address}, {restaurant.city}, {restaurant.country}</span>
                            </div>
                            {restaurant.category && (
                              <Badge variant="outline" className="text-xs">{restaurant.category}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card className="border shadow-md bg-background">
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">Image Management</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ImageUpload />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <Footer />
      </div>
    </MobileContainer>
  );
};

export default Dashboard;