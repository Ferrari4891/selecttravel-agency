import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, Globe, Eye, Plus } from 'lucide-react';
import heroImage from "@/assets/hero-members.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <div className="min-h-screen">
          {/* Fixed Navigation for mobile */}
          <Navigation />
          
          {/* Content container with proper top padding for fixed nav */}
          <div className="pt-20">
            {/* Hero section with background image */}
            <div 
              className="relative h-80 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold text-white mb-4">My Dashboard</h1>
                <p className="text-lg text-white">Welcome back, {user?.email}</p>
              </div>
            </div>
            
            {/* Content area for mobile with white background */}
            <div className="bg-white px-4 py-8">
              <div className="space-y-8">
                <div className="flex items-center justify-between gap-4">
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
                  <TabsList className="grid w-full grid-cols-3 rounded-none">
                    <TabsTrigger value="preferences" className="rounded-none">Preferences</TabsTrigger>
                    <TabsTrigger value="collections" className="rounded-none">Collections</TabsTrigger>
                    <TabsTrigger value="saved" className="rounded-none">Saved</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preferences" className="mt-6">
                    <Card className="rounded-none border-0 shadow-sm">
                      <CardHeader className="pb-4 border-b bg-black text-white">
                        <CardTitle className="text-xl font-bold">Travel Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Accessibility</h3>
                            <div className="space-y-3">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.wheelchair_access}
                                  onCheckedChange={(checked) => updatePreference('wheelchair_access', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Wheelchair accessible venues</span>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.low_noise}
                                  onCheckedChange={(checked) => updatePreference('low_noise', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Quiet, low-noise environments</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Dining</h3>
                            <div className="space-y-3">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.gluten_free}
                                  onCheckedChange={(checked) => updatePreference('gluten_free', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Gluten-free options available</span>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.outdoor_seating}
                                  onCheckedChange={(checked) => updatePreference('outdoor_seating', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Outdoor seating available</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Convenience</h3>
                            <div className="space-y-3">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.extended_hours}
                                  onCheckedChange={(checked) => updatePreference('extended_hours', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Extended operating hours</span>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.public_transport}
                                  onCheckedChange={(checked) => updatePreference('public_transport', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Near public transportation</span>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.online_booking}
                                  onCheckedChange={(checked) => updatePreference('online_booking', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Online booking available</span>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.air_conditioned}
                                  onCheckedChange={(checked) => updatePreference('air_conditioned', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Air conditioned</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Special Features</h3>
                            <div className="space-y-3">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.pet_friendly}
                                  onCheckedChange={(checked) => updatePreference('pet_friendly', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Pet-friendly venues</span>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                  checked={preferences.senior_discounts}
                                  onCheckedChange={(checked) => updatePreference('senior_discounts', checked as boolean)}
                                  disabled={saving}
                                />
                                <span className="text-sm font-medium text-foreground">Senior discounts available</span>
                              </label>
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <LanguageSelector />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="collections" className="mt-6">
                    <Card className="rounded-none border-0 shadow-sm">
                      <CardHeader className="pb-4 border-b bg-black text-white">
                        <CardTitle className="text-xl font-bold">My Collections</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
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

                  <TabsContent value="saved" className="mt-6">
                    <Card className="rounded-none border-0 shadow-sm">
                      <CardHeader className="pb-4 border-b bg-black text-white">
                        <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {recentRestaurants.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium">No saved businesses yet</h4>
                              <p className="text-sm">Start exploring and save your favorite restaurants and businesses</p>
                              <Link to="/">
                                <Button variant="outline" className="rounded-none">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Start Exploring
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentRestaurants.map((restaurant) => (
                              <div key={restaurant.id} className="p-4 border rounded-lg">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <h4 className="font-medium">{restaurant.restaurant_name}</h4>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {restaurant.restaurant_address}, {restaurant.city}, {restaurant.country}
                                      </p>
                                      {restaurant.category && (
                                        <Badge variant="outline" className="text-xs">{restaurant.category}</Badge>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                                      className="text-muted-foreground hover:text-destructive"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Saved on {new Date(restaurant.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navigation />
          
          {/* Content container with proper top padding for fixed nav */}
          <div className="pt-20">
            {/* Hero section with background image */}
            <div 
              className="relative h-80 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold text-white mb-4 md:text-6xl">My Dashboard</h1>
                <p className="text-lg text-white">Welcome back, {user?.email}</p>
              </div>
            </div>

            <div className="bg-white px-4 py-8">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between gap-4">
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
                  <TabsList className="grid w-full grid-cols-3 rounded-none max-w-md">
                    <TabsTrigger value="preferences" className="rounded-none">Preferences</TabsTrigger>
                    <TabsTrigger value="collections" className="rounded-none">Collections</TabsTrigger>
                    <TabsTrigger value="saved" className="rounded-none">Saved</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preferences" className="mt-6">
                    <Card className="rounded-none border-0 shadow-sm">
                      <CardHeader className="pb-4 border-b bg-black text-white">
                        <CardTitle className="text-2xl font-bold">Travel Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid gap-8 md:grid-cols-2">
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-foreground">Accessibility</h3>
                              <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.wheelchair_access}
                                    onCheckedChange={(checked) => updatePreference('wheelchair_access', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Wheelchair accessible venues</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.low_noise}
                                    onCheckedChange={(checked) => updatePreference('low_noise', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Quiet, low-noise environments</span>
                                </label>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-foreground">Dining</h3>
                              <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.gluten_free}
                                    onCheckedChange={(checked) => updatePreference('gluten_free', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Gluten-free options available</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.outdoor_seating}
                                    onCheckedChange={(checked) => updatePreference('outdoor_seating', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Outdoor seating available</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-foreground">Convenience</h3>
                              <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.extended_hours}
                                    onCheckedChange={(checked) => updatePreference('extended_hours', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Extended operating hours</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.public_transport}
                                    onCheckedChange={(checked) => updatePreference('public_transport', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Near public transportation</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.online_booking}
                                    onCheckedChange={(checked) => updatePreference('online_booking', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Online booking available</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.air_conditioned}
                                    onCheckedChange={(checked) => updatePreference('air_conditioned', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Air conditioned</span>
                                </label>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-foreground">Special Features</h3>
                              <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.pet_friendly}
                                    onCheckedChange={(checked) => updatePreference('pet_friendly', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Pet-friendly venues</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <Checkbox
                                    checked={preferences.senior_discounts}
                                    onCheckedChange={(checked) => updatePreference('senior_discounts', checked as boolean)}
                                    disabled={saving}
                                  />
                                  <span className="text-sm font-medium text-foreground">Senior discounts available</span>
                                </label>
                              </div>
                            </div>

                            <div className="pt-4 border-t">
                              <LanguageSelector />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="collections" className="mt-6">
                    <Card className="rounded-none border-0 shadow-sm">
                      <CardHeader className="pb-4 border-b bg-black text-white">
                        <CardTitle className="text-2xl font-bold">My Collections</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
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
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {collections.map((collection) => (
                              <div key={collection.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-lg">{collection.name}</h4>
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

                  <TabsContent value="saved" className="mt-6">
                    <Card className="rounded-none border-0 shadow-sm">
                      <CardHeader className="pb-4 border-b bg-black text-white">
                        <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {recentRestaurants.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium">No saved businesses yet</h4>
                              <p className="text-sm">Start exploring and save your favorite restaurants and businesses</p>
                              <Link to="/">
                                <Button variant="outline" className="rounded-none">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Start Exploring
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2">
                            {recentRestaurants.map((restaurant) => (
                              <div key={restaurant.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-lg">{restaurant.restaurant_name}</h4>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {restaurant.restaurant_address}, {restaurant.city}, {restaurant.country}
                                      </p>
                                      {restaurant.category && (
                                        <Badge variant="outline" className="text-xs">{restaurant.category}</Badge>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                                      className="text-muted-foreground hover:text-destructive"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Saved on {new Date(restaurant.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          <Footer />
        </>
      )}
    </div>
  );
};

export default Dashboard;