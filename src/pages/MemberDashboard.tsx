import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Phone, Globe, Plus, Calendar, Users, Clock, Copy, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { format } from 'date-fns';
import heroImage from "@/assets/hero-members.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateInvitationDialog } from "@/components/CreateInvitationDialog";

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

interface GroupInvitation {
  id: string;
  group_name: string;
  proposed_date: string;
  rsvp_deadline: string;
  custom_message: string;
  status: string;
  invite_token: string;
  created_at: string;
  saved_restaurants: {
    restaurant_name: string;
    restaurant_address: string;
    city: string;
    country: string;
  };
  invitation_rsvps: Array<{
    id: string;
    invitee_email: string;
    response: string;
    guest_count: number;
    response_message: string;
    responded_at: string;
  }>;
}

const MemberDashboard = () => {
  const { user, signOut } = useAuth();
  const { showLanguagePopup } = useLanguage();
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
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<SavedRestaurant | null>(null);
  const [showCreateInvitation, setShowCreateInvitation] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    await Promise.all([
      loadUserPreferences(),
      loadCollections(),
      loadRecentRestaurants(),
      loadInvitations()
    ]);
    setLoading(false);
  };

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
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
      console.error('Error loading preferences:', error);
    }
  };

  const loadCollections = async () => {
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
      console.error('Error loading collections:', error);
    }
  };

  const loadRecentRestaurants = async () => {
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
      console.error('Error loading restaurants:', error);
    }
  };

  const loadInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          saved_restaurants (
            restaurant_name,
            restaurant_address,
            city,
            country
          ),
          invitation_rsvps (
            id,
            invitee_email,
            response,
            guest_count,
            response_message,
            responded_at
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
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

      if (error) throw error;
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
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

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  const getResponseCounts = (rsvps: any[]) => {
    const counts = { yes: 0, no: 0, maybe: 0, pending: 0 };
    rsvps.forEach(rsvp => {
      counts[rsvp.response as keyof typeof counts]++;
    });
    return counts;
  };

  const getStatusColor = (status: string, deadline: string) => {
    if (status === 'cancelled') return 'destructive';
    if (new Date() > new Date(deadline)) return 'secondary';
    return 'default';
  };

  const getStatusText = (status: string, deadline: string) => {
    if (status === 'cancelled') return 'Cancelled';
    if (new Date() > new Date(deadline)) return 'Expired';
    return 'Active';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
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
          <img src={heroImage} alt="Member Dashboard" className="w-full h-full object-cover" />
          
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-3xl font-bold mb-2 md:text-6xl lg:text-7xl">My Dashboard</h1>
              <p className="text-sm md:text-lg">Welcome back, {user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header with navigation */}
          <div className="flex items-center justify-between">
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

          {/* My Preferences Section */}
          <Card className="w-full">
            <CardHeader className="bg-background">
              <CardTitle className="text-center border-b-2 border-black pb-2 text-3xl text-foreground font-extrabold">
                MY DASHBOARD
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-center mb-8 text-gray-700">
                Update your preferences below to personalize your restaurant recommendations.
              </p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="wheelchair_access" 
                      checked={preferences.wheelchair_access} 
                      onCheckedChange={checked => handlePreferenceChange('wheelchair_access', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="wheelchair_access" className="text-lg font-medium cursor-pointer">
                      ♿ Wheelchair Access Required
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="senior_discounts" 
                      checked={preferences.senior_discounts} 
                      onCheckedChange={checked => handlePreferenceChange('senior_discounts', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="senior_discounts" className="text-lg font-medium cursor-pointer">
                      💰 Senior Discounts Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="extended_hours" 
                      checked={preferences.extended_hours} 
                      onCheckedChange={checked => handlePreferenceChange('extended_hours', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="extended_hours" className="text-lg font-medium cursor-pointer">
                      🕐 Extended Open Hours
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="low_noise" 
                      checked={preferences.low_noise} 
                      onCheckedChange={checked => handlePreferenceChange('low_noise', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="low_noise" className="text-lg font-medium cursor-pointer">
                      🔇 Quiet Environment
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="public_transport" 
                      checked={preferences.public_transport} 
                      onCheckedChange={checked => handlePreferenceChange('public_transport', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="public_transport" className="text-lg font-medium cursor-pointer">
                      🚌 Easy Public Transport Access
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="air_conditioned" 
                      checked={preferences.air_conditioned} 
                      onCheckedChange={checked => handlePreferenceChange('air_conditioned', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="air_conditioned" className="text-lg font-medium cursor-pointer">
                      ❄️ Air Conditioned
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="outdoor_seating" 
                      checked={preferences.outdoor_seating} 
                      onCheckedChange={checked => handlePreferenceChange('outdoor_seating', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="outdoor_seating" className="text-lg font-medium cursor-pointer">
                      🌳 Outdoor Seating Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="gluten_free" 
                      checked={preferences.gluten_free} 
                      onCheckedChange={checked => handlePreferenceChange('gluten_free', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="gluten_free" className="text-lg font-medium cursor-pointer">
                      🌾 Gluten-Free Options
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="pet_friendly" 
                      checked={preferences.pet_friendly} 
                      onCheckedChange={checked => handlePreferenceChange('pet_friendly', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="pet_friendly" className="text-lg font-medium cursor-pointer">
                      🐕 Pet-Friendly
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="online_booking" 
                      checked={preferences.online_booking} 
                      onCheckedChange={checked => handlePreferenceChange('online_booking', checked as boolean)}
                      className="h-6 w-6"
                    />
                    <label htmlFor="online_booking" className="text-lg font-medium cursor-pointer">
                      💻 Online Booking Available
                    </label>
                  </div>

                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-medium">🌍 Preferred Language:</span>
                      <Button variant="outline" onClick={showLanguagePopup}>
                        Change Language
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="px-8 py-3 text-lg"
                  >
                    {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Collections Section */}
          <Card className="w-full">
            <CardHeader className="bg-background">
              <CardTitle className="text-center border-b-2 border-black pb-2 text-3xl text-foreground font-extrabold">
                MY COLLECTIONS
              </CardTitle>
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
                <div className="space-y-4">
                  {collections.map((collection) => (
                    <div key={collection.id} className="p-4 border rounded-lg w-full">
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

          {/* Recent Saved Places Section */}
          <Card className="w-full">
            <CardHeader className="bg-background">
              <CardTitle className="text-center border-b-2 border-black pb-2 text-3xl text-foreground font-extrabold">
                RECENT SAVED PLACES
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {recentRestaurants.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">No saved restaurants yet</h4>
                    <p className="text-sm">Start exploring and save your favorite places</p>
                    <Link to="/">
                      <Button variant="outline" className="rounded-none">
                        <Plus className="h-4 w-4 mr-2" />
                        Find Restaurants
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRestaurants.map((restaurant) => (
                    <div key={restaurant.id} className="p-4 border rounded-lg w-full">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg">{restaurant.restaurant_name}</h4>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{restaurant.restaurant_address}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{restaurant.city}, {restaurant.country}</span>
                            {restaurant.category && (
                              <Badge variant="outline" className="text-xs">{restaurant.category}</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Saved on {format(new Date(restaurant.created_at), 'PPP')}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedRestaurant(restaurant);
                              setShowCreateInvitation(true);
                            }}
                            className="rounded-none w-full"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Create Invitation
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRestaurant(restaurant.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none w-full"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Invitations Section */}
          <Card className="w-full">
            <CardHeader className="bg-background">
              <CardTitle className="text-center border-b-2 border-black pb-2 text-3xl text-foreground font-extrabold">
                MY INVITATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {invitations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <h4 className="text-lg font-medium">No invitations yet</h4>
                  <p className="text-sm">Start planning trips with friends by creating your first group invitation from your saved places!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {invitations.map((invitation) => {
                    const responseCounts = getResponseCounts(invitation.invitation_rsvps);
                    const totalGuests = invitation.invitation_rsvps
                      .filter(rsvp => rsvp.response === 'yes')
                      .reduce((sum, rsvp) => sum + rsvp.guest_count, 0);

                    return (
                      <div key={invitation.id} className="p-6 border rounded-lg w-full">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h4 className="text-xl font-semibold">{invitation.group_name}</h4>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">{invitation.saved_restaurants.restaurant_name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {invitation.saved_restaurants.restaurant_address}, {invitation.saved_restaurants.city}
                              </p>
                            </div>
                            <Badge variant={getStatusColor(invitation.status, invitation.rsvp_deadline)}>
                              {getStatusText(invitation.status, invitation.rsvp_deadline)}
                            </Badge>
                          </div>

                          {/* Date & Time Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Event Date</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(invitation.proposed_date), 'PPP')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">RSVP Deadline</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(invitation.rsvp_deadline), 'PPP')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* RSVP Summary */}
                          <div className="space-y-2">
                            <h5 className="font-medium">RSVP Responses</h5>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                ✓ {responseCounts.yes} Yes ({totalGuests} guests)
                              </Badge>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                ? {responseCounts.maybe} Maybe
                              </Badge>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                ✗ {responseCounts.no} No
                              </Badge>
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                ⏳ {responseCounts.pending} Pending
                              </Badge>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyInviteLink(invitation.invite_token)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a 
                                href={`/rsvp/${invitation.invite_token}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View RSVP Page
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateInvitationDialog
        open={showCreateInvitation}
        onOpenChange={setShowCreateInvitation}
        restaurant={selectedRestaurant}
      />

      <Footer />
    </div>
  );
};

export default MemberDashboard;