import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, MapPin, Calendar, Plus, Clock, Copy, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileContainer from '@/components/MobileContainer';
import { toast } from 'sonner';
import { format } from 'date-fns';
import heroImage from "@/assets/hero-members.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateInvitationDialog } from "@/components/CreateInvitationDialog";
import { MemberCard } from "@/components/MemberCard";
import { MemberVisitHistory } from "@/components/member/MemberVisitHistory";

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
  venues: {
    business_name: string;
    address: string;
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
  const navigate = useNavigate();
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
          venues (
            business_name,
            address
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
    <MobileContainer>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Section - Mobile Optimized */}
        <div className="relative w-full h-48 md:h-64 mb-4">
          <img 
            src={heroImage} 
            alt="Member Dashboard" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">My Dashboard</h1>
              <p className="text-sm md:text-lg">Welcome back</p>
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
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6">
              <TabsTrigger value="card" className="text-xs p-2">
                Card
              </TabsTrigger>
              <TabsTrigger value="visits" className="text-xs p-2">
                Visits
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs p-2">
                Prefs
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-xs p-2">
                Recent
              </TabsTrigger>
              <TabsTrigger value="collections" className="text-xs p-2">
                Lists
              </TabsTrigger>
              <TabsTrigger value="invitations" className="text-xs p-2">
                Events
              </TabsTrigger>
            </TabsList>

            {/* My Card Tab */}
            <TabsContent value="card" className="space-y-4">
              <MemberCard />
            </TabsContent>

            {/* Visit History Tab */}
            <TabsContent value="visits" className="space-y-4">
              <MemberVisitHistory />
            </TabsContent>
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-lg font-bold">
                    Your Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-center mb-4 text-muted-foreground">
                    Customize your recommendations
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="wheelchair_access" 
                        checked={preferences.wheelchair_access} 
                        onCheckedChange={checked => handlePreferenceChange('wheelchair_access', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="wheelchair_access" className="text-sm font-medium cursor-pointer flex-1">
                        ♿ Wheelchair Access
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="senior_discounts" 
                        checked={preferences.senior_discounts} 
                        onCheckedChange={checked => handlePreferenceChange('senior_discounts', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="senior_discounts" className="text-sm font-medium cursor-pointer flex-1">
                        💰 Senior Discounts
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="extended_hours" 
                        checked={preferences.extended_hours} 
                        onCheckedChange={checked => handlePreferenceChange('extended_hours', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="extended_hours" className="text-sm font-medium cursor-pointer flex-1">
                        🕐 Extended Hours
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="low_noise" 
                        checked={preferences.low_noise} 
                        onCheckedChange={checked => handlePreferenceChange('low_noise', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="low_noise" className="text-sm font-medium cursor-pointer flex-1">
                        🔇 Quiet Environment
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="public_transport" 
                        checked={preferences.public_transport} 
                        onCheckedChange={checked => handlePreferenceChange('public_transport', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="public_transport" className="text-sm font-medium cursor-pointer flex-1">
                        🚌 Public Transport
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="air_conditioned" 
                        checked={preferences.air_conditioned} 
                        onCheckedChange={checked => handlePreferenceChange('air_conditioned', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="air_conditioned" className="text-sm font-medium cursor-pointer flex-1">
                        ❄️ Air Conditioned
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="outdoor_seating" 
                        checked={preferences.outdoor_seating} 
                        onCheckedChange={checked => handlePreferenceChange('outdoor_seating', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="outdoor_seating" className="text-sm font-medium cursor-pointer flex-1">
                        🌳 Outdoor Seating
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="gluten_free" 
                        checked={preferences.gluten_free} 
                        onCheckedChange={checked => handlePreferenceChange('gluten_free', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="gluten_free" className="text-sm font-medium cursor-pointer flex-1">
                        🌾 Gluten-Free Options
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="pet_friendly" 
                        checked={preferences.pet_friendly} 
                        onCheckedChange={checked => handlePreferenceChange('pet_friendly', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="pet_friendly" className="text-sm font-medium cursor-pointer flex-1">
                        🐕 Pet-Friendly
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                      <Checkbox 
                        id="online_booking" 
                        checked={preferences.online_booking} 
                        onCheckedChange={checked => handlePreferenceChange('online_booking', checked as boolean)}
                        className="h-5 w-5"
                      />
                      <label htmlFor="online_booking" className="text-sm font-medium cursor-pointer flex-1">
                        💻 Online Booking
                      </label>
                    </div>

                    <div className="p-3 border rounded bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">🌍 Language</span>
                        <Button variant="outline" size="sm" onClick={showLanguagePopup}>
                          Change
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button 
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="w-full px-6 py-3 text-sm"
                      >
                        {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
              <Card>
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-lg font-bold">
                    My Collections
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {collections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="space-y-3">
                        <h4 className="text-base font-medium">No collections yet</h4>
                        <p className="text-sm">Start saving restaurants</p>
                        <Link to="/">
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Explore
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {collections.map((collection) => (
                        <div key={collection.id} className="p-3 border rounded bg-muted/30">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{collection.name}</h4>
                            {collection.description && (
                              <p className="text-xs text-muted-foreground">{collection.description}</p>
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

            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-lg font-bold">
                    Recent Places
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {recentRestaurants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="space-y-3">
                        <h4 className="text-base font-medium">No saved places yet</h4>
                        <p className="text-sm">Start exploring</p>
                        <Link to="/">
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Find Places
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="p-3 border rounded bg-muted/30">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <h4 className="font-medium text-sm">{restaurant.restaurant_name}</h4>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="text-xs">{restaurant.restaurant_address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{restaurant.city}, {restaurant.country}</span>
                                {restaurant.category && (
                                  <Badge variant="outline" className="text-xs">{restaurant.category}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedRestaurant(restaurant);
                                  setShowCreateInvitation(true);
                                }}
                                className="flex-1 text-xs"
                              >
                                <Users className="h-3 w-3 mr-1" />
                                Invite
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRestaurant(restaurant.id)}
                                className="text-destructive hover:text-destructive text-xs"
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
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
              <Card>
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-lg font-bold">
                    My Invitations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {invitations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-3" />
                      <h4 className="text-base font-medium">No invitations yet</h4>
                      <p className="text-sm">Start planning with friends</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invitations.map((invitation) => {
                        const responseCounts = getResponseCounts(invitation.invitation_rsvps);
                        const totalGuests = invitation.invitation_rsvps
                          .filter(rsvp => rsvp.response === 'yes')
                          .reduce((sum, rsvp) => sum + rsvp.guest_count, 0);

                        return (
                          <div key={invitation.id} className="p-3 border rounded bg-muted/30">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold truncate">{invitation.group_name}</h4>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs truncate">{invitation.venues.business_name}</span>
                                  </div>
                                </div>
                                <Badge variant={getStatusColor(invitation.status, invitation.rsvp_deadline)} className="text-xs">
                                  {getStatusText(invitation.status, invitation.rsvp_deadline)}
                                </Badge>
                              </div>

                              {/* Date Info */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs font-medium">Event</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(invitation.proposed_date), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* RSVP Summary */}
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                    ✓ {responseCounts.yes}
                                  </Badge>
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                    ? {responseCounts.maybe}
                                  </Badge>
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                    ✗ {responseCounts.no}
                                  </Badge>
                                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                                    ⏳ {responseCounts.pending}
                                  </Badge>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyInviteLink(invitation.invite_token)}
                                  className="flex-1 text-xs"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="flex-1 text-xs"
                                >
                                  <a 
                                    href={`/rsvp/${invitation.invite_token}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
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
            </TabsContent>
          </Tabs>
        </div>

        <CreateInvitationDialog
          open={showCreateInvitation}
          onOpenChange={setShowCreateInvitation}
          restaurant={selectedRestaurant}
        />

        <Footer />
      </div>
    </MobileContainer>
  );
};

export default MemberDashboard;